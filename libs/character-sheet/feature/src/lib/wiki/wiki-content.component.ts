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
import { MatSnackBar } from '@angular/material/snack-bar';
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
    // Remove the anchor <button> (contains the "link" icon text) before stripping tags
    const text = m[3]
      .replace(/<button[\s\S]*?<\/button>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (text) entries.push({ level, text, slug });
  }
  return entries;
}

const CHAPTERS_PER_LOAD = 2;
/** Gap (px) kept above the heading so it isn't flush against the container edge. */
const SCROLL_HEADING_OFFSET = 24;

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
  private readonly snackBar = inject(MatSnackBar);

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
        this.scrollHeadingIntoView(el);
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
  /**
   * Walk up the DOM from `el` and return the first ancestor whose computed
   * `overflow-y` is `auto` or `scroll` AND whose content actually overflows
   * (scrollHeight > clientHeight).  Falls back to `document.documentElement`.
   *
   * This is necessary because `content-wrap` has `overflow-y: auto` but the
   * Material tab body forces `height: auto` on its wrapper, which can make
   * `content-wrap`'s scrollHeight equal its clientHeight — meaning it has
   * nothing to scroll.  The real scroll container may be an outer element.
   */
  private findScrollContainer(el: HTMLElement): HTMLElement {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.documentElement) {
      const oy = getComputedStyle(node).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return document.documentElement;
  }

  /** Same as findScrollContainer but also considers `el` itself (used for scroll-to-top/bottom). */
  private findScrollContainerInclusive(el: HTMLElement): HTMLElement {
    let node: HTMLElement | null = el;
    while (node && node !== document.documentElement) {
      const oy = getComputedStyle(node).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return document.documentElement;
  }

  /** Scroll to the very top of the wiki content area. */
  scrollContentToTop(): void {
    const sc = this.findScrollContainerInclusive(this.scrollContainer().nativeElement);
    sc.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Scroll to the very bottom of the wiki content area. */
  scrollContentToBottom(): void {
    const sc = this.findScrollContainerInclusive(this.scrollContainer().nativeElement);
    sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' });
  }

  /**
   * Scroll `el` into view by scrolling only the nearest scrollable ancestor.
   * Unlike `scrollIntoView()`, this never scrolls outer containers such as
   * the window, preventing the heading from landing behind the top toolbar.
   */
  private scrollHeadingIntoView(el: HTMLElement): void {
    const sc = this.findScrollContainer(el);
    const scRect = sc.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scrollTarget = sc.scrollTop + (elRect.top - scRect.top) - SCROLL_HEADING_OFFSET;
    sc.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
  }

  /**
   * Scroll to a heading by its slug (called from the chapter TOC).
   * The element is already in the DOM when the TOC is visible.
   */
  scrollToHeadingSlug(slug: string): void {
    const container = this.scrollContainer().nativeElement;
    const el = container.querySelector(`[id="${slug}"]`) as HTMLElement | null;
    if (el) {
      this.scrollHeadingIntoView(el);
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
      navigator.clipboard
        .writeText(url)
        .then(() =>
          this.snackBar.open('🔗 Odkaz zkopírován do schránky', '✕', {
            duration: 2500,
            verticalPosition: 'top',
            panelClass: ['snackbar--save'],
          }),
        )
        .catch(() => {});
    }

    // Brief green flash to confirm copy — removed via animationend, no setTimeout needed
    btn.classList.remove('heading-anchor--copied'); // reset if already animating
    // force reflow so re-adding the class restarts the animation
    void btn.offsetWidth;
    btn.classList.add('heading-anchor--copied');
    btn.addEventListener('animationend', () => btn.classList.remove('heading-anchor--copied'), { once: true });
  }
}
