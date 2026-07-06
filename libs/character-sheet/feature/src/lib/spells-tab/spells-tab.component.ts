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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { JadSpell, JadSpellsService } from '../jad-spells.service';
import { SpellDetailDialogComponent, SpellDetailDialogData } from '../spell-detail-dialog.component';
import { SpellSheetService } from '../spell-sheet.service';

// ── Fuzzy-search helpers ────────────────────────────────────────────────────

/**
 * Position-preserving normalization: strips diacritics and lowercases
 * WITHOUT trimming or collapsing spaces, so char indices map 1-to-1 with
 * the original string.
 */
function posNorm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Subsequence / fuzzy match.
 * Every character of `query` must appear in `text` in order (can skip chars).
 * Returns the matched indices inside `text`, or `null` if no match.
 *
 * Example: query="balu", text="bajny lucisnik" → [0,1,7,12] ✓
 */
function fuzzySubsequence(query: string, text: string): number[] | null {
  const indices: number[] = [];
  let ti = 0;
  for (let qi = 0; qi < query.length; qi++) {
    const ch = query[qi];
    while (ti < text.length && text[ti] !== ch) ti++;
    if (ti >= text.length) return null;
    indices.push(ti);
    ti++;
  }
  return indices;
}

/** Minimal HTML escaping for safe use in [innerHTML]. */
function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Wraps each matched character index in a `<span class="spell-hl">` element.
 * Consecutive matched characters are merged into a single span for cleaner HTML.
 */
function buildHighlightHtml(original: string, indices: number[]): string {
  const matchSet = new Set(indices);
  const parts: string[] = [];
  let inSpan = false;
  for (let i = 0; i < original.length; i++) {
    const ch = escHtml(original[i]);
    if (matchSet.has(i)) {
      if (!inSpan) { parts.push('<span class="spell-hl">'); inSpan = true; }
      parts.push(ch);
    } else {
      if (inSpan) { parts.push('</span>'); inSpan = false; }
      parts.push(ch);
    }
  }
  if (inSpan) parts.push('</span>');
  return parts.join('');
}

// ── Typed item returned by filteredSpells ───────────────────────────────────
interface SpellItem {
  spell: JadSpell;
  /** Safe HTML string – plain text when no query, highlighted when matched. */
  highlightedName: string;
}

type SpellTypeFilter = 'kouzlo' | 'ritual';

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
      font-family: sans-serif;
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
      font-family: sans-serif; font-size: 11px;
      color: rgba(200,160,60,.35); white-space: nowrap; flex-shrink: 0;
    }
    /* ── Filter rows (class chips + type/level chips) ── */
    .filters {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      padding: 7px 14px;
      border-bottom: 1px solid rgba(200,160,60,.15);
      flex-shrink: 0;
      background: rgba(8,5,18,.7);
    }
    .filter-label {
      font-family: sans-serif; font-size: 10px; letter-spacing: .07em;
      text-transform: uppercase; color: rgba(200,160,60,.35);
      flex-shrink: 0; margin-right: 2px;
    }
    /* ── Sort-mode toggle ── */
    .sort-toggle {
      margin-left: auto;
      flex-shrink: 0;
      display: flex;
      gap: 4px;
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
      font-family: sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: rgba(200,160,60,.55);
      padding: 6px 2px 5px;
      border-bottom: 1px solid rgba(200,160,60,.12);
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
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
      font-family: sans-serif; font-size: 12px;
      cursor: pointer; text-align: left;
      transition: background .14s, color .14s, border-color .14s, box-shadow .14s;
      min-height: 38px;
      &:hover {
        background: rgba(200,160,60,.09); color: #e8c96a;
        border-color: rgba(200,160,60,.26); box-shadow: 0 2px 8px rgba(200,160,60,.09);
        .badge { opacity: .9; }
      }
    }
    .spell-card-name {
      flex: 1; line-height: 1.3;
      /* highlighted chars injected via [innerHTML] */
      ::ng-deep .spell-hl {
        color: #f5d76e;
        font-weight: 700;
      }
    }
    .badges { display: flex; gap: 2px; flex-shrink: 0; align-items: center; }
    .badge {
      min-width: 18px; height: 18px;
      border-radius: 3px;
      font-family: sans-serif; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px; opacity: .75; transition: opacity .14s;
    }
    .badge-level  { border: 1px solid rgba(200,160,60,.3);  background: rgba(200,160,60,.08); color: rgba(200,160,60,.65); }
    .badge-cantrip{ border: 1px solid rgba(60,180,180,.4);  background: rgba(60,180,180,.1);  color: rgba(100,210,210,.8); }
    .badge-ritual { border: 1px solid rgba(160,80,220,.4);  background: rgba(140,60,200,.1);  color: rgba(180,120,240,.8); }
    /* ── Empty / loading state ── */
    .spells-state {
      padding: 48px 24px; text-align: center;
      font-family: sans-serif; font-size: 13px;
      color: rgba(200,160,60,.3); font-style: italic;
      mat-icon { display: block; font-size: 36px; width: 36px; height: 36px; margin: 0 auto 12px; color: rgba(200,160,60,.18); }
    }
    /* ── Add-to-sheet button inside spell card ── */
    .add-to-sheet-btn {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px;
      background: none; border: 1px solid rgba(200,160,60,.18); border-radius: 4px;
      color: rgba(200,160,60,.35);
      cursor: pointer; padding: 0;
      transition: all .15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { border-color: rgba(200,160,60,.7); color: #e8c96a; background: rgba(200,160,60,.1); }
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

    <!-- Class filter chips (row 1) -->
    @if (spellsService.availableClasses().length > 0) {
      <div class="filters">
        <span class="filter-label">Povolání</span>
        <button class="pt-filter-btn" [class.active]="selectedClass() === null" type="button" (click)="selectedClass.set(null)">V&#353;e</button>
        @for (cls of spellsService.availableClasses(); track cls) {
          <button class="pt-filter-btn" [class.active]="selectedClass() === cls" type="button" (click)="toggleClass(cls)">{{ cls }}</button>
        }
        <!-- Sort-mode toggle -->
        <div class="sort-toggle" role="group" aria-label="Řazení">
          <button class="pt-filter-btn" [class.active]="sortMode() === 'school'" type="button"
            (click)="sortMode.set('school')" matTooltip="Řadit podle školy magie">
            Škola
          </button>
          <button class="pt-filter-btn" [class.active]="sortMode() === 'level'" type="button"
            (click)="sortMode.set('level')" matTooltip="Řadit podle úrovně kouzla">
            Úroveň
          </button>
        </div>
      </div>
    }

    <!-- Type + level filter chips (row 2) -->
    @if (spellsService.allSpells().length > 0) {
      <div class="filters">
        <span class="filter-label">Typ</span>
        <button class="pt-filter-btn" [class.active]="selectedSpellType() === null" type="button" (click)="selectedSpellType.set(null)">Vše</button>
        <button class="pt-filter-btn" [class.active]="selectedSpellType() === 'kouzlo'" type="button" (click)="toggleSpellType('kouzlo')" matTooltip="Pouze kouzla (ne triky, ne rituály)">Kouzlo</button>
        <button class="pt-filter-btn" [class.active]="selectedSpellType() === 'ritual'" type="button" (click)="toggleSpellType('ritual')" matTooltip="Pouze rituály">Rituál</button>
          @if (availableLevels().length > 0) {
            <span class="filter-label" style="margin-left: 6px">Úroveň</span>
            <button class="pt-filter-btn" [class.active]="selectedLevel() === null" type="button" (click)="selectedLevel.set(null)">Vše</button>
            @for (lvl of availableLevels(); track lvl) {
              <button
                class="pt-filter-btn"
                [class.active]="selectedLevel() === lvl"
                type="button"
                (click)="toggleLevel(lvl)"
                [matTooltip]="lvl === 0 ? 'Trik (0. úroveň)' : lvl + '. úroveň'"
              >{{ lvl === 0 ? 'Trik' : lvl }}</button>
            }
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
        @for (group of groupedSpells(); track group.label) {
          <div class="school-section">
            <div class="school-heading">{{ group.label }}<span style="margin-left:auto;opacity:.45;font-weight:400">({{ group.spells.length }})</span></div>
            <div class="school-grid">
              @for (item of group.spells; track item.spell.slug) {
                <button
                  class="spell-card"
                  type="button"
                  (click)="openSpellDetail(item.spell.name)"
                  [matTooltip]="spellTooltip(item.spell)"
                  matTooltipShowDelay="500"
                >
                  <span class="spell-card-name" [innerHTML]="item.highlightedName"></span>
                  <span class="badges">
                    @if (item.spell.ritual) {
                      <span class="badge badge-ritual" matTooltip="Rituál" matTooltipShowDelay="700">R</span>
                    }
                    @if (item.spell.level === 0) {
                      <span class="badge badge-cantrip" matTooltip="Trik" matTooltipShowDelay="700">T</span>
                    } @else if (item.spell.level !== undefined) {
                      <span class="badge badge-level" [matTooltip]="item.spell.level + '. úroveň'" matTooltipShowDelay="700">{{ item.spell.level }}</span>
                    }
                  </span>
                  @if (spellSheetService.hasActiveForm()) {
                    <button
                      class="add-to-sheet-btn"
                      type="button"
                      (click)="addSpellToSheet(item.spell, $event)"
                      matTooltip="Přidat do listu kouzel"
                      matTooltipShowDelay="400"
                    ><mat-icon>playlist_add</mat-icon></button>
                  }
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
  readonly spellSheetService = inject(SpellSheetService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly searchQuery = signal('');
  readonly selectedClass = signal<string | null>(null);
  readonly selectedSpellType = signal<SpellTypeFilter | null>(null);
  readonly selectedLevel = signal<number | null>(null);
  readonly sortMode = signal<'school' | 'level'>('school');
  private readonly _searchRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Sorted list of all spell levels (0–9) present in the full (unfiltered) list.
   *  Level 0 is shown as "Trik" in the Úroveň chip row. */
  readonly availableLevels = computed((): number[] => {
    const levelSet = new Set<number>();
    for (const s of this.spellsService.allSpells()) {
      if (s.level !== undefined) levelSet.add(s.level);
    }
    return [...levelSet].sort((a, b) => a - b);
  });

  /**
   * Spells after fuzzy search + class filter + type filter + level filter.
   * Each item carries the pre-built highlighted HTML for its name.
   */
  readonly filteredSpells = computed((): SpellItem[] => {
    const q = JadSpellsService.normalizeStr(this.searchQuery());
    const cls = this.selectedClass();
    const spellType = this.selectedSpellType();
    const level = this.selectedLevel();
    const result: SpellItem[] = [];

    for (const s of this.spellsService.allSpells()) {
      if (cls !== null && !s.classes.some(c => c === cls)) continue;

      // Type filter
      if (spellType !== null) {
        if (spellType === 'ritual' && !s.ritual) continue;
        if (spellType === 'kouzlo' && (s.level === 0 || s.ritual)) continue;
      }

      // Level filter
      if (level !== null && s.level !== level) continue;

      if (!q) {
        result.push({ spell: s, highlightedName: escHtml(s.name) });
      } else {
        const normName = posNorm(s.name);
        const indices = fuzzySubsequence(q, normName);
        if (indices !== null) {
          result.push({ spell: s, highlightedName: buildHighlightHtml(s.name, indices) });
        }
      }
    }
    return result;
  });

  /** Filtered items grouped by school or level, depending on sortMode. */
  readonly groupedSpells = computed((): Array<{ label: string; spells: SpellItem[] }> => {
    const byLevel = this.sortMode() === 'level';
    const groupMap = new Map<string, SpellItem[]>();

    for (const item of this.filteredSpells()) {
      const key = byLevel
        ? this._levelLabel(item.spell.level)
        : (item.spell.school ?? 'Ostatn\u00ED');
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }

    if (byLevel) {
      // Sort groups numerically: Triky (0), 1.kruh … 9.kruh, Ostatní
      return [...groupMap.entries()]
        .sort(([a], [b]) => this._levelSortKey(a) - this._levelSortKey(b))
        .map(([label, spells]) => ({ label, spells }));
    }

    return [...groupMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'cs'))
      .map(([label, spells]) => ({ label, spells }));
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.active()) this._searchRef()?.nativeElement.focus();
    });
  }

  toggleClass(cls: string): void {
    this.selectedClass.update(current => (current === cls ? null : cls));
  }

  toggleSpellType(type: SpellTypeFilter): void {
    this.selectedSpellType.update(cur => (cur === type ? null : type));
  }

  toggleLevel(level: number): void {
    this.selectedLevel.update(cur => (cur === level ? null : level));
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

  addSpellToSheet(spell: JadSpell, event: MouseEvent): void {
    event.stopPropagation();
    const added = this.spellSheetService.addSpell(spell.name);
    if (added) {
      this.snackBar.open(`✨ „${spell.name}" přidáno do listu kouzel`, '✕', {
        verticalPosition: 'top',
        duration: 2500,
        panelClass: ['snackbar--save'],
      });
    } else {
      this.snackBar.open('Všechny řádky v listu kouzel jsou obsazeny.', '✕', {
        verticalPosition: 'top',
        duration: 3000,
      });
    }
  }

  private _levelLabel(level: number | undefined): string {
    if (level === undefined) return 'Ostatn\u00ED';
    if (level === 0) return 'Triky';
    return `${level}.\u00A0\u00FArove\u0148`;
  }

  private _levelSortKey(label: string): number {
    if (label === 'Triky') return 0;
    const m = label.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : 99;
  }
}