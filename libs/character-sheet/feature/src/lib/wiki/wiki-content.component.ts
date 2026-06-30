import {
  afterRenderEffect,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WikiBook, WikiChapter } from './wiki-catalog.const';
import { WikiService } from './wiki.service';
import { MatIcon } from '@angular/material/icon';

export interface TocEntry {
  level: number; // 2–5
  text: string;
  slug: string;
}

interface LoadedChunk {
  chapterId: string;
  label: string;
  html: SafeHtml;
  toc: TocEntry[];
}

/** Extract h2–h5 headings (with id attributes) from a raw HTML string. */
function extractToc(html: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const re = /<(h[2-5])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const level = parseInt(m[1].charAt(1), 10);
    const slug = m[2];
    const text = m[3].replace(/<[^>]+>/g, '').trim();
    if (text) entries.push({ level, text, slug });
  }
  return entries;
}

const CHAPTERS_PER_LOAD = 2;
/** Pixels to offset from the top of the scroll container so the heading clears the fixed top-menu. */
const SCROLL_TOP_OFFSET = 160;

@Component({
  selector: 'wiki-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  templateUrl: './wiki-content.component.html',
  styleUrl: './wiki-content.component.scss',
})
export class WikiContentComponent implements AfterViewInit, OnDestroy {
  private readonly wikiService = inject(WikiService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');
  readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

  readonly chunks = signal<LoadedChunk[]>([]);
  readonly loading = signal(false);
  /** The book currently being rendered — set imperatively on chapter select */
  protected readonly currentBook = signal<WikiBook | null>(null);
  private nextIndex = 0;
  private observer: IntersectionObserver | null = null;
  /** Heading slug to scroll to after the next batch of chunks renders. */
  private readonly pendingScrollSlug = signal<string | null>(null);

  readonly hasMore = computed(() => {
    const book = this.currentBook();
    if (!book) return false;
    return this.nextIndex < book.chapters.length;
  });

  constructor() {
    /**
     * Deferred scroll-to-heading effect — used when the target element is NOT
     * yet in the DOM (e.g. navigating from search to a chapter that must first
     * be loaded via HTTP).
     *
     * Tracks both `pendingScrollSlug` and `chunks` so it re-executes each time
     * a new content batch arrives, without needing a MutationObserver.
     *
     * For TOC clicks the element is already in the DOM, so `scrollToHeadingSlug`
     * calls `scrollIntoView` directly and never sets this signal.
     */
    afterRenderEffect(() => {
      const slug = this.pendingScrollSlug();
      if (!slug) return;

      // Re-execute when chunks update (async HTTP content arrives in DOM).
      const chunks = this.chunks();

      untracked(() => {
        const container = this.scrollContainer()?.nativeElement;
        if (!container) return;

        const el = container.querySelector(`[id="${slug}"]`) as HTMLElement | null;
        if (!el) return; // not yet rendered — will retry on next chunks update

        this.pendingScrollSlug.set(null);
        el.scrollIntoView({ behavior: chunks.length > 0 ? 'smooth' : ('instant' as ScrollBehavior), block: 'start' });
      });
    });
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupObserver(): void {
    this.observer?.disconnect();
    const sentinelEl = this.sentinel()?.nativeElement;
    if (!sentinelEl) return;

    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !this.loading() && this.hasMore()) {
          this.loadNext();
        }
      },
      { root: this.scrollContainer().nativeElement, threshold: 0.1 },
    );
    this.observer.observe(sentinelEl);
  }

  /**
   * Load the chapter's book starting at the given chapter.
   * @param scrollToSlug  Optional heading ID to scroll to after load (from URL fragment).
   */
  loadFromChapter(book: WikiBook, chapter: WikiChapter, scrollToSlug?: string): void {
    this.currentBook.set(book);
    this.pendingScrollSlug.set(scrollToSlug ?? null);
    const chapterIndex = book.chapters.findIndex(c => c.id === chapter.id);

    const container = this.scrollContainer().nativeElement;
    container.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    this.chunks.set([]);
    this.nextIndex = chapterIndex;
    this.loadNext();
  }

  loadNext(): void {
    const book = this.currentBook();
    if (!book || this.loading() || this.nextIndex >= book.chapters.length) return;

    this.loading.set(true);
    const toLoad = book.chapters.slice(this.nextIndex, this.nextIndex + CHAPTERS_PER_LOAD);
    this.nextIndex += toLoad.length;

    let remaining = toLoad.length;
    const results: Array<LoadedChunk | null> = new Array(toLoad.length).fill(null);

    toLoad.forEach((chapter, i) => {
      this.wikiService.loadChapter(book.id, chapter.file).subscribe({
        next: html => {
          results[i] = {
            chapterId: chapter.id,
            label: chapter.label,
            html: this.sanitizer.bypassSecurityTrustHtml(html),
            toc: extractToc(html),
          };
          remaining--;
          if (remaining === 0) {
            this.chunks.update(prev => [...prev, ...(results.filter(Boolean) as LoadedChunk[])]);
            this.loading.set(false);
          }
        },
        error: () => {
          remaining--;
          if (remaining === 0) {
            this.chunks.update(prev => [...prev, ...(results.filter(Boolean) as LoadedChunk[])]);
            this.loading.set(false);
          }
        },
      });
    });
  }

  /**
   * Scroll to a heading by its slug (called from the chapter TOC).
   *
   * The content IS already in the DOM when the TOC is visible, so we query
   * and scroll immediately without going through the signal/effect cycle.
   * Falls back to the deferred `pendingScrollSlug` path only when the element
   * is somehow not in the DOM yet.
   */
  scrollToHeadingSlug(slug: string): void {
    const container = this.scrollContainer().nativeElement;
    const el = container.querySelector(`[id="${slug}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.pendingScrollSlug.set(slug);
    }
  }

  /** Handle clicks on heading anchor buttons via event delegation. */
  onContentClick(event: MouseEvent): void {
    const btn = (event.target as HTMLElement).closest('[data-anchor]') as HTMLElement | null;
    if (!btn) return;

    event.preventDefault();
    event.stopPropagation();

    const anchorId = btn.getAttribute('data-anchor');
    if (!anchorId) return;

    const fragment = `#${anchorId}`;
    const url = `${window.location.origin}${window.location.pathname}${fragment}`;

    window.history.replaceState(null, '', fragment);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }

    // Brief green flash to confirm copy — removed via animationend, no setTimeout needed
    btn.classList.remove('heading-anchor--copied'); // reset if already animating
    // force reflow so re-adding the class restarts the animation
    void btn.offsetWidth;
    btn.classList.add('heading-anchor--copied');
    btn.addEventListener('animationend', () => btn.classList.remove('heading-anchor--copied'), { once: true });
  }
}
