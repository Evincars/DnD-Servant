import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { WikiSidebarComponent } from './wiki-sidebar.component';
import { WikiContentComponent } from './wiki-content.component';
import { WikiSearchComponent } from './wiki-search.component';
import { WikiBook, WikiChapter, WikiSelection, WIKI_CATALOG } from './wiki-catalog.const';
import { LocalStorageService, WIKI_LAST_POSITION_KEY } from '@dn-d-servant/util';
import { slugify } from './wiki-utils';

@Component({
  selector: 'wiki-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WikiSidebarComponent, WikiContentComponent, WikiSearchComponent],
  template: `
    <div class="wiki-root">
      <!-- Toolbar with search -->
      <div class="wiki-toolbar">
        <wiki-search (chapterSelect)="onChapterSelect($event)" />
      </div>

      <!-- Main layout: sidebar + content -->
      <div class="wiki-layout">
        <wiki-sidebar
          [(collapsed)]="sidebarCollapsed"
          [activeBookId]="activeBook()?.id ?? null"
          [activeChapterId]="activeChapter()?.id ?? null"
          (chapterSelect)="onChapterSelect($event)"
        />
        <wiki-content #contentRef />
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
      gap: 12px;
    }

    /* ── Sidebar + content row ── */
    .wiki-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  `,
})
export class WikiTabComponent implements AfterViewInit {
  private readonly ls = inject(LocalStorageService);

  readonly contentRef = viewChild.required<WikiContentComponent>('contentRef');

  readonly sidebarCollapsed = signal(false);
  readonly activeBook = signal<WikiBook | null>(null);
  readonly activeChapter = signal<WikiChapter | null>(null);

  ngAfterViewInit(): void {
    this.handleUrlFragment();
  }

  onChapterSelect(selection: WikiSelection): void {
    this.activeBook.set(selection.book);
    this.activeChapter.set(selection.chapter);

    this.ls.setDataSync(WIKI_LAST_POSITION_KEY, {
      bookId: selection.book.id,
      chapterId: selection.chapter.id,
    });

    this.contentRef().loadFromChapter(selection.book, selection.chapter, selection.headingSlug);
  }

  /**
   * On initial load, parse `#wiki/{bookId}/{chapterId}/{headingSlug}` from the
   * URL and navigate directly to that location (enables shared links).
   */
  private handleUrlFragment(): void {
    const hash = window.location.hash;
    if (!hash.startsWith('#wiki/')) return;

    // parts: ['wiki', bookId, chapterId, headingSlug?]
    const parts = hash.slice(1).split('/');
    if (parts.length < 3) return;

    const bookId = parts[1];
    const chapterSlug = parts[2];
    const headingSlug = parts[3] as string | undefined;

    const book = WIKI_CATALOG.find(b => b.id === bookId);
    if (!book) return;

    const chapter = book.chapters.find(c => {
      const slug = slugify(c.file.replace(/\.md$/i, '').split('/').pop() ?? c.file);
      return slug === chapterSlug;
    });
    if (!chapter) return;

    this.activeBook.set(book);
    this.activeChapter.set(chapter);
    this.contentRef().loadFromChapter(book, chapter, headingSlug);
  }
}
