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
    <div class="content-wrap" #scrollContainer (click)="onContentClick($event)">

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
      font-family: sans-serif;
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
      margin: 0 auto;
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
       Note: nested selectors apply to [innerHTML] content because only the
       .wiki-body ancestor needs the Angular _ngcontent attribute, not its
       descendants. All styling here therefore reaches injected HTML.
    ══════════════════════════════════════════════════════════════════════ */
    .wiki-body {
      font-family: sans-serif;
      font-size: 14.5px;
      line-height: 1.78;
      color: #c8baa8;

      /* ── Headings ── */
      h1, h2 {
        font-family: 'Mikadan', sans-serif;
        font-size: 22px;
        letter-spacing: .08em;
        margin: 2em 0 .6em;
        padding-bottom: 6px;
        background: linear-gradient(90deg, #e8c870, #c07a30);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        border-bottom: 1px solid rgba(200,160,60,.2);
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
      }

      h3 {
        font-family: 'Mikadan', sans-serif;
        font-size: 16px;
        letter-spacing: .06em;
        color: #d4a060;
        margin: 1.6em 0 .5em;
        padding-bottom: 3px;
        border-bottom: 1px solid rgba(200,160,60,.12);
        display: flex;
        align-items: center;
        gap: 2px;
      }

      h4 {
        font-family: 'Mikadan', sans-serif;
        font-size: 13.5px;
        letter-spacing: .06em;
        color: #b89060;
        margin: 1.4em 0 .4em;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      h5, h6 {
        font-family: 'Mikadan', sans-serif;
        font-size: 12.5px;
        color: #9a7a58;
        margin: 1.2em 0 .3em;
        display: flex;
        align-items: center;
        gap: 2px;
      }

      /* ── Heading anchor button ── */
      .heading-anchor {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        background: none;
        border: none;
        padding: 0 5px;
        cursor: pointer;
        color: transparent;
        -webkit-text-fill-color: initial;
        transition: color .14s, transform .12s;
        line-height: 1;

        .anchor-svg {
          display: block;
          width: 18px;
          height: 18px;
        }
      }

      h1:hover .heading-anchor,
      h2:hover .heading-anchor,
      h3:hover .heading-anchor,
      h4:hover .heading-anchor,
      h5:hover .heading-anchor,
      h6:hover .heading-anchor,
      .heading-anchor:focus {
        color: rgba(210,45,30,.85);
      }

      .heading-anchor:hover {
        color: #e83020 !important;
        transform: scale(1.15);
      }

      .heading-anchor--copied {
        color: rgba(60,210,110,.95) !important;
        transform: scale(1.2) !important;
        transition: none !important;
      }

      /* ── Body text ── */
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
        border-collapse: separate;
        border-spacing: 0;
        margin: 1.6em 0;
        font-size: 13px;
        display: block;
        overflow-x: auto;
        border: 1px solid rgba(160,100,30,.35);
        border-radius: 4px;
        box-shadow: 0 2px 12px rgba(0,0,0,.35);

        &::-webkit-scrollbar { height: 4px; }
        &::-webkit-scrollbar-thumb { background: rgba(200,160,60,.25); border-radius: 2px; }

        thead tr {
          background:
            linear-gradient(180deg,
              rgba(90,45,10,.9) 0%,
              rgba(65,30,6,.95) 100%);
        }

        th {
          padding: 10px 16px;
          text-align: left;
          color: #e8c060;
          letter-spacing: .1em;
          font-size: 10.5px;
          text-transform: uppercase;
          font-family: 'Mikadan', sans-serif;
          white-space: nowrap;
          border-bottom: 2px solid rgba(200,140,40,.5);
          border-right: 1px solid rgba(200,140,40,.12);

          &:last-child { border-right: none; }
        }

        td {
          padding: 8px 16px;
          border-bottom: 1px solid rgba(200,160,60,.07);
          border-right: 1px solid rgba(200,160,60,.05);
          color: #baa898;
          vertical-align: top;
          line-height: 1.5;

          &:last-child { border-right: none; }
        }

        tbody tr:nth-child(odd)  td { background: rgba(200,160,60,.03); }
        tbody tr:nth-child(even) td { background: rgba(0,0,0,.12); }

        tbody tr:hover td {
          background: rgba(200,130,30,.1) !important;
          color: #d8c8b0;
        }

        tbody tr:last-child td { border-bottom: none; }
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
        font-family: monospace;
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
        font-family: 'Mikadan', sans-serif;
      }

      /* ═══════════════════════════════════════════════════════════════
         Monster stat block — classic D&D style
      ═══════════════════════════════════════════════════════════════ */
      .monster-card {
        margin: 2em 0;
        max-width: 560px;
        position: relative;
        font-family: sans-serif;

        /* outer "aged parchment" shadow */
        background: linear-gradient(170deg,
          rgba(20,11,4,.98) 0%,
          rgba(16,9,3,.99) 100%);
        border-top: 5px solid #7c1d0c;
        border-bottom: 5px solid #7c1d0c;
        border-left: 1px solid rgba(140,65,20,.4);
        border-right: 1px solid rgba(140,65,20,.4);
        box-shadow:
          0 0 0 1px rgba(80,25,8,.8),
          4px 4px 18px rgba(0,0,0,.7),
          inset 0 0 40px rgba(120,50,10,.04);
      }

      /* ── Name & type ── */
      .mc-head {
        padding: 14px 20px 12px;
      }

      .mc-name {
        font-family: 'Mikadan', sans-serif;
        font-size: 22px;
        letter-spacing: .04em;
        color: #7c1d0c;
        line-height: 1.15;
      }

      .mc-type {
        font-size: 12.5px;
        color: #888070;
        font-style: italic;
        margin-top: 1px;
      }

      /* ── Ornamental double-rule (thick + thin) ── */
      .mc-rule {
        height: 7px;
        margin: 0;
        background:
          linear-gradient(180deg,
            rgba(130,40,15,.0)   0%,
            rgba(130,40,15,.0)  20%,
            rgba(130,40,15,.85) 20%,
            rgba(130,40,15,.85) 55%,
            rgba(130,40,15,.0)  55%,
            rgba(130,40,15,.0)  65%,
            rgba(130,40,15,.45) 65%,
            rgba(130,40,15,.45) 80%,
            rgba(130,40,15,.0)  80%);
      }

      /* ── AC / HP / Speed ── */
      .mc-basics {
        padding: 8px 20px 6px;
      }

      .mc-row {
        font-size: 13.5px;
        color: #c8baa8;
        line-height: 1.7;
      }

      .mc-label {
        font-family: 'Mikadan', sans-serif;
        font-size: 13px;
        color: #7c1d0c;
        font-weight: bold;
        margin-right: 4px;
      }

      /* ── Ability scores ── */
      .mc-abilities {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        text-align: center;
        padding: 8px 12px 6px;
      }

      .mc-ab {
        line-height: 1.35;
        padding: 4px 2px;
        border-right: 1px solid rgba(130,40,15,.2);

        &:last-child { border-right: none; }
      }

      .mc-ab-name {
        font-family: 'Mikadan', sans-serif;
        font-size: 9px;
        letter-spacing: .18em;
        text-transform: uppercase;
        color: #7c1d0c;
        margin-bottom: 3px;
      }

      .mc-ab-val {
        font-size: 13px;
        color: #c8baa8;
      }

      /* ── Details (skills, senses, languages, CR) ── */
      .mc-details {
        padding: 6px 20px 8px;
      }

      .mc-row + .mc-row { margin-top: 1px; }

      /* ── Body: traits, actions, reactions ── */
      .mc-body {
        padding: 8px 20px 16px;
        font-size: 13.5px;
        color: #c8baa8;

        p { margin: 0 0 .5em; }

        /* Section headers: h5 "Akce", h6 "Reakce" etc. */
        h5, h6 {
          display: block !important;
          font-family: 'Mikadan', sans-serif;
          font-size: 19px;
          letter-spacing: .03em;
          font-weight: normal;
          color: #7c1d0c;
          border-bottom: 1px solid rgba(130,40,15,.4);
          padding-bottom: 2px;
          margin: 14px 0 8px;
          text-transform: none;

          .heading-anchor { display: none !important; }
        }

        /* Trait / ability names: ***Bold-italic.*** */
        p em strong, p strong em {
          color: #d0b878;
          font-style: normal;
        }

        /* Italic flavour / attack type text */
        p > em { color: #9a8870; }
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
  /** Heading slug to scroll to after the first batch of chunks loads */
  private pendingScrollSlug: string | null = null;

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

  /**
   * Load the chapter's book starting at the given chapter.
   * @param scrollToSlug  Optional heading ID to scroll to after load (from URL fragment).
   */
  loadFromChapter(book: WikiBook, chapter: WikiChapter, scrollToSlug?: string): void {
    this.currentBook.set(book);
    this.pendingScrollSlug = scrollToSlug ?? null;
    const chapterIndex = book.chapters.findIndex(c => c.id === chapter.id);

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
            this.maybScrollToSlug();
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

  /** If a heading slug was requested (via URL fragment), scroll to it after render. */
  private maybScrollToSlug(): void {
    if (!this.pendingScrollSlug) return;
    const slug = this.pendingScrollSlug;
    this.pendingScrollSlug = null;

    // Give Angular one tick to render the new chunks into the DOM
    setTimeout(() => {
      const el = this.scrollContainer().nativeElement.querySelector(`#${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
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

    // Brief green flash to confirm copy
    btn.classList.add('heading-anchor--copied');
    setTimeout(() => btn.classList.remove('heading-anchor--copied'), 1600);
  }
}
