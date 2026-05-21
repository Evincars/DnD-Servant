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
import { JadSpell, JadSpellsService } from '../jad-spells.service';
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
    /* ── Search header ── */
    .spells-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px 9px;
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
        position: absolute; left: 10px;
        font-size: 18px; width: 18px; height: 18px;
        color: rgba(200,160,60,.45); pointer-events: none;
      }
    }
    .spells-search {
      width: 100%;
      background: rgba(5,3,12,.75);
      border: 1px solid rgba(200,160,60,.28);
      border-radius: 4px;
      color: #d4c9a0;
      font-family: monospace;
      font-size: 13px;
      padding: 7px 34px;
      outline: none;
      transition: border-color .18s, box-shadow .18s;
      &::placeholder { color: rgba(200,160,60,.28); font-style: italic; }
      &:focus { border-color: rgba(200,160,60,.6); box-shadow: 0 0 10px rgba(200,160,60,.12); }
    }
    .search-clear {
      position: absolute; right: 6px;
      background: none; border: none; cursor: pointer;
      color: rgba(200,160,60,.45);
      display: flex; align-items: center;
      padding: 2px; border-radius: 3px; transition: color .15s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { color: #e8c96a; }
    }
    .spells-count {
      font-family: monospace; font-size: 11px;
      color: rgba(200,160,60,.35); white-space: nowrap; flex-shrink: 0;
    }
    /* ── Class filter chips ── */
    .class-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 7px 14px;
      border-bottom: 1px solid rgba(200,160,60,.15);
      flex-shrink: 0;
      background: rgba(8,5,18,.7);
    }
    .class-chip {
      padding: 2px 10px;
      border: 1px solid rgba(200,160,60,.25);
      border-radius: 12px;
      background: none;
      color: rgba(200,160,60,.5);
      font-family: monospace;
      font-size: 11px;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
      &:hover { border-color: rgba(200,160,60,.55); color: #d4c9a0; background: rgba(200,160,60,.07); }
      &.active { background: rgba(200,160,60,.14); border-color: #c8a03c; color: #e8c96a; box-shadow: 0 0 7px rgba(200,160,60,.18); }
    }
    /* ── Scrollable spell area ── */
    .spells-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 6px 12px 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,160,60,.3) rgba(5,3,12,.6);
    }
    /* ── School section ── */
    .school-section { margin-bottom: 14px; }
    .school-heading {
      font-family: monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(200,160,60,.45);
      padding: 6px 2px 5px;
      border-bottom: 1px solid rgba(200,160,60,.12);
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
      &::before {
        content: '';
        display: inline-block;
        width: 3px; height: 10px;
        background: rgba(200,160,60,.35);
        border-radius: 2px;
      }
    }
    .school-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
      gap: 4px;
    }
    /* ── Spell card ── */
    .spell-card {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 9px;
      background: rgba(5,3,12,.55);
      border: 1px solid rgba(200,160,60,.1);
      border-radius: 5px;
      color: #c8b896;
      font-family: monospace; font-size: 12px;
      cursor: pointer; text-align: left;
      transition: background .14s, color .14s, border-color .14s, box-shadow .14s;
      min-height: 38px;
      &:hover {
        background: rgba(200,160,60,.09); color: #e8c96a;
        border-color: rgba(200,160,60,.26); box-shadow: 0 2px 8px rgba(200,160,60,.09);
        .badge { opacity: .9; }
      }
    }
    .spell-card-name { flex: 1; line-height: 1.3; }
    .badges { display: flex; gap: 2px; flex-shrink: 0; align-items: center; }
    .badge {
      min-width: 18px; height: 18px;
      border-radius: 3px;
      font-family: monospace; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px; opacity: .75; transition: opacity .14s;
    }
    .badge-level  { border: 1px solid rgba(200,160,60,.3);  background: rgba(200,160,60,.08); color: rgba(200,160,60,.65); }
    .badge-cantrip{ border: 1px solid rgba(60,180,180,.4);  background: rgba(60,180,180,.1);  color: rgba(100,210,210,.8); }
    .badge-ritual { border: 1px solid rgba(160,80,220,.4);  background: rgba(140,60,200,.1);  color: rgba(180,120,240,.8); }
    /* ── Empty / loading state ── */
    .spells-state {
      padding: 48px 24px; text-align: center;
      font-family: monospace; font-size: 13px;
      color: rgba(200,160,60,.3); font-style: italic;
      mat-icon { display: block; font-size: 36px; width: 36px; height: 36px; margin: 0 auto 12px; color: rgba(200,160,60,.18); }
    }
  `,
  template: `
    <!-- Search bar -->
    <div class="spells-header">
      <div class="spells-search-wrap">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          #searchInput
          class="spells-search"
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
          placeholder="Hledat kouzlo&#8230;"
          autocomplete="off" spellcheck="false"
        />
        @if (searchQuery()) {
          <button class="search-clear" type="button" (click)="searchQuery.set('')" matTooltip="Vymazat">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
      <span class="spells-count">{{ filteredSpells().length }}&thinsp;/&thinsp;{{ spellsService.allSpells().length }}</span>
    </div>

    <!-- Class filter chips -->
    @if (spellsService.availableClasses().length > 0) {
      <div class="class-filters">
        <button class="class-chip" [class.active]="selectedClass() === null" type="button" (click)="selectedClass.set(null)">V&#353;e</button>
        @for (cls of spellsService.availableClasses(); track cls) {
          <button class="class-chip" [class.active]="selectedClass() === cls" type="button" (click)="toggleClass(cls)">{{ cls }}</button>
        }
      </div>
    }

    <!-- Scrollable body: grouped by school -->
    <div class="spells-scroll">
      @if (spellsService.allSpells().length === 0) {
        <div class="spells-state"><mat-icon>hourglass_empty</mat-icon>Na&#269;&#237;t&#225;m seznam kouzel&#8230;</div>
      } @else if (filteredSpells().length === 0) {
        <div class="spells-state"><mat-icon>search_off</mat-icon>&#381;&#225;dn&#233; kouzlo neodpov&#237;d&#225;.</div>
      } @else {
        @for (group of groupedSpells(); track group.school) {
          <div class="school-section">
            <div class="school-heading">{{ group.school }}<span style="margin-left:auto;opacity:.45;font-weight:400">({{ group.spells.length }})</span></div>
            <div class="school-grid">
              @for (spell of group.spells; track spell.slug) {
                <button
                  class="spell-card"
                  type="button"
                  (click)="openSpellDetail(spell.name)"
                  [matTooltip]="spellTooltip(spell)"
                  matTooltipShowDelay="500"
                >
                  <span class="spell-card-name">{{ spell.name }}</span>
                  <span class="badges">
                    @if (spell.ritual) {
                      <span class="badge badge-ritual" matTooltip="Rit&#225;l" matTooltipShowDelay="700">R</span>
                    }
                    @if (spell.level === 0) {
                      <span class="badge badge-cantrip" matTooltip="Trik" matTooltipShowDelay="700">T</span>
                    } @else if (spell.level !== undefined) {
                      <span class="badge badge-level" [matTooltip]="spell.level + '. &#250;rove&#328;'" matTooltipShowDelay="700">{{ spell.level }}</span>
                    }
                  </span>
                </button>
              }
            </div>
          </div>
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

  /** Spells after search + class filter, still sorted alphabetically. */
  readonly filteredSpells = computed(() => {
    const q = JadSpellsService.normalizeStr(this.searchQuery());
    const cls = this.selectedClass();
    return this.spellsService.allSpells().filter(s => {
      const matchesSearch = !q || JadSpellsService.normalizeStr(s.name).includes(q);
      const matchesClass  = cls === null || s.classes.some(c => c === cls);
      return matchesSearch && matchesClass;
    });
  });

  /** Filtered spells grouped by school, sorted by school name. */
  readonly groupedSpells = computed((): Array<{ school: string; spells: JadSpell[] }> => {
    const groupMap = new Map<string, JadSpell[]>();
    for (const spell of this.filteredSpells()) {
      const school = spell.school ?? 'Ostatn\u00ED'; // Ostatní
      if (!groupMap.has(school)) groupMap.set(school, []);
      groupMap.get(school)!.push(spell);
    }
    return [...groupMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'cs'))
      .map(([school, spells]) => ({ school, spells }));
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.active()) this._searchRef()?.nativeElement.focus();
    });
  }

  toggleClass(cls: string): void {
    this.selectedClass.update(current => (current === cls ? null : cls));
  }

  spellTooltip(spell: JadSpell): string {
    const parts: string[] = [];
    if (spell.school) parts.push(spell.school);
    if (spell.classes.length) parts.push(spell.classes.join(', '));
    return parts.join(' \u00B7 ') || 'Zobrazit detail kouzla';
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