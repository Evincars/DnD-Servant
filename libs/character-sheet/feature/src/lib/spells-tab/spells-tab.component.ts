import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { JadSpellsService } from '../jad-spells.service';
import { SpellDetailDialogComponent, SpellDetailDialogData } from '../spell-detail-dialog.component';

@Component({
  selector: 'spells-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-family: 'Mikadan', sans-serif;
      color: #d4c9a0;
    }

    /* ── Search bar ──────────────────────────────────────── */
    .spells-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px 12px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(200,160,60,.22);
      background: linear-gradient(180deg, rgba(22,15,5,.97) 0%, rgba(14,10,4,.98) 100%);
    }

    .spells-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 18px rgba(200,160,60,.4);
      white-space: nowrap;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: #c8a03c;
      }
    }

    .spells-search-wrap {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 10px;
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: rgba(200,160,60,.45);
        pointer-events: none;
      }
    }

    .spells-search {
      width: 100%;
      background: rgba(5,3,12,.75);
      border: 1px solid rgba(200,160,60,.28);
      border-radius: 4px;
      color: #d4c9a0;
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      padding: 8px 36px;
      outline: none;
      transition: border-color .18s, box-shadow .18s;

      &::placeholder {
        color: rgba(200,160,60,.28);
        font-style: italic;
      }

      &:focus {
        border-color: rgba(200,160,60,.6);
        box-shadow: 0 0 10px rgba(200,160,60,.12);
      }
    }

    .search-clear {
      position: absolute;
      right: 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(200,160,60,.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border-radius: 3px;
      transition: color .15s;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }

      &:hover { color: #e8c96a; }
    }

    .spells-count {
      font-size: 10px;
      letter-spacing: .1em;
      color: rgba(200,160,60,.35);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── List ────────────────────────────────────────────── */
    .spells-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,160,60,.35) rgba(5,3,12,.6);
    }

    .spell-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 24px;
      background: none;
      border: none;
      border-bottom: 1px solid rgba(200,160,60,.06);
      color: #c8b896;
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: .04em;
      cursor: pointer;
      text-align: left;
      transition: background .14s, color .14s, border-color .14s;

      mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        color: rgba(200,160,60,.35);
        flex-shrink: 0;
        transition: color .14s;
      }

      &:hover {
        background: rgba(200,160,60,.07);
        color: #e8c96a;
        border-bottom-color: rgba(200,160,60,.18);

        mat-icon { color: #c8a03c; }
      }

      &:active {
        background: rgba(200,160,60,.13);
      }
    }

    .spell-name {
      flex: 1;
    }

    .spell-arrow {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: rgba(200,160,60,.22);
      transition: color .14s, transform .14s;
    }

    .spell-item:hover .spell-arrow {
      color: rgba(200,160,60,.55);
      transform: translateX(3px);
    }

    /* ── States ──────────────────────────────────────────── */
    .spells-state {
      padding: 48px 24px;
      text-align: center;
      font-size: 13px;
      color: rgba(200,160,60,.3);
      font-style: italic;
      letter-spacing: .06em;

      mat-icon {
        display: block;
        font-size: 36px;
        width: 36px;
        height: 36px;
        margin: 0 auto 12px;
        color: rgba(200,160,60,.18);
      }
    }
  `,
  template: `
    <div class="spells-header">
      <div class="spells-title">
        <mat-icon>auto_awesome</mat-icon>
        Databáze kouzel
      </div>

      <div class="spells-search-wrap">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          #searchInput
          class="spells-search"
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
          placeholder="Hledat kouzlo…"
          autocomplete="off"
          spellcheck="false"
        />
        @if (searchQuery()) {
          <button class="search-clear" type="button" (click)="searchQuery.set('')" matTooltip="Vymazat">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      <span class="spells-count">
        {{ filteredSpells().length }} / {{ spellsService.allSpells().length }}
      </span>
    </div>

    <div class="spells-list">
      @if (spellsService.allSpells().length === 0) {
        <div class="spells-state">
          <mat-icon>hourglass_empty</mat-icon>
          Načítám seznam kouzel…
        </div>
      } @else if (filteredSpells().length === 0) {
        <div class="spells-state">
          <mat-icon>search_off</mat-icon>
          Žádné kouzlo neodpovídá hledanému výrazu.
        </div>
      } @else {
        @for (spell of filteredSpells(); track spell.slug) {
          <button
            class="spell-item"
            type="button"
            (click)="openSpellDetail(spell.name)"
            [matTooltip]="'Zobrazit detail kouzla'"
            matTooltipShowDelay="600"
          >
            <mat-icon>auto_fix_high</mat-icon>
            <span class="spell-name">{{ spell.name }}</span>
            <mat-icon class="spell-arrow">chevron_right</mat-icon>
          </button>
        }
      }
    </div>
  `,
})
export class SpellsTabComponent {
  /** True when this tab is currently selected – drives the auto-focus. */
  readonly active = input<boolean>(false);

  readonly spellsService = inject(JadSpellsService);
  private readonly dialog = inject(MatDialog);

  readonly searchQuery = signal('');
  private readonly _searchRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly filteredSpells = computed(() => {
    const q = JadSpellsService.normalizeStr(this.searchQuery());
    if (!q) return this.spellsService.allSpells();
    return this.spellsService
      .allSpells()
      .filter(s => JadSpellsService.normalizeStr(s.name).includes(q));
  });

  constructor() {
    // After every render, if this tab just became active, focus the search input.
    afterRenderEffect(() => {
      if (this.active()) {
        this._searchRef()?.nativeElement.focus();
      }
    });
  }

  openSpellDetail(spellName: string): void {
    const name = spellName.trim();
    if (!name) return;
    this.dialog.open(SpellDetailDialogComponent, {
      data: { spellName: name } satisfies SpellDetailDialogData,
      panelClass: 'spell-detail-panel',
      maxWidth: '95vw',
    });
  }
}

