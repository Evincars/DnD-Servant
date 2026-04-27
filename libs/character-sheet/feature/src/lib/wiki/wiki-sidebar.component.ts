import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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

@Component({
  selector: 'wiki-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  template: `
    <div class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <!-- Toggle button -->
      <button
        class="sidebar__toggle"
        (click)="collapsed.set(!collapsed())"
        [title]="collapsed() ? 'Rozbalit nabídku' : 'Sbalit nabídku'"
      >
        <mat-icon>{{ collapsed() ? 'menu_open' : 'menu' }}</mat-icon>
      </button>

      @if (!collapsed()) {
        <div class="sidebar__content">
          <h3 class="sidebar__heading">J&amp;D Wiki</h3>

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
                    <li class="chapter" [class.chapter--active]="isActive(book, chapter)" (click)="selectChapter(book, chapter)">
                      {{ chapter.label }}
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      height: 100%;
    }

    .sidebar {
      width: 280px;
      min-width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(18, 10, 4, 0.98) 0%, rgba(12, 7, 2, 0.99) 100%);
      border-right: 1px solid rgba(200, 160, 60, 0.2);
      transition:
        width 0.2s ease,
        min-width 0.2s ease;
      overflow: hidden;
      position: relative;
    }

    .sidebar--collapsed {
      width: 44px;
      min-width: 44px;
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
      border-bottom: 1px solid rgba(200, 160, 60, 0.15);
      color: #8a7a68;
      cursor: pointer;
      transition:
        color 0.15s,
        background 0.15s;

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

    /* ── Scrollable content ── */
    .sidebar__content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 0 40px;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(200, 160, 60, 0.25);
        border-radius: 2px;
      }
    }

    .sidebar__heading {
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(200, 160, 60, 0.5);
      padding: 16px 16px 8px;
      margin: 0;
      border-bottom: 1px solid rgba(200, 160, 60, 0.12);
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
      transition:
        color 0.15s,
        background 0.15s;

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
      font-family: 'Mikadan', sans-serif;
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
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: 0.05em;
      color: #5e5448;
      border-bottom: 1px solid rgba(200, 160, 60, 0.04);
      cursor: pointer;
      transition:
        color 0.12s,
        background 0.12s;
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

  private readonly elRef = inject(ElementRef<HTMLElement>);
  /** Set to true when the sidebar needs to scroll to the active chapter after the next render. */
  private readonly needsScroll = signal(false);

  constructor() {
    // When activeBookId changes (e.g. from a search result), expand the correct
    // book in the sidebar and scroll the active chapter item into view.
    effect(
      () => {
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
      },
    );

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
    this.chapterSelect.emit({ book, chapter });
  }

  isActive(book: WikiBook, chapter: WikiChapter): boolean {
    return this.activeBookId() === book.id && this.activeChapterId() === chapter.id;
  }
}
