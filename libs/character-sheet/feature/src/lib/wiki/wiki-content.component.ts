import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
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

@Component({
  selector: 'wiki-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  template: `
    <div class="content-wrap" #scrollContainer>

      @if (!currentBook()) {
        <div class="placeholder">
          <mat-icon class="placeholder__icon">auto_stories</mat-icon>
          <p class="placeholder__text">Vyber knihu v postranním panelu</p>
        </div>
      }

      @if (currentBook() && chunks().length === 0 && loading()) {
        <div class="loading-initial">
          <div class="spinner"></div>
          <span>Načítám…</span>
        </div>
      }

      @for (chunk of chunks(); track chunk.chapterId) {
        <article class="chapter-article">
          <header class="chapter-article__header">
            <span class="chapter-article__label">{{ chunk.label }}</span>
          </header>
          <div class="chapter-article__body wiki-body" [innerHTML]="chunk.html"></div>
        </article>
        <hr class="chapter-divider" />
      }

      <!-- Sentinel for IntersectionObserver -->
      <div #sentinel class="sentinel">
        @if (loading()) {
          <div class="spinner"></div>
        }
        @if (!loading() && hasMore()) {
          <button class="load-more-btn" (click)="loadNext()">Načíst další kapitolu</button>
        }
        @if (!hasMore() && chunks().length > 0) {
          <p class="end-of-book">✦ Konec knihy ✦</p>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
      height: 100%;
      overflow: hidden;
    }

    /* ── Scrollable wrapper ── */
    .content-wrap {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 0 40px;
      scroll-behavior: smooth;

      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
      &::-webkit-scrollbar-thumb {
        background: rgba(200,160,60,.3);
        border-radius: 3px;
      }
    }

    /* ── Placeholder ── */
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      opacity: .35;
    }

    .placeholder__icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #c8a03c;
    }

    .placeholder__text {
      font-family: 'Mikadan', sans-serif;
      font-size: 14px;
      letter-spacing: .1em;
      color: #c8a03c;
    }

    /* ── Initial loading ── */
    .loading-initial {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      gap: 12px;
      color: #8a7a68;
      font-family: 'Mikadan', sans-serif;
      font-size: 12px;
    }

    /* ── Spinner ── */
    .spinner {
      width: 28px;
      height: 28px;
      border: 2px solid rgba(200,160,60,.2);
      border-top-color: rgba(200,160,60,.8);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Chapter article ── */
    .chapter-article {
      padding: 32px 40px 24px;
      max-width: 860px;
      margin: 0 auto;
    }

    .chapter-article__header {
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(200,160,60,.2);
    }

    .chapter-article__label {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: rgba(200,160,60,.5);
    }

    /* ── Chapter divider ── */
    .chapter-divider {
      max-width: 860px;
      margin: 0 auto 0;
      border: none;
      border-top: 1px solid rgba(200,160,60,.12);
    }

    /* ── Sentinel / load-more area ── */
    .sentinel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      min-height: 80px;
    }

    .load-more-btn {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: #8a7a68;
      background: transparent;
      border: 1px solid rgba(200,160,60,.2);
      padding: 8px 20px;
      cursor: pointer;
      transition: color .15s, border-color .15s, background .15s;

      &:hover {
        color: #c8a03c;
        border-color: rgba(200,160,60,.5);
        background: rgba(200,160,60,.05);
      }
    }

    .end-of-book {
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: .18em;
      color: rgba(200,160,60,.4);
      margin: 0;
    }

    /* ══════════════════════════════════════════════════════════════════════
       Wiki body — DnD-styled markdown rendering
    ══════════════════════════════════════════════════════════════════════ */
    .wiki-body {
      font-family: 'Mikadan', sans-serif;
      font-size: 14px;
      line-height: 1.75;
      color: #c8baa8;

      h1, h2 {
        font-size: 22px;
        letter-spacing: .08em;
        margin: 2em 0 .6em;
        padding-bottom: 6px;
        background: linear-gradient(90deg, #e8c870, #c07a30);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        border-bottom: 1px solid rgba(200,160,60,.2);
      }

      h3 {
        font-size: 16px;
        letter-spacing: .06em;
        color: #d4a060;
        margin: 1.6em 0 .5em;
        padding-bottom: 3px;
        border-bottom: 1px solid rgba(200,160,60,.12);
      }

      h4 {
        font-size: 13.5px;
        letter-spacing: .06em;
        color: #b89060;
        margin: 1.4em 0 .4em;
        text-transform: uppercase;
      }

      h5, h6 {
        font-size: 12.5px;
        color: #9a7a58;
        margin: 1.2em 0 .3em;
      }

      p { margin: 0 0 .9em; }

      strong { color: #d8b878; }
      em { color: #b09070; font-style: italic; }

      a {
        color: #c8a03c;
        text-decoration: none;
        border-bottom: 1px dashed rgba(200,160,60,.3);
        &:hover { border-bottom-style: solid; }
      }

      ul, ol {
        padding-left: 1.6em;
        margin: 0 0 .9em;

        li { margin-bottom: .3em; }
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.2em 0;
        font-size: 13px;

        thead tr {
          background: rgba(200,160,60,.1);
          border-bottom: 1px solid rgba(200,160,60,.3);
        }

        th {
          padding: 8px 12px;
          text-align: left;
          color: #c8a03c;
          letter-spacing: .06em;
          font-size: 11px;
          text-transform: uppercase;
        }

        td {
          padding: 7px 12px;
          border-bottom: 1px solid rgba(200,160,60,.07);
          color: #b0a090;
        }

        tr:hover td { background: rgba(200,160,60,.04); }
      }

      blockquote {
        margin: 1em 0;
        padding: 12px 20px;
        border-left: 3px solid rgba(200,120,40,.5);
        background: rgba(180,100,30,.06);
        color: #a08060;
        font-style: italic;
        border-radius: 0 4px 4px 0;
      }

      code {
        background: rgba(200,160,60,.08);
        color: #c8a03c;
        padding: 1px 5px;
        border-radius: 3px;
        font-size: .9em;
      }

      pre {
        background: rgba(0,0,0,.4);
        border: 1px solid rgba(200,160,60,.15);
        padding: 16px;
        overflow-x: auto;
        border-radius: 4px;

        code {
          background: none;
          padding: 0;
          color: #b0c880;
        }
      }

      hr {
        border: none;
        border-top: 1px solid rgba(200,160,60,.15);
        margin: 1.5em 0;
      }

      /* VuePress card blocks */
      .wiki-card {
        display: block;
        margin: 1.2em 0;
        padding: 14px 18px;
        background: rgba(160,120,60,.06);
        border: 1px solid rgba(200,160,60,.2);
        border-radius: 4px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
          background: rgba(200,160,60,.4);
          border-radius: 4px 0 0 4px;
        }
      }

      .wiki-card__header {
        display: block;
        font-size: 11px;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: #c8a03c;
        margin-bottom: 8px;
      }
    }
  `,
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

  readonly hasMore = computed(() => {
    const book = this.currentBook();
    if (!book) return false;
    return this.nextIndex < book.chapters.length;
  });

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

  /** Called when the user selects a chapter from the sidebar. */
  loadFromChapter(book: WikiBook, chapter: WikiChapter): void {
    this.currentBook.set(book);
    const chapterIndex = book.chapters.findIndex(c => c.id === chapter.id);

    // Scroll to top
    const container = this.scrollContainer().nativeElement;
    container.scrollTop = 0;

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
}








