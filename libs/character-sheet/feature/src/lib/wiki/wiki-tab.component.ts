import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { WikiSidebarComponent, WikiSelection } from './wiki-sidebar.component';
import { WikiContentComponent } from './wiki-content.component';
import { WikiBook, WikiChapter } from './wiki-catalog.const';
import { LocalStorageService, WIKI_LAST_POSITION_KEY } from '@dn-d-servant/util';

@Component({
  selector: 'wiki-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WikiSidebarComponent, WikiContentComponent],
  template: `
    <div class="wiki-layout">
      <wiki-sidebar
        [(collapsed)]="sidebarCollapsed"
        [activeBookId]="activeBook()?.id ?? null"
        [activeChapterId]="activeChapter()?.id ?? null"
        (chapterSelect)="onChapterSelect($event)"
      />
      <wiki-content #contentRef />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      height: 100%;
    }

    .wiki-layout {
      display: flex;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(10,6,2,.99) 0%, rgba(16,10,4,.98) 100%);
      overflow: hidden;
    }
  `,
})
export class WikiTabComponent {
  private readonly ls = inject(LocalStorageService);

  readonly contentRef = viewChild.required<WikiContentComponent>('contentRef');

  readonly sidebarCollapsed = signal(false);
  readonly activeBook = signal<WikiBook | null>(null);
  readonly activeChapter = signal<WikiChapter | null>(null);

  onChapterSelect(selection: WikiSelection): void {
    this.activeBook.set(selection.book);
    this.activeChapter.set(selection.chapter);

    this.ls.setDataSync(WIKI_LAST_POSITION_KEY, {
      bookId: selection.book.id,
      chapterId: selection.chapter.id,
    });

    this.contentRef().loadFromChapter(selection.book, selection.chapter);
  }
}
