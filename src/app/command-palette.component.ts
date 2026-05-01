import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { LocalStorageService, ACTIVE_TAB_INDEX_KEY, DM_TAB_KEY } from '@dn-d-servant/util';
import { routes } from './app.routes';

export interface CommandItem {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  routePath: string;
  tabIndex?: number;
  tabStorageKey?: string;
}

const APP_COMMANDS: CommandItem[] = [
  // ── Pages ─────────────────────────────────────────────────
  {
    id: 'page-character-sheet',
    label: 'Karta postavy',
    sublabel: 'Stránka',
    icon: 'person_edit',
    routePath: routes.characterSheet,
  },
  {
    id: 'page-dm-screen',
    label: 'PH zástěna',
    sublabel: 'Stránka',
    icon: 'full_coverage',
    routePath: routes.dmScreen,
  },
  {
    id: 'page-dm-page',
    label: 'PH nástroje',
    sublabel: 'Stránka',
    icon: 'construction',
    routePath: routes.dmPage,
  },
  {
    id: 'page-dnd-database',
    label: 'Databáze D&D',
    sublabel: 'Stránka',
    icon: 'menu_book',
    routePath: routes.dndDatabase,
  },
  {
    id: 'page-help',
    label: 'Nápověda & Tipy',
    sublabel: 'Stránka',
    icon: 'help_outline',
    routePath: routes.helpAndTips,
  },
  // ── Character-sheet tabs ───────────────────────────────────
  {
    id: 'cs-tab-0',
    label: 'Karta postavy',
    sublabel: 'Karta postavy › záložka',
    icon: 'person_edit',
    routePath: routes.characterSheet,
    tabIndex: 0,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-1',
    label: 'Questy',
    sublabel: 'Karta postavy › záložka',
    icon: 'checklist',
    routePath: routes.characterSheet,
    tabIndex: 1,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-2',
    label: 'Karta družiny',
    sublabel: 'Karta postavy › záložka',
    icon: 'group',
    routePath: routes.characterSheet,
    tabIndex: 2,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-3',
    label: 'Moje předměty',
    sublabel: 'Karta postavy › záložka',
    icon: 'inventory_2',
    routePath: routes.characterSheet,
    tabIndex: 3,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-4',
    label: 'Poznámky',
    sublabel: 'Karta postavy › záložka',
    icon: 'notes',
    routePath: routes.characterSheet,
    tabIndex: 4,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-5',
    label: 'Iniciativa',
    sublabel: 'Karta postavy › záložka',
    icon: 'sports_martial_arts',
    routePath: routes.characterSheet,
    tabIndex: 5,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-6',
    label: 'Konvertor obrázků',
    sublabel: 'Karta postavy › záložka',
    icon: 'image',
    routePath: routes.characterSheet,
    tabIndex: 6,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  {
    id: 'cs-tab-7',
    label: 'J&D wiki',
    sublabel: 'Karta postavy › záložka',
    icon: 'auto_stories',
    routePath: routes.characterSheet,
    tabIndex: 7,
    tabStorageKey: ACTIVE_TAB_INDEX_KEY,
  },
  // ── DM-page tabs ──────────────────────────────────────────
  {
    id: 'dm-tab-0',
    label: 'Iniciativa',
    sublabel: 'PH nástroje › záložka',
    icon: 'sports_martial_arts',
    routePath: routes.dmPage,
    tabIndex: 0,
    tabStorageKey: DM_TAB_KEY,
  },
  {
    id: 'dm-tab-1',
    label: 'DM Questy',
    sublabel: 'PH nástroje › záložka',
    icon: 'checklist',
    routePath: routes.dmPage,
    tabIndex: 1,
    tabStorageKey: DM_TAB_KEY,
  },
  {
    id: 'dm-tab-2',
    label: 'Poznámky PH',
    sublabel: 'PH nástroje › záložka',
    icon: 'notes',
    routePath: routes.dmPage,
    tabIndex: 2,
    tabStorageKey: DM_TAB_KEY,
  },
  {
    id: 'dm-tab-3',
    label: 'Generátor',
    sublabel: 'PH nástroje › záložka',
    icon: 'casino',
    routePath: routes.dmPage,
    tabIndex: 3,
    tabStorageKey: DM_TAB_KEY,
  },
];

@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon],
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
  template: `
    <div class="cp-panel">
      <!-- Search bar -->
      <div class="cp-search-wrap">
        <mat-icon class="cp-search-icon">search</mat-icon>
        <input
          #searchInput
          class="cp-search-input"
          type="text"
          placeholder="Hledej stránku nebo záložku…"
          autocomplete="off"
          spellcheck="false"
          [ngModel]="query()"
          (ngModelChange)="onQueryChange($event)"
          aria-label="Hledat příkaz"
        />
        <span class="cp-esc-hint">ESC</span>
      </div>

      <!-- Results -->
      <div class="cp-list" #listEl>
        @if (filtered().length === 0) {
          <div class="cp-empty">Žádné výsledky</div>
        }
        @for (item of filtered(); track item.id; let i = $index) {
          <button
            type="button"
            class="cp-item"
            [class.cp-item--active]="activeIndex() === i"
            (click)="selectItem(item)"
            (mouseenter)="activeIndex.set(i)"
          >
            <mat-icon class="cp-item-icon">{{ item.icon }}</mat-icon>
            <span class="cp-item-text">
              <span class="cp-item-label">{{ item.label }}</span>
              <span class="cp-item-sub">{{ item.sublabel }}</span>
            </span>
            @if (item.tabIndex !== undefined) {
              <span class="cp-item-badge">záložka {{ item.tabIndex + 1 }}</span>
            }
          </button>
        }
      </div>

      <!-- Footer hint -->
      <div class="cp-footer">
        <span class="cp-hint"><kbd>↑↓</kbd> navigace</span>
        <span class="cp-hint"><kbd>↵</kbd> otevřít</span>
        <span class="cp-hint"><kbd>Esc</kbd> zavřít</span>
      </div>
    </div>
  `,
  styles: `
    .cp-panel {
      background: linear-gradient(180deg, rgba(8,5,16,.99) 0%, rgba(14,10,22,.99) 100%);
      border: 1px solid rgba(200,160,60,.4);
      border-radius: 12px;
      overflow: hidden;
      width: min(580px, 96vw);
      display: flex;
      flex-direction: column;

      &::before {
        content: '◆';
        position: absolute;
        top: -7px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        color: rgba(200,160,60,.6);
        background: rgba(8,5,16,1);
        padding: 0 6px;
        pointer-events: none;
        z-index: 2;
      }
    }

    /* ── Search ───────────────────────────────────────────── */
    .cp-search-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(200,160,60,.18);
      background: rgba(200,160,60,.03);
    }

    .cp-search-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(200,160,60,.55);
      flex-shrink: 0;
    }

    .cp-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: .04em;
      color: #e8d9b0;
      caret-color: rgba(200,160,60,.8);

      &::placeholder {
        color: rgba(200,160,60,.3);
      }
    }

    .cp-esc-hint {
      font-size: 10px;
      padding: 2px 6px;
      border: 1px solid rgba(200,160,60,.25);
      border-radius: 4px;
      color: rgba(200,160,60,.4);
      font-family: monospace;
      flex-shrink: 0;
    }

    /* ── List ─────────────────────────────────────────────── */
    .cp-list {
      overflow-y: auto;
      max-height: 380px;
      padding: 6px 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,160,60,.25) transparent;
    }

    .cp-empty {
      padding: 28px 16px;
      text-align: center;
      font-family: 'Mikadan', sans-serif;
      font-size: 12px;
      letter-spacing: .1em;
      color: rgba(200,160,60,.3);
    }

    .cp-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: background .1s;
      position: relative;

      &:hover,
      &--active {
        background: rgba(200,160,60,.1);

        .cp-item-icon { color: rgba(200,160,60,.9); }
        .cp-item-label { color: #f0d88a; }
      }

      &--active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: rgba(200,160,60,.7);
        border-radius: 0 1px 1px 0;
      }
    }

    .cp-item-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(200,160,60,.45);
      flex-shrink: 0;
      transition: color .1s;
    }

    .cp-item-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .cp-item-label {
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: .04em;
      color: #c8b880;
      transition: color .1s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cp-item-sub {
      font-size: 10px;
      letter-spacing: .08em;
      color: rgba(200,160,60,.35);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cp-item-badge {
      font-size: 9px;
      padding: 2px 7px;
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 10px;
      color: rgba(200,160,60,.4);
      background: rgba(200,160,60,.05);
      flex-shrink: 0;
      font-family: monospace;
      letter-spacing: .05em;
    }

    /* ── Footer ───────────────────────────────────────────── */
    .cp-footer {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      border-top: 1px solid rgba(200,160,60,.12);
      background: rgba(200,160,60,.02);
    }

    .cp-hint {
      font-size: 10px;
      color: rgba(200,160,60,.35);
      letter-spacing: .06em;
      display: flex;
      align-items: center;
      gap: 4px;

      kbd {
        font-size: 9px;
        padding: 1px 4px;
        border: 1px solid rgba(200,160,60,.2);
        border-radius: 3px;
        background: rgba(200,160,60,.06);
        font-family: monospace;
      }
    }
  `,
})
export class CommandPaletteComponent implements AfterViewInit {
  private readonly dialogRef = inject(MatDialogRef<CommandPaletteComponent>);
  private readonly router = inject(Router);
  private readonly ls = inject(LocalStorageService);

  private readonly searchInputEl = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly listEl = viewChild<ElementRef<HTMLElement>>('listEl');

  readonly query = signal('');
  readonly activeIndex = signal(0);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return APP_COMMANDS;
    return APP_COMMANDS.filter(
      cmd =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.sublabel.toLowerCase().includes(q),
    );
  });

  ngAfterViewInit(): void {
    this.searchInputEl().nativeElement.focus();
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filtered();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set((this.activeIndex() + 1) % Math.max(items.length, 1));
        this.scrollActiveIntoView();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set((this.activeIndex() - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1));
        this.scrollActiveIntoView();
        break;

      case 'Enter':
        event.preventDefault();
        const selected = items[this.activeIndex()];
        if (selected) this.selectItem(selected);
        break;

      case 'Escape':
        this.dialogRef.close();
        break;
    }
  }

  selectItem(item: CommandItem): void {
    // If the item targets a specific tab, persist the index before navigation.
    if (item.tabIndex !== undefined && item.tabStorageKey) {
      this.ls.setDataSync(item.tabStorageKey, item.tabIndex);
    }
    this.router.navigateByUrl('/' + item.routePath);
    this.dialogRef.close();
  }

  private scrollActiveIntoView(): void {
    // queueMicrotask lets Angular render the updated active class before scrolling
    queueMicrotask(() => {
      const listNative = this.listEl()?.nativeElement;
      const active = listNative?.querySelector('.cp-item--active');
      active?.scrollIntoView({ block: 'nearest' });
    });
  }
}





