import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WIKI_CATALOG, WikiBook, WikiChapter } from './wiki-catalog.const';
import { WikiSelection } from './wiki-sidebar.component';
import { normalizeStr } from './wiki-utils';

interface SearchEntry {
  label: string;
  bookLabel: string;
  book: WikiBook;
  chapter: WikiChapter;
  /** Pre-computed normalized label words for fast matching */
  _labelWords: string[];
  /** Pre-computed normalized filename words for fast matching */
  _fileWords: string[];
}

/** Build the search index once at module load time. */
const SEARCH_INDEX: SearchEntry[] = WIKI_CATALOG.flatMap(book =>
  book.chapters.map(chapter => {
    const filename = chapter.file.split('/').pop()?.replace(/\.md$/i, '') ?? chapter.id;
    const normalizedLabel = normalizeStr(chapter.label);
    const normalizedFile = normalizeStr(filename);
    return {
      label: chapter.label,
      bookLabel: book.label,
      book,
      chapter,
      _labelWords: normalizedLabel.split(/[\s\-–—_]+/).filter(Boolean),
      _fileWords: normalizedFile.split(/[\s\-_]+/).filter(Boolean),
    };
  }),
);

const MAX_RESULTS = 16;

function matchesQuery(entry: SearchEntry, nq: string): boolean {
  return (
    entry._labelWords.some(w => w.startsWith(nq)) ||
    entry._fileWords.some(w => w.startsWith(nq))
  );
}

@Component({
  selector: 'wiki-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="search-wrap">
      <div class="search-row">
        <!-- Search icon -->
        <svg class="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>

        <input
          #inputRef
          class="search-input"
          type="text"
          placeholder="Hledat v J&D Wiki…"
          autocomplete="off"
          spellcheck="false"
          [ngModel]="query()"
          (ngModelChange)="onQueryChange($event)"
          (keydown)="onKeyDown($event)"
          (focus)="open.set(true)"
          (blur)="onBlur()"
        />

        @if (query()) {
          <button class="clear-btn" (click)="clear()" tabindex="-1" title="Vymazat">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        }
      </div>

      @if (open() && results().length > 0) {
        <ul class="dropdown" role="listbox" #dropdownRef>
          @for (entry of results(); track entry.chapter.id; let i = $index) {
            <li
              class="result"
              [class.result--focused]="focusedIndex() === i"
              role="option"
              (mousedown)="select(entry)"
              (mouseenter)="focusedIndex.set(i)"
            >
              <span class="result__label">{{ entry.label }}</span>
              <span class="result__book">{{ entry.bookLabel }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host { display: block; position: relative; }

    .search-wrap { position: relative; }

    /* ── Input row ── */
    .search-row {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 5px 10px;
      background: rgba(22,12,4,.97);
      border: 1px solid rgba(200,160,60,.18);
      border-radius: 3px;
      min-width: 240px;
      transition: border-color .15s, box-shadow .15s;

      &:focus-within {
        border-color: rgba(200,160,60,.45);
        box-shadow: 0 0 0 1px rgba(200,160,60,.12);
      }
    }

    .search-icon { color: #5a4a38; flex-shrink: 0; }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-family: sans-serif;
      font-size: 13px;
      color: #c8baa8;
      min-width: 0;

      &::placeholder { color: #3e3028; }
    }

    .clear-btn {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #4a3a28;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color .12s;

      &:hover { color: #c8a03c; }
    }

    /* ── Dropdown ── */
    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: max(100%, 560px);
      max-height: 420px;
      overflow-y: auto;
      background: rgba(16,8,2,.99);
      border: 1px solid rgba(200,160,60,.25);
      border-radius: 3px;
      list-style: none;
      margin: 0;
      padding: 3px 0;
      z-index: 1000;
      box-shadow: 0 10px 28px rgba(0,0,0,.7), 0 2px 8px rgba(0,0,0,.4);

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb { background: rgba(200,160,60,.2); border-radius: 2px; }
    }

    /* ── Result item ── */
    .result {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 7px 13px;
      cursor: pointer;
      gap: 12px;
      border-bottom: 1px solid rgba(200,160,60,.04);
      transition: background .08s;

      &:last-child { border-bottom: none; }
    }

    .result--focused { background: rgba(200,160,60,.08); }

    .result__label {
      font-family: sans-serif;
      font-size: 13px;
      color: #c8baa8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result__book {
      font-family: sans-serif;
      font-size: 10.5px;
      color: #5a4a38;
      white-space: nowrap;
      flex-shrink: 0;
    }
  `,
})
export class WikiSearchComponent {
  readonly chapterSelect = output<WikiSelection>();

  readonly query = signal('');
  readonly open = signal(false);
  readonly focusedIndex = signal(0);

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  readonly results = computed<SearchEntry[]>(() => {
    const nq = normalizeStr(this.query().trim());
    if (nq.length < 1) return [];
    return SEARCH_INDEX.filter(e => matchesQuery(e, nq)).slice(0, MAX_RESULTS);
  });

  onQueryChange(value: string): void {
    this.query.set(value);
    this.focusedIndex.set(0);
    this.open.set(true);
  }

  onKeyDown(event: KeyboardEvent): void {
    const res = this.results();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update(i => Math.min(i + 1, res.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        const entry = res[this.focusedIndex()];
        if (entry) this.select(entry);
        break;
      }
      case 'Escape':
        this.open.set(false);
        (this.inputRef()?.nativeElement)?.blur();
        break;
    }
  }

  onBlur(): void {
    // Delay so mousedown on a result registers before we close
    setTimeout(() => this.open.set(false), 160);
  }

  select(entry: SearchEntry): void {
    this.chapterSelect.emit({ book: entry.book, chapter: entry.chapter });
    this.query.set('');
    this.open.set(false);
  }

  clear(): void {
    this.query.set('');
    this.open.set(false);
    this.inputRef()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEscapeGlobal(): void {
    if (this.open()) this.open.set(false);
  }
}




