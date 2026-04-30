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

interface LoadedChunk {
  chapterId: string;
  label: string;
  html: SafeHtml;
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
     * Scroll-to-heading via afterRenderEffect.
     * Only tracks `pendingScrollSlug` — when set, it queries the DOM for the
     * heading element. If the element isn't found yet (async HTML not painted),
     * a one-shot MutationObserver waits for it without keeping the render loop busy.
     */
    afterRenderEffect(() => {
      const slug = this.pendingScrollSlug();
      if (!slug) return;

      // Don't track any other signals — we only want to re-run when slug changes
      untracked(() => {
        const container = this.scrollContainer()?.nativeElement;
        if (!container) return;

        const el = container.querySelector(`[id="${slug}"]`) as HTMLElement | null;
        if (el) {
          this.pendingScrollSlug.set(null);
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const absoluteTop = container.scrollTop + (elRect.top - containerRect.top);
          container.scrollTo({ top: Math.max(0, absoluteTop - SCROLL_TOP_OFFSET), behavior: 'instant' as ScrollBehavior });
        } else {
          // Element not in DOM yet — observe mutations and retry once it appears
          const mo = new MutationObserver(() => {
            const target = container.querySelector(`[id="${slug}"]`) as HTMLElement | null;
            if (target) {
              mo.disconnect();
              this.pendingScrollSlug.set(null);
              const cRect = container.getBoundingClientRect();
              const tRect = target.getBoundingClientRect();
              const top = container.scrollTop + (tRect.top - cRect.top);
              container.scrollTo({ top: Math.max(0, top - SCROLL_TOP_OFFSET), behavior: 'instant' as ScrollBehavior });
            }
          });
          mo.observe(container, { childList: true, subtree: true });
        }
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
