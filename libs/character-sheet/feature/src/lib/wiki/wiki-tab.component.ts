import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { WikiSidebarComponent } from './wiki-sidebar.component';
import { WikiContentComponent } from './wiki-content.component';
import { WikiSearchComponent } from './wiki-search.component';
import { WikiBook, WikiChapter, WikiSelection, WIKI_CATALOG } from './wiki-catalog.const';
import { LocalStorageService, WIKI_LAST_POSITION_KEY } from '@dn-d-servant/util';
import { slugify } from './wiki-utils';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'wiki-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WikiSidebarComponent, WikiContentComponent, WikiSearchComponent, MatIcon],
  template: `
    <div class="wiki-root">
      <!-- Toolbar with search -->
      <div class="wiki-toolbar">
        <!-- Mobile/tablet sidebar toggle -->
        <button
          class="wiki-toolbar__sidebar-btn"
          (click)="sidebarCollapsed.set(!sidebarCollapsed())"
          [title]="sidebarCollapsed() ? 'Otevřít navigaci' : 'Zavřít navigaci'"
          aria-label="Přepnout postranní panel"
        >
          <mat-icon>{{ sidebarCollapsed() ? 'menu' : 'menu_open' }}</mat-icon>
        </button>
        <wiki-search (chapterSelect)="onChapterSelect($event)" />
      </div>

      <!-- Main layout: sidebar (absolute overlay) + content (always full-width) -->
      <div class="wiki-layout">
        <!-- Backdrop: visible on mobile/tablet when sidebar is open -->
        @if (!sidebarCollapsed()) {
          <div class="wiki-backdrop" (click)="sidebarCollapsed.set(true)" aria-hidden="true"></div>
        }

        <wiki-sidebar
          [(collapsed)]="sidebarCollapsed"
          [activeBookId]="activeBook()?.id ?? null"
          [activeChapterId]="activeChapter()?.id ?? null"
          (chapterSelect)="onChapterSelect($event)"
        />
        <wiki-content #contentRef class="wiki-content-host" />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      height: 100%;
    }

    .wiki-root {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(10, 6, 2, 0.99) 0%, rgba(16, 10, 4, 0.98) 100%);
      overflow: hidden;
    }

    /* ── Toolbar ── */
    .wiki-toolbar {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(200, 160, 60, 0.12);
      background: rgba(12, 7, 2, 0.98);
      flex-shrink: 0;
      gap: 8px;
    }

    /* Mobile toggle — always visible in the toolbar */
    .wiki-toolbar__sidebar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      background: transparent;
      border: 1px solid rgba(200, 160, 60, 0.2);
      border-radius: 6px;
      color: #8a7a68;
      cursor: pointer;
      transition: color 0.15s, background 0.15s, border-color 0.15s;

      &:hover {
        color: #c8a03c;
        background: rgba(200, 160, 60, 0.08);
        border-color: rgba(200, 160, 60, 0.4);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* On desktop keep the toolbar search centered */
    wiki-search {
      flex: 1;
    }

    /* ── Sidebar + content row ── */
    .wiki-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative; /* anchor for the absolutely-positioned sidebar */
    }

    /* Content always takes the full width — sidebar floats over it */
    .wiki-content-host {
      flex: 1;
      min-width: 0;
    }

    /* ── Backdrop (mobile/tablet only) ── */
    .wiki-backdrop {
      display: none; /* hidden on desktop */
      position: absolute;
      inset: 0;
      z-index: 15; /* below sidebar (z-index: 20) but above content */
      background: rgba(0, 0, 0, 0.55);
      cursor: pointer;
    }

    @media (max-width: 1023px) {
      .wiki-backdrop {
        display: block;
      }
    }
  `,
})
export class WikiTabComponent implements AfterViewInit {
  private readonly ls = inject(LocalStorageService);

  readonly contentRef = viewChild.required<WikiContentComponent>('contentRef');

  /** Collapsed by default on mobile/tablet (<= 1023 px), expanded on desktop. */
  readonly sidebarCollapsed = signal(
    typeof window !== 'undefined' && window.innerWidth <= 1023,
  );
  readonly activeBook = signal<WikiBook | null>(null);
  readonly activeChapter = signal<WikiChapter | null>(null);

  ngAfterViewInit(): void {
    // URL fragment takes precedence over saved position
    if (!this.handleUrlFragment()) {
      this.restoreLastPosition();
    }
  }

  onChapterSelect(selection: WikiSelection): void {
    this.activeBook.set(selection.book);
    this.activeChapter.set(selection.chapter);

    // Close sidebar automatically on mobile/tablet after selecting a chapter
    if (typeof window !== 'undefined' && window.innerWidth <= 1023) {
      this.sidebarCollapsed.set(true);
    }

    this.ls.setDataSync(WIKI_LAST_POSITION_KEY, {
      bookId: selection.book.id,
      chapterId: selection.chapter.id,
    });

    this.contentRef().loadFromChapter(selection.book, selection.chapter, selection.headingSlug);
  }

  /**
   * On initial load, parse `#wiki/{bookId}/{chapterId}/{headingSlug}` from the
   * URL and navigate directly to that location (enables shared links).
   * @returns `true` if a valid fragment was found and navigation was triggered.
   */
  private handleUrlFragment(): boolean {
    const hash = window.location.hash;
    if (!hash.startsWith('#wiki/')) return false;

    // parts: ['wiki', bookId, chapterId, headingSlug?]
    const parts = hash.slice(1).split('/');
    if (parts.length < 3) return false;

    const bookId = parts[1];
    const chapterSlug = parts[2];
    const headingSlug = parts[3] as string | undefined;

    const book = WIKI_CATALOG.find(b => b.id === bookId);
    if (!book) return false;

    const chapter = book.chapters.find(c => {
      const slug = slugify(c.file.replace(/\.md$/i, '').split('/').pop() ?? c.file);
      return slug === chapterSlug;
    });
    if (!chapter) return false;

    this.activeBook.set(book);
    this.activeChapter.set(chapter);
    this.contentRef().loadFromChapter(book, chapter, headingSlug);
    return true;
  }

  /**
   * Restore the last viewed wiki position from LocalStorage.
   * Used on startup when no URL fragment is present.
   */
  private restoreLastPosition(): void {
    const saved = this.ls.getDataSync<{ bookId: string; chapterId: string }>(WIKI_LAST_POSITION_KEY);
    if (!saved?.bookId || !saved?.chapterId) return;

    const book = WIKI_CATALOG.find(b => b.id === saved.bookId);
    if (!book) return;

    const chapter = book.chapters.find(c => c.id === saved.chapterId);
    if (!chapter) return;

    this.activeBook.set(book);
    this.activeChapter.set(chapter);
    this.contentRef().loadFromChapter(book, chapter);
  }
}
