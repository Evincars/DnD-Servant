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
  ViewEncapsulation,
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
  encapsulation: ViewEncapsulation.None,
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
    /* ══════════════════════════════════════════════════════════════
       ViewEncapsulation.None — all selectors scoped under wiki-content
    ══════════════════════════════════════════════════════════════ */
    wiki-content {
      display: flex;
      flex: 1;
      min-width: 0;
      height: 100%;
      overflow: hidden;
    }

    /* ── Scrollable wrapper ── */
    wiki-content .content-wrap {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 0 40px;
      scroll-behavior: smooth;
    }
    wiki-content .content-wrap::-webkit-scrollbar { width: 6px; }
    wiki-content .content-wrap::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
    wiki-content .content-wrap::-webkit-scrollbar-thumb {
      background: rgba(200,160,60,.3);
      border-radius: 3px;
    }

    /* ── Placeholder ── */
    wiki-content .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      opacity: .35;
    }
    wiki-content .placeholder__icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #c8a03c;
    }
    wiki-content .placeholder__text {
      font-family: 'Mikadan', sans-serif;
      font-size: 14px;
      letter-spacing: .1em;
      color: #c8a03c;
    }

    /* ── Initial loading ── */
    wiki-content .loading-initial {
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
    wiki-content .spinner {
      width: 28px;
      height: 28px;
      border: 2px solid rgba(200,160,60,.2);
      border-top-color: rgba(200,160,60,.8);
      border-radius: 50%;
      animation: wiki-spin .8s linear infinite;
    }
    @keyframes wiki-spin { to { transform: rotate(360deg); } }

    /* ── Chapter article ── */
    wiki-content .chapter-article {
      padding: 32px 40px 24px;
      max-width: 860px;
      margin: 0 auto;
    }
    wiki-content .chapter-article__header {
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(200,160,60,.2);
    }
    wiki-content .chapter-article__label {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: rgba(200,160,60,.5);
    }

    /* ── Chapter divider ── */
    wiki-content .chapter-divider {
      max-width: 860px;
      margin: 0 auto;
      border: none;
      border-top: 1px solid rgba(200,160,60,.12);
    }

    /* ── Sentinel / load-more area ── */
    wiki-content .sentinel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      min-height: 80px;
    }
    wiki-content .load-more-btn {
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
    }
    wiki-content .load-more-btn:hover {
      color: #c8a03c;
      border-color: rgba(200,160,60,.5);
      background: rgba(200,160,60,.05);
    }
    wiki-content .end-of-book {
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: .18em;
      color: rgba(200,160,60,.4);
      margin: 0;
    }

    /* ══════════════════════════════════════════════════════════════════════
       Wiki body — DnD-styled markdown rendering (innerHTML content)
    ══════════════════════════════════════════════════════════════════════ */
    wiki-content .wiki-body {
      font-family: sans-serif;
      font-size: 14.5px;
      line-height: 1.78;
      color: #c8baa8;
    }

    /* ── Headings ── */
    wiki-content .wiki-body h1,
    wiki-content .wiki-body h2 {
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
      gap: 4px;
    }

    wiki-content .wiki-body h3 {
      font-family: 'Mikadan', sans-serif;
      font-size: 16px;
      letter-spacing: .06em;
      color: #d4a060;
      margin: 1.6em 0 .5em;
      padding-bottom: 3px;
      border-bottom: 1px solid rgba(200,160,60,.12);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    wiki-content .wiki-body h4 {
      font-family: 'Mikadan', sans-serif;
      font-size: 13.5px;
      letter-spacing: .06em;
      color: #b89060;
      margin: 1.4em 0 .4em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    wiki-content .wiki-body h5,
    wiki-content .wiki-body h6 {
      font-family: 'Mikadan', sans-serif;
      font-size: 12.5px;
      color: #9a7a58;
      margin: 1.2em 0 .3em;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ══════════════════════════════════════════════════════════════
       Heading anchor button — Material Symbols icon, red, no bg
    ══════════════════════════════════════════════════════════════ */
    wiki-content .wiki-body .heading-anchor {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      border-radius: 50%;
      padding: 0;
      margin-left: 4px;
      cursor: pointer;
      color: rgba(184, 73, 73, .3);
      -webkit-text-fill-color: initial;
      transition: color .15s, background .15s, transform .14s;
      line-height: 1;
      vertical-align: middle;
    }

    wiki-content .wiki-body .heading-anchor .anchor-icon {
      font-size: 20px;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
    }

    wiki-content .wiki-body h1:hover .heading-anchor,
    wiki-content .wiki-body h2:hover .heading-anchor,
    wiki-content .wiki-body h3:hover .heading-anchor,
    wiki-content .wiki-body h4:hover .heading-anchor,
    wiki-content .wiki-body h5:hover .heading-anchor,
    wiki-content .wiki-body h6:hover .heading-anchor,
    wiki-content .wiki-body .heading-anchor:focus-visible {
      color: #b84949;
      background: rgba(184, 73, 73, .1);
    }

    wiki-content .wiki-body .heading-anchor:hover {
      color: #d45050 !important;
      background: rgba(184, 73, 73, .15) !important;
      transform: scale(1.15);
    }

    wiki-content .wiki-body .heading-anchor:active {
      transform: scale(0.95);
    }

    wiki-content .wiki-body .heading-anchor--copied {
      color: rgba(60,210,110,.95) !important;
      background: rgba(60,210,110,.1) !important;
      transform: scale(1.15) !important;
      transition: none !important;
    }

    /* ── Body text ── */
    wiki-content .wiki-body p { margin: 0 0 .9em; }
    wiki-content .wiki-body strong { color: #d8b878; }
    wiki-content .wiki-body em { color: #b09070; font-style: italic; }

    wiki-content .wiki-body a {
      color: #c8a03c;
      text-decoration: none;
      border-bottom: 1px dashed rgba(200,160,60,.3);
    }
    wiki-content .wiki-body a:hover { border-bottom-style: solid; }

    wiki-content .wiki-body ul,
    wiki-content .wiki-body ol {
      padding-left: 1.6em;
      margin: 0 0 .9em;
    }
    wiki-content .wiki-body li { margin-bottom: .3em; }

    /* ══════════════════════════════════════════════════════════════
       Tables — DnD dark fantasy style with crimson/gold accents
    ══════════════════════════════════════════════════════════════ */
    wiki-content .wiki-body table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.8em 0;
      font-size: 13px;
      display: block;
      overflow-x: auto;
      border: 1px solid rgba(120,50,15,.5);
      border-top: 3px solid #8c1c0a;
      border-radius: 4px;
      box-shadow:
        0 4px 24px rgba(0,0,0,.6),
        0 0 0 1px rgba(80,25,8,.4),
        inset 0 1px 0 rgba(180,90,30,.08);
    }

    wiki-content .wiki-body table::-webkit-scrollbar { height: 4px; }
    wiki-content .wiki-body table::-webkit-scrollbar-thumb {
      background: rgba(200,160,60,.25);
      border-radius: 2px;
    }

    wiki-content .wiki-body thead tr {
      background: linear-gradient(180deg,
        rgba(85,18,6,.97) 0%,
        rgba(55,10,3,.98) 100%);
    }

    wiki-content .wiki-body th {
      padding: 11px 16px;
      text-align: left;
      color: #e8c060;
      letter-spacing: .12em;
      font-size: 10px;
      text-transform: uppercase;
      font-family: 'Mikadan', sans-serif;
      white-space: nowrap;
      border-bottom: 2px solid rgba(160,50,15,.7);
      border-right: 1px solid rgba(160,50,15,.2);
    }
    wiki-content .wiki-body th:last-child { border-right: none; }

    wiki-content .wiki-body td {
      padding: 8px 16px;
      border-bottom: 1px solid rgba(200,160,60,.06);
      border-right: 1px solid rgba(200,160,60,.04);
      color: #baa898;
      vertical-align: top;
      line-height: 1.55;
    }
    wiki-content .wiki-body td:first-child { color: #ccb898; }
    wiki-content .wiki-body td:last-child { border-right: none; }

    wiki-content .wiki-body tbody tr:nth-child(odd) td {
      background: rgba(160,100,30,.04);
    }
    wiki-content .wiki-body tbody tr:nth-child(even) td {
      background: rgba(0,0,0,.15);
    }
    wiki-content .wiki-body tbody tr:hover td {
      background: rgba(160,50,15,.1) !important;
      color: #d8c8b0;
      transition: background .12s, color .12s;
    }
    wiki-content .wiki-body tbody tr:last-child td { border-bottom: none; }

    /* ── Blockquotes ── */
    wiki-content .wiki-body blockquote {
      margin: 1em 0;
      padding: 12px 20px;
      border-left: 3px solid rgba(200,120,40,.5);
      background: rgba(180,100,30,.06);
      color: #a08060;
      font-style: italic;
      border-radius: 0 4px 4px 0;
    }

    /* ── Code ── */
    wiki-content .wiki-body code {
      background: rgba(200,160,60,.08);
      color: #c8a03c;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: .9em;
      font-family: monospace;
    }
    wiki-content .wiki-body pre {
      background: rgba(0,0,0,.4);
      border: 1px solid rgba(200,160,60,.15);
      padding: 16px;
      overflow-x: auto;
      border-radius: 4px;
    }
    wiki-content .wiki-body pre code {
      background: none;
      padding: 0;
      color: #b0c880;
    }

    wiki-content .wiki-body hr {
      border: none;
      border-top: 1px solid rgba(200,160,60,.15);
      margin: 1.5em 0;
    }

    /* ── VuePress card blocks ── */
    wiki-content .wiki-body .wiki-card {
      display: block;
      margin: 1.2em 0;
      padding: 14px 18px;
      background: rgba(160,120,60,.06);
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 4px;
      position: relative;
    }
    wiki-content .wiki-body .wiki-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 3px; height: 100%;
      background: rgba(200,160,60,.4);
      border-radius: 4px 0 0 4px;
    }
    wiki-content .wiki-body .wiki-card__header {
      display: block;
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #c8a03c;
      margin-bottom: 8px;
      font-family: 'Mikadan', sans-serif;
    }

    /* ══════════════════════════════════════════════════════════════
       Monster stat block — classic D&D stat block design
    ══════════════════════════════════════════════════════════════ */
    wiki-content .wiki-body .monster-card {
      margin: 2.5em auto;
      max-width: 580px;
      position: relative;
      font-family: sans-serif;
      background:
        linear-gradient(175deg,
          rgba(24,14,6,.97) 0%,
          rgba(14,8,3,.99) 50%,
          rgba(18,10,4,.98) 100%);
      border-top: 5px solid #8c1c0a;
      border-bottom: 5px solid #8c1c0a;
      border-left: 2px solid rgba(140,28,10,.45);
      border-right: 2px solid rgba(140,28,10,.45);
      border-radius: 0;
      box-shadow:
        0 0 0 1px rgba(60,12,4,.8),
        0 8px 40px rgba(0,0,0,.85),
        inset 0 0 60px rgba(80,20,5,.03);
    }

    /* corner fleur decorations */
    wiki-content .wiki-body .monster-card::before,
    wiki-content .wiki-body .monster-card::after {
      content: '⬥';
      position: absolute;
      color: rgba(140,28,10,.5);
      font-size: 8px;
      line-height: 1;
      pointer-events: none;
      z-index: 1;
    }
    wiki-content .wiki-body .monster-card::before { top: 5px; left: 8px; }
    wiki-content .wiki-body .monster-card::after  { top: 5px; right: 8px; }

    /* ── Name & type header ── */
    wiki-content .wiki-body .mc-head {
      padding: 16px 22px 12px;
      background: linear-gradient(180deg,
        rgba(80,16,5,.4) 0%,
        transparent 100%);
    }

    wiki-content .wiki-body .mc-name {
      font-family: 'Mikadan', sans-serif;
      font-size: 26px;
      letter-spacing: .04em;
      color: #b84949;
      line-height: 1.15;
      text-shadow:
        0 0 32px rgba(184,73,73,.3),
        0 1px 3px rgba(0,0,0,.8);
    }

    wiki-content .wiki-body .mc-type {
      font-size: 12px;
      color: #7a6850;
      font-style: italic;
      margin-top: 4px;
      letter-spacing: .03em;
    }

    /* ── Ornamental double-rule (thick + thin separator) ── */
    wiki-content .wiki-body .mc-rule {
      height: 7px;
      margin: 0 10px;
      background:
        linear-gradient(180deg,
          transparent 0%,
          transparent 14%,
          #8c1c0a 14%,
          #8c1c0a 52%,
          transparent 52%,
          transparent 62%,
          rgba(140,28,10,.45) 62%,
          rgba(140,28,10,.45) 78%,
          transparent 78%);
    }

    /* ── AC / HP / Speed ── */
    wiki-content .wiki-body .mc-basics {
      padding: 10px 22px 8px;
    }

    wiki-content .wiki-body .mc-row {
      font-size: 13.5px;
      color: #c0b098;
      line-height: 1.75;
    }

    wiki-content .wiki-body .mc-label {
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      color: #b84949;
      font-weight: bold;
      margin-right: 5px;
      letter-spacing: .01em;
    }

    /* ── Ability scores grid ── */
    wiki-content .wiki-body .mc-abilities {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      text-align: center;
      padding: 10px 14px 8px;
      background: rgba(80,15,5,.06);
    }

    wiki-content .wiki-body .mc-ab {
      line-height: 1.35;
      padding: 6px 3px;
      border-right: 1px solid rgba(140,28,10,.22);
    }
    wiki-content .wiki-body .mc-ab:last-child { border-right: none; }

    wiki-content .wiki-body .mc-ab-name {
      font-family: 'Mikadan', sans-serif;
      font-size: 9.5px;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: #b84949;
      margin-bottom: 4px;
      display: block;
    }

    wiki-content .wiki-body .mc-ab-val {
      font-size: 13.5px;
      color: #c0b098;
      display: block;
    }

    /* ── Details (skills, senses, languages, CR) ── */
    wiki-content .wiki-body .mc-details {
      padding: 8px 22px 10px;
    }

    wiki-content .wiki-body .mc-row + .mc-row { margin-top: 1px; }

    /* ── Body: traits, actions, reactions, legendary ── */
    wiki-content .wiki-body .mc-body {
      padding: 10px 22px 20px;
      font-size: 13.5px;
      color: #c0b098;
    }
    wiki-content .wiki-body .mc-body p { margin: 0 0 .55em; }

    /* Section sub-headers inside monster card */
    wiki-content .wiki-body .mc-body h5,
    wiki-content .wiki-body .mc-body h6 {
      display: block !important;
      font-family: 'Mikadan', sans-serif;
      font-size: 20px;
      letter-spacing: .03em;
      font-weight: normal;
      color: #b84949;
      border-bottom: 1px solid rgba(140,28,10,.4);
      padding-bottom: 3px;
      margin: 16px 0 8px;
      text-transform: none;
      text-shadow: 0 0 16px rgba(184,73,73,.15);
    }
    wiki-content .wiki-body .mc-body h5 .heading-anchor,
    wiki-content .wiki-body .mc-body h6 .heading-anchor {
      display: none !important;
    }

    /* Trait / ability names: ***Bold-italic.*** */
    wiki-content .wiki-body .mc-body p em strong,
    wiki-content .wiki-body .mc-body p strong em {
      color: #c8a868;
      font-style: normal;
    }
    /* Italic flavour / attack type text */
    wiki-content .wiki-body .mc-body p > em { color: #8a7860; }
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
