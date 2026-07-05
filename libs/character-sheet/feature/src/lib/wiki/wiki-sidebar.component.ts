import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { WikiBook, WikiChapter, WikiSelection, WIKI_CATALOG } from './wiki-catalog.const';
import { escapeHtml, highlightMatch } from './wiki-utils';

interface SearchResult {
  book: WikiBook;
  chapter: WikiChapter;
  bookHtml: string;
  chapterHtml: string;
}

@Component({
  selector: 'wiki-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  template: `
    <div class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <!-- Header row: toggle + title -->
      <div class="sidebar__header">
        <button
          class="sidebar__toggle"
          (click)="collapsed.set(!collapsed())"
          [title]="collapsed() ? 'Rozbalit nabídku' : 'Sbalit nabídku'"
          aria-label="Přepnout postranní panel"
        >
          <mat-icon>{{ collapsed() ? 'menu_open' : 'menu' }}</mat-icon>
        </button>
        @if (!collapsed()) {
          <h3 class="sidebar__heading">J&amp;D Wiki</h3>
        }
      </div>

      @if (!collapsed()) {
        <!-- Search bar -->
        <div class="sidebar__search-wrap">
          <span class="material-symbols-outlined sidebar__search-icon">search</span>
          <input
            #searchInput
            class="sidebar__search"
            type="search"
            placeholder="Hledat v obsahu…"
            [value]="filter()"
            (input)="filter.set($any($event.target).value)"
            aria-label="Hledat ve wiki"
          />
          @if (filter()) {
            <button class="sidebar__search-clear" (click)="filter.set('')" aria-label="Vymazat hledání">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>

        <div class="sidebar__content">
          @if (filter()) {
            <!-- Flat search results -->
            @if (searchResults().length === 0) {
              <div class="sidebar__no-results">Žádné výsledky</div>
            }
            @for (result of searchResults(); track result.chapter.id) {
              <div
                class="search-result"
                [class.search-result--active]="isActive(result.book, result.chapter)"
                (click)="selectChapter(result.book, result.chapter)"
                role="button"
                tabindex="0"
                (keydown.enter)="selectChapter(result.book, result.chapter)"
              >
                <div class="search-result__book" [innerHTML]="result.bookHtml"></div>
                <div class="search-result__chapter" [innerHTML]="result.chapterHtml"></div>
              </div>
            }
          } @else {
            <!-- Normal book accordion -->
            @for (book of catalog; track book.id) {
              <div class="book" [class.book--active]="expandedBook() === book.id">
                <button class="book__header" (click)="toggleBook(book.id)">
                  <mat-icon class="book__icon">{{ book.icon }}</mat-icon>
                  <span class="book__label">{{ book.label }}</span>
                  <mat-icon class="book__chevron">
                    {{ expandedBook() === book.id ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </button>

                @if (expandedBook() === book.id) {
                  <ul class="book__chapters">
                    @for (chapter of book.chapters; track chapter.id) {
                      <li
                        class="chapter"
                        [class.chapter--active]="isActive(book, chapter)"
                        (click)="selectChapter(book, chapter)"
                      >
                        {{ chapter.label }}
                      </li>
                    }
                  </ul>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: `
    /* ── Host: absolutely positioned so it never participates in the flex layout
       and collapsing/expanding never causes a layout reflow of the content. ── */
    :host {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      z-index: 20;
      /* pointer-events only on the sidebar element itself */
      pointer-events: none;
    }

    .sidebar {
      pointer-events: all;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(18, 10, 4, 0.98) 0%, rgba(12, 7, 2, 0.99) 100%);
      border-right: 1px solid rgba(200, 160, 60, 0.2);
      /* GPU-composited transform — zero layout reflow */
      transform: translateX(0);
      transition: transform 0.22s ease;
      overflow: hidden;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
    }

    /* Desktop collapsed: slide left so only the 44 px toggle strip is visible */
    .sidebar--collapsed {
      transform: translateX(-236px); /* 280 - 44 = 236 */
    }

    /* Mobile / tablet: fully hide the sidebar when collapsed */
    @media (max-width: 1023px) {
      .sidebar--collapsed {
        transform: translateX(-100%);
      }
    }

    /* ── Header row ── */
    .sidebar__header {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(200, 160, 60, 0.15);
    }

    /* ── Toggle button ── */
    .sidebar__toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: #8a7a68;
      cursor: pointer;
      transition: color 0.15s, background 0.15s;

      &:hover {
        color: #c8a03c;
        background: rgba(200, 160, 60, 0.06);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .sidebar__heading {
      font-family: sans-serif;
      font-size: 13px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(200, 160, 60, 0.5);
      padding: 0 16px 0 4px;
      margin: 0;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Search bar ── */
    .sidebar__search-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 8px 10px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(200, 160, 60, 0.18);
      border-radius: 6px;
      flex-shrink: 0;

      &:focus-within {
        border-color: rgba(200, 160, 60, 0.45);
        background: rgba(255, 255, 255, 0.06);
      }
    }

    .sidebar__search-icon {
      font-size: 16px;
      color: rgba(200, 160, 60, 0.4);
      flex-shrink: 0;
      font-family: 'Material Symbols Outlined', sans-serif;
    }

    .sidebar__search {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #d4b880;
      font-size: 12px;
      min-width: 0;

      &::placeholder {
        color: rgba(200, 160, 60, 0.3);
      }

      /* Hide browser's native search-clear button */
      &::-webkit-search-cancel-button { display: none; }
    }

    .sidebar__search-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: rgba(200, 160, 60, 0.4);
      cursor: pointer;
      padding: 0;
      border-radius: 3px;

      &:hover { color: #c8a03c; }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    /* ── Scrollable content ── */
    .sidebar__content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 0 40px;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb {
        background: rgba(200, 160, 60, 0.25);
        border-radius: 2px;
      }
    }

    .sidebar__no-results {
      padding: 16px;
      font-size: 11px;
      color: rgba(200, 160, 60, 0.35);
      text-align: center;
      font-family: sans-serif;
    }

    /* ── Search results ── */
    .search-result {
      padding: 8px 14px;
      border-bottom: 1px solid rgba(200, 160, 60, 0.06);
      cursor: pointer;
      transition: background 0.12s;

      &:hover { background: rgba(200, 160, 60, 0.06); }
    }

    .search-result--active {
      background: rgba(180, 80, 20, 0.15) !important;
      border-left: 2px solid rgba(210, 120, 40, 0.6);
      padding-left: 12px;
    }

    .search-result__book {
      font-size: 9.5px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(200, 160, 60, 0.4);
      font-family: sans-serif;
      margin-bottom: 2px;

      ::ng-deep mark.hl {
        background: rgba(200, 160, 60, 0.35);
        color: #f0c080;
        border-radius: 2px;
        padding: 0 1px;
      }
    }

    .search-result__chapter {
      font-size: 11px;
      color: #9a8878;
      font-family: sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      ::ng-deep mark.hl {
        background: rgba(200, 160, 60, 0.35);
        color: #f0c080;
        border-radius: 2px;
        padding: 0 1px;
      }
    }

    /* ── Book accordion ── */
    .book__header {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 10px 14px 10px 12px;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(200, 160, 60, 0.07);
      color: #7a6a58;
      cursor: pointer;
      gap: 8px;
      text-align: left;
      transition: color 0.15s, background 0.15s;

      &:hover {
        color: #c8a03c;
        background: rgba(200, 160, 60, 0.05);
      }
    }

    .book--active .book__header {
      color: #e0a060;
      background: rgba(200, 100, 30, 0.08);
    }

    .book__icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .book__label {
      flex: 1;
      font-family: sans-serif;
      font-size: 11.5px;
      letter-spacing: 0.08em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .book__chevron {
      font-size: 16px;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    /* ── Chapters list ── */
    .book__chapters {
      list-style: none;
      margin: 0;
      padding: 0;
      background: rgba(0, 0, 0, 0.25);
    }

    .chapter {
      padding: 7px 16px 7px 36px;
      font-family: sans-serif;
      font-size: 11px;
      letter-spacing: 0.05em;
      color: #5e5448;
      border-bottom: 1px solid rgba(200, 160, 60, 0.04);
      cursor: pointer;
      transition: color 0.12s, background 0.12s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        color: #b89060;
        background: rgba(200, 160, 60, 0.06);
      }
    }

    .chapter--active {
      color: #f0c080 !important;
      background: rgba(180, 80, 20, 0.15) !important;
      border-left: 2px solid rgba(210, 120, 40, 0.6);
      padding-left: 34px;
    }
  `,
})
export class WikiSidebarComponent {
  readonly collapsed = model<boolean>(false);
  readonly activeBookId = input<string | null>(null);
  readonly activeChapterId = input<string | null>(null);
  readonly chapterSelect = output<WikiSelection>();

  readonly catalog = WIKI_CATALOG;
  readonly expandedBook = signal<string | null>(null);
  readonly filter = signal('');

  private readonly elRef = inject(ElementRef<HTMLElement>);
  /** Set to true when the sidebar needs to scroll to the active chapter after the next render. */
  private readonly needsScroll = signal(false);

  /** Flat list of chapters matching the current filter query. */
  readonly searchResults = computed((): SearchResult[] => {
    const q = this.filter();
    if (!q.trim()) return [];
    const results: SearchResult[] = [];
    for (const book of WIKI_CATALOG) {
      const bookHtmlBase = highlightMatch(book.label, q);
      for (const chapter of book.chapters) {
        const chapterHtml = highlightMatch(chapter.label, q);
        // Include if chapter label matches, or if book label matches
        if (chapterHtml !== null || bookHtmlBase !== null) {
          results.push({
            book,
            chapter,
            bookHtml: bookHtmlBase ?? escapeHtml(book.label),
            chapterHtml: chapterHtml ?? escapeHtml(chapter.label),
          });
        }
      }
    }
    return results;
  });

  constructor() {
    // When activeBookId changes (e.g. from a search result), expand the correct
    // book in the sidebar and scroll the active chapter item into view.
    effect(() => {
      const bookId = this.activeBookId();
      if (!bookId) return;

      this.expandedBook.set(bookId);

      // Use untracked so `collapsed` is NOT a reactive dependency of this effect.
      // Without this, every user click to collapse re-triggers the effect which
      // immediately un-collapses the sidebar again.
      if (untracked(() => this.collapsed())) {
        this.collapsed.set(false);
      }

      this.needsScroll.set(true);
    });

    // After Angular renders (and the chapter list is in the DOM), scroll to the
    // active chapter. Retries automatically on every render cycle until the element
    // appears. Uses afterRenderEffect instead of setTimeout to stay zone-less safe.
    afterRenderEffect(() => {
      if (!this.needsScroll()) return;
      const activeEl = this.elRef.nativeElement.querySelector('.chapter--active') as HTMLElement | null;
      if (!activeEl) return; // not in DOM yet — next render cycle will retry
      this.needsScroll.set(false);
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  toggleBook(bookId: string): void {
    this.expandedBook.update(current => (current === bookId ? null : bookId));
  }

  selectChapter(book: WikiBook, chapter: WikiChapter): void {
    this.filter.set('');
    this.chapterSelect.emit({ book, chapter });
  }

  isActive(book: WikiBook, chapter: WikiChapter): boolean {
    return this.activeBookId() === book.id && this.activeChapterId() === chapter.id;
  }
}
