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
      color: #d4c9a0;
    }
    .spells-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px 10px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(200,160,60,.22);
      background: linear-gradient(180deg, rgba(22,15,5,.97) 0%, rgba(14,10,4,.98) 100%);
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
      font-family: 'Alegreya', serif;
      font-size: 14px;
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
      font-family: 'Alegreya', serif;
      font-size: 12px;
      letter-spacing: .04em;
      color: rgba(200,160,60,.35);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .class-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(200,160,60,.12);
      flex-shrink: 0;
      background: rgba(8,5,18,.6);
    }
    .class-chip {
      padding: 3px 11px;
      border: 1px solid rgba(200,160,60,.28);
      border-radius: 14px;
      background: none;
      color: rgba(200,160,60,.55);
      font-family: 'Alegreya', serif;
      font-size: 13px;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
      &:hover {
        border-color: rgba(200,160,60,.6);
        color: #d4c9a0;
        background: rgba(200,160,60,.07);
      }
      &.active {
        background: rgba(200,160,60,.15);
        border-color: #c8a03c;
        color: #e8c96a;
        box-shadow: 0 0 8px rgba(200,160,60,.18);
      }
    }
    .spells-grid {
      flex: 1;
      overflow-y: auto;
      padding: 10px 14px;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,160,60,.35) rgba(5,3,12,.6);
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 5px;
      align-content: start;
    }
    .spell-card {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 10px;
      background: rgba(5,3,12,.55);
      border: 1px solid rgba(200,160,60,.1);
      border-radius: 6px;
      color: #c8b896;
      font-family: 'Alegreya', serif;
      font-size: 13px;
      cursor: pointer;
      text-align: left;
      transition: background .14s, color .14s, border-color .14s, box-shadow .14s;
      min-height: 42px;
      &:hover {
        background: rgba(200,160,60,.1);
        color: #e8c96a;
        border-color: rgba(200,160,60,.28);
        box-shadow: 0 2px 10px rgba(200,160,60,.1);
        .level-badge { border-color: rgba(200,160,60,.5); color: #c8a03c; }
      }
      &:active {
        background: rgba(200,160,60,.16);
      }
    }
    .spell-card-name {
      flex: 1;
      line-height: 1.3;
    }
    .level-badge {
      flex-shrink: 0;
      min-width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid rgba(200,160,60,.25);
      background: rgba(200,160,60,.07);
      color: rgba(200,160,60,.5);
      font-family: 'Alegreya', serif;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      letter-spacing: 0;
      transition: border-color .14s, color .14s;
    }
    .spells-state {
      grid-column: 1 / -1;
      padding: 48px 24px;
      text-align: center;
      font-family: 'Alegreya', serif;
      font-size: 14px;
      color: rgba(200,160,60,.3);
      font-style: italic;
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
      <div class="spells-search-wrap">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          #searchInput
          class="spells-search"
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
          placeholder="Hledat kouzlo&#8230;"
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
    @if (spellsService.availableClasses().length > 0) {
      <div class="class-filters">
        <button
          class="class-chip"
          [class.active]="selectedClass() === null"
          type="button"
          (click)="selectedClass.set(null)"
        >V&#353;e</button>
        @for (cls of spellsService.availableClasses(); track cls) {
          <button
            class="class-chip"
            [class.active]="selectedClass() === cls"
            type="button"
            (click)="toggleClass(cls)"
          >{{ cls }}</button>
        }
      </div>
    }
    <div class="spells-grid">
      @if (spellsService.allSpells().length === 0) {
        <div class="spells-state">
          <mat-icon>hourglass_empty</mat-icon>
          Na&#269;&#237;t&#225;m seznam kouzel&#8230;
        </div>
      } @else if (filteredSpells().length === 0) {
        <div class="spells-state">
          <mat-icon>search_off</mat-icon>
          &#381;&#225;dn&#233; kouzlo neodpov&#237;d&#225; hledan&#233;mu v&#253;razu.
        </div>
      } @else {
        @for (spell of filteredSpells(); track spell.slug) {
          <button
            class="spell-card"
            type="button"
            (click)="openSpellDetail(spell.name)"
            [matTooltip]="spell.classes.length ? spell.classes.join(', ') : 'Zobrazit detail kouzla'"
            matTooltipShowDelay="400"
          >
            <span class="spell-card-name">{{ spell.name }}</span>
            @if (spell.level !== undefined) {
              <span class="level-badge" [matTooltip]="spell.level === 0 ? 'Trik' : spell.level + '. úroveň'" matTooltipShowDelay="600">
                {{ spell.level === 0 ? 'T' : spell.level }}
              </span>
            }
          </button>
        }
      }
    </div>
  `,
})
export class SpellsTabComponent {
  readonly active = input<boolean>(false);
  readonly spellsService = inject(JadSpellsService);
  private readonly dialog = inject(MatDialog);
  readonly searchQuery = signal('');
  readonly selectedClass = signal<string | null>(null);
  private readonly _searchRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly filteredSpells = computed(() => {
    const q = JadSpellsService.normalizeStr(this.searchQuery());
    const cls = this.selectedClass();
    return this.spellsService.allSpells().filter(s => {
      const matchesSearch = !q || JadSpellsService.normalizeStr(s.name).includes(q);
      const matchesClass = cls === null || s.classes.some(c => c === cls);
      return matchesSearch && matchesClass;
    });
  });
  constructor() {
    afterRenderEffect(() => {
      if (this.active()) {
        this._searchRef()?.nativeElement.focus();
      }
    });
  }
  toggleClass(cls: string): void {
    this.selectedClass.update(current => (current === cls ? null : cls));
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