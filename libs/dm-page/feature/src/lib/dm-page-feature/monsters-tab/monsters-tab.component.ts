import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, merge, of, Subject, switchMap, timer } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { InitiativeBridgeService } from '@dn-d-servant/util';
import { JadMonster, JadMonstersService } from './jad-monsters.service';
import {
  MonsterDetailDialogComponent,
  MonsterDetailDialogData,
} from './monster-detail-dialog.component';

// ── Fuzzy-search helpers (same pattern as spells-tab) ──────────────────────

function posNorm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

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

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHighlightHtml(original: string, indices: number[]): string {
  const matchSet = new Set(indices);
  const parts: string[] = [];
  let inSpan = false;
  for (let i = 0; i < original.length; i++) {
    const ch = escHtml(original[i]);
    if (matchSet.has(i)) {
      if (!inSpan) { parts.push('<span class="hl">'); inSpan = true; }
      parts.push(ch);
    } else {
      if (inSpan) { parts.push('</span>'); inSpan = false; }
      parts.push(ch);
    }
  }
  if (inSpan) parts.push('</span>');
  return parts.join('');
}

interface MonsterItem {
  monster: JadMonster;
  highlightedName: string;
}

// ── CR display helpers ─────────────────────────────────────────────────────

/** Label used when grouping by CR. */
function crGroupLabel(cr: number | undefined): string {
  if (cr === undefined) return 'Ostatní';
  if (cr === 0) return 'NB 0';
  if (cr === 0.125) return 'NB 1/8';
  if (cr === 0.25) return 'NB 1/4';
  if (cr === 0.5) return 'NB 1/2';
  return `NB ${cr}`;
}

// ── CR range filter chips ──────────────────────────────────────────────────

interface CrRange {
  label: string;
  min: number;
  max: number;
}

const CR_RANGES: CrRange[] = [
  { label: 'NB 0–½',   min: 0,   max: 0.5      },
  { label: 'NB 1–4',   min: 1,   max: 4        },
  { label: 'NB 5–9',   min: 5,   max: 9        },
  { label: 'NB 10–15', min: 10,  max: 15       },
  { label: 'NB 16–20', min: 16,  max: 20       },
  { label: 'NB 21+',   min: 21,  max: Infinity },
];

@Component({
  selector: 'monsters-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  host: { '(document:keydown)': 'onDocKeydown($event)' },
  styles: `
    :host {
      display: flex; flex-direction: column;
      height: 100%; color: #d4c9a0;
    }

    /* ── Header ── */
    .header {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px 9px; flex-shrink: 0;
      border-bottom: 1px solid rgba(200,160,60,.22);
      background: linear-gradient(180deg, rgba(22,15,5,.97) 0%, rgba(14,10,4,.98) 100%);
    }

    /* ── Wiki-style search ── */
    .search-wrap { flex: 1; position: relative; }
    .search-row {
      display: flex; align-items: center; gap: 9px;
      padding: 8px 14px;
      background: rgba(22,12,4,.97);
      border: 1px solid rgba(200,160,60,.22);
      border-radius: 4px; position: relative;
      transition: border-color .15s, box-shadow .15s;
      &:focus-within {
        border-color: rgba(200,160,60,.52);
        box-shadow: 0 0 0 2px rgba(200,160,60,.1);
      }
    }
    .search-hint {
      position: absolute; left: 43px; top: 50%; transform: translateY(-50%);
      display: flex; align-items: center; gap: 5px;
      font-family: sans-serif; font-size: 13px; color: rgba(200,160,60,.32);
      pointer-events: none; user-select: none; white-space: nowrap;
    }
    .search-hint__kbd {
      display: inline-flex; align-items: center; justify-content: center;
      font-family: monospace; font-size: 11px; line-height: 1;
      padding: 2px 6px; border: 1px solid rgba(200,160,60,.35); border-radius: 3px;
      background: rgba(200,160,60,.08); color: rgba(200,160,60,.6);
      box-shadow: 0 1px 0 rgba(200,160,60,.2);
    }
    .search-icon { color: #6a5a48; flex-shrink: 0; }
    .search {
      flex: 1; background: transparent; border: none; outline: none;
      font-family: sans-serif; font-size: 14px; color: #c8baa8; min-width: 0;
      &::placeholder { color: #4a3a28; }
    }
    .search-clear {
      background: transparent; border: none; padding: 0; cursor: pointer;
      color: #4a3a28; display: flex; align-items: center; flex-shrink: 0;
      transition: color .12s;
      &:hover { color: #c8a03c; }
    }
    .count { font-family: sans-serif; font-size: 11px; color: rgba(200,160,60,.35); white-space: nowrap; flex-shrink: 0; }

    /* ── Filter bars ── */
    .filters {
      display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
      padding: 7px 14px; border-bottom: 1px solid rgba(200,160,60,.15);
      flex-shrink: 0; background: rgba(8,5,18,.7);
    }
    .filter-label {
      font-family: sans-serif; font-size: 10px; letter-spacing: .07em;
      text-transform: uppercase; color: rgba(200,160,60,.35);
      flex-shrink: 0; margin-right: 2px;
    }
    .sort-toggle {
      margin-left: auto; flex-shrink: 0; display: flex; gap: 4px;
    }

    /* ── Scroll area ── */
    .scroll {
      flex: 1; overflow-y: auto; padding: 6px 12px 12px;
      scrollbar-width: thin; scrollbar-color: rgba(200,160,60,.3) rgba(5,3,12,.6);
    }
    .group { margin-bottom: 14px; }
    .group-heading {
      font-family: sans-serif; font-size: 13px; font-weight: 700;
      letter-spacing: .1em; text-transform: uppercase;
      color: rgba(200,160,60,.55); padding: 6px 2px 5px;
      border-bottom: 1px solid rgba(200,160,60,.12); margin-bottom: 5px;
      display: flex; align-items: center; gap: 6px;
    }
    .group-count { margin-left: auto; opacity: .45; font-weight: 400; }
    .grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 4px;
    }

    /* ── Monster card ── */
    .card {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 9px; background: rgba(5,3,12,.55);
      border: 1px solid rgba(200,160,60,.1); border-radius: 5px;
      color: #c8b896; font-family: sans-serif; font-size: 12px;
      cursor: pointer; text-align: left;
      transition: background .14s, color .14s, border-color .14s, box-shadow .14s;
      min-height: 38px;
      &:hover {
        background: rgba(200,160,60,.09); color: #e8c96a;
        border-color: rgba(200,160,60,.26); box-shadow: 0 2px 8px rgba(200,160,60,.09);
        .cr-badge { opacity: .9; }
      }
    }
    .card-name {
      flex: 1; line-height: 1.3;
      ::ng-deep .hl { color: #f5d76e; font-weight: 700; }
    }
    .cr-badge {
      flex-shrink: 0; min-width: 22px; height: 18px; border-radius: 3px;
      font-family: sans-serif; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px; opacity: .75; transition: opacity .14s;
      border: 1px solid rgba(200,80,60,.35); background: rgba(200,80,60,.1); color: rgba(220,120,80,.8);
    }
    .init-btn {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px;
      background: none; border: 1px solid rgba(80,160,220,.2); border-radius: 4px;
      color: rgba(80,160,220,.35);
      cursor: pointer; padding: 0;
      transition: all .15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { border-color: rgba(80,160,220,.7); color: #60c8f8; background: rgba(60,130,200,.12); }
      &.added { border-color: rgba(60,220,100,.7); color: #60ee88; background: rgba(40,180,80,.1); }
    }

    /* ── States ── */
    .state {
      padding: 48px 24px; text-align: center; font-family: sans-serif; font-size: 13px;
      color: rgba(200,160,60,.3); font-style: italic;
      mat-icon { display: block; font-size: 36px; width: 36px; height: 36px; margin: 0 auto 12px; color: rgba(200,160,60,.18); }
    }
  `,
  template: `
    <!-- Search -->
    <div class="header">
      <div class="search-wrap">
        <div class="search-row">
          <svg class="search-icon" viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            #searchInput
            class="search"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            (focus)="searchFocused.set(true)"
            (blur)="searchFocused.set(false)"
            placeholder=""
            autocomplete="off" spellcheck="false"
          />
          @if (!searchQuery() && !searchFocused()) {
            <span class="search-hint" aria-hidden="true">
              <kbd class="search-hint__kbd">/</kbd> pro vyhledávání
            </span>
          }
          @if (searchQuery()) {
            <button class="search-clear" type="button" (click)="clearSearch()" title="Vymazat">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          }
        </div>
      </div>
      <span class="count">{{ filtered().length }}&thinsp;/&thinsp;{{ monstersService.allMonsters().length }}</span>
    </div>

    <!-- Type filter chips + sort toggle -->
    @if (monstersService.availableTypes().length > 0) {
      <div class="filters">
        <span class="filter-label">Typ</span>
        <button class="pt-filter-btn" [class.active]="selectedType() === null" type="button" (click)="selectedType.set(null)">Vše</button>
        @for (t of monstersService.availableTypes(); track t) {
          <button class="pt-filter-btn" [class.active]="selectedType() === t" type="button" (click)="toggleType(t)">{{ t }}</button>
        }
        <div class="sort-toggle" role="group" aria-label="Řazení">
          <button class="pt-filter-btn" [class.active]="sortMode() === 'type'" type="button"
            (click)="sortMode.set('type')" matTooltip="Řadit podle typu">Typ</button>
          <button class="pt-filter-btn" [class.active]="sortMode() === 'cr'" type="button"
            (click)="sortMode.set('cr')" matTooltip="Řadit podle nebezpečnosti">NB</button>
        </div>
      </div>
    }

    <!-- CR range filter chips -->
    @if (availableCrRanges().length > 0) {
      <div class="filters">
        <span class="filter-label">NB</span>
        <button class="pt-filter-btn pt-filter-btn--cr" [class.active]="selectedCrRange() === null" type="button" (click)="selectedCrRange.set(null)">Vše</button>
        @for (range of availableCrRanges(); track range.label) {
          <button
            class="pt-filter-btn pt-filter-btn--cr"
            [class.active]="selectedCrRange() === range.label"
            type="button"
            (click)="toggleCrRange(range.label)"
            [matTooltip]="'Filtrovat: ' + range.label"
          >{{ range.label }}</button>
        }
      </div>
    }

    <!-- Grouped content -->
    <div class="scroll">
      @if (monstersService.allMonsters().length === 0) {
        <div class="state"><mat-icon>hourglass_empty</mat-icon>Načítám seznam netvorů&#8230;</div>
      } @else if (filtered().length === 0) {
        <div class="state"><mat-icon>search_off</mat-icon>Žádný netvor neodpovídá.</div>
      } @else {
        @for (group of grouped(); track group.label) {
          <div class="group">
            <div class="group-heading">
              {{ group.label }}
              <span class="group-count">({{ group.monsters.length }})</span>
            </div>
            <div class="grid">
              @for (item of group.monsters; track item.monster.slug) {
                <button
                  class="card"
                  type="button"
                  (click)="openDetail(item.monster.name)"
                  [matTooltip]="cardTooltip(item.monster)"
                  matTooltipShowDelay="500"
                >
                  <span class="card-name" [innerHTML]="item.highlightedName"></span>
                  @if (item.monster.crDisplay) {
                    <span class="cr-badge" [matTooltip]="'Nebezpečnost ' + item.monster.crDisplay" matTooltipShowDelay="700">
                      {{ item.monster.crDisplay }}
                    </span>
                  }
                  <button
                    class="init-btn"
                    [class.added]="justAdded() === item.monster.slug"
                    type="button"
                    (click)="addToInitiative($event, item.monster)"
                    matTooltip="Přidat do iniciativy"
                    matTooltipShowDelay="400"
                  ><mat-icon>bolt</mat-icon></button>
                </button>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class MonstersTabComponent {
  readonly active = input<boolean>(false);
  readonly monstersService = inject(JadMonstersService);
  private readonly dialog = inject(MatDialog);
  private readonly bridge = inject(InitiativeBridgeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly searchFocused = signal(false);
  readonly selectedType = signal<string | null>(null);
  readonly selectedCrRange = signal<string | null>(null);
  readonly sortMode = signal<'type' | 'cr'>('type');
  readonly justAdded = signal<string | null>(null);
  private readonly _addedSlug$ = new Subject<string | null>();
  private readonly _searchRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Expose range definitions to the template. */
  readonly crRanges = CR_RANGES;

  /** CR range chips that have at least one monster in the full (unfiltered) list. */
  readonly availableCrRanges = computed((): CrRange[] => {
    const all = this.monstersService.allMonsters();
    return CR_RANGES.filter(range =>
      all.some(m => m.cr !== undefined && m.cr >= range.min && m.cr <= range.max)
    );
  });

  readonly filtered = computed((): MonsterItem[] => {
    const q = JadMonstersService.normalizeStr(this.searchQuery());
    const type = this.selectedType();
    const crRangeLabel = this.selectedCrRange();
    const crRange = crRangeLabel ? CR_RANGES.find(r => r.label === crRangeLabel) ?? null : null;

    const result: MonsterItem[] = [];
    for (const m of this.monstersService.allMonsters()) {
      if (type !== null && m.type !== type) continue;
      if (crRange !== null) {
        // Monsters with unknown CR are excluded when a range is active
        if (m.cr === undefined || m.cr < crRange.min || m.cr > crRange.max) continue;
      }
      if (!q) {
        result.push({ monster: m, highlightedName: escHtml(m.name) });
      } else {
        const normName = posNorm(m.name);
        const indices = fuzzySubsequence(q, normName);
        if (indices !== null) {
          result.push({ monster: m, highlightedName: buildHighlightHtml(m.name, indices) });
        }
      }
    }
    return result;
  });

  readonly grouped = computed((): Array<{ label: string; monsters: MonsterItem[] }> => {
    const byCr = this.sortMode() === 'cr';
    const groupMap = new Map<string, MonsterItem[]>();
    for (const item of this.filtered()) {
      const key = byCr ? crGroupLabel(item.monster.cr) : (item.monster.type || 'Ostatní');
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }
    if (byCr) {
      return [...groupMap.entries()]
        .sort(([a], [b]) => this._crLabelToNum(a) - this._crLabelToNum(b))
        .map(([label, monsters]) => ({ label, monsters }));
    }
    return [...groupMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'cs'))
      .map(([label, monsters]) => ({ label, monsters }));
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.active()) this._searchRef()?.nativeElement.focus();
    });

    // Flash "added" indicator for 1.2 s after each addition
    this._addedSlug$.pipe(
      switchMap(slug => merge(of(slug), timer(1200).pipe(map(() => null)))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(v => this.justAdded.set(v));
  }

  toggleType(type: string): void {
    this.selectedType.update(cur => (cur === type ? null : type));
  }

  toggleCrRange(label: string): void {
    this.selectedCrRange.update(cur => (cur === label ? null : label));
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this._searchRef()?.nativeElement.focus();
  }

  /** Focus the search input when '/' is pressed outside any text field. */
  onDocKeydown(event: KeyboardEvent): void {
    if (event.key !== '/') return;
    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      (active as HTMLElement)?.isContentEditable
    ) return;
    event.preventDefault();
    this._searchRef()?.nativeElement.focus();
  }

  cardTooltip(m: JadMonster): string {
    const parts: string[] = [];
    if (m.size) parts.push(m.size);
    if (m.type) parts.push(m.type);
    if (m.crDisplay) parts.push(`NB ${m.crDisplay}`);
    return parts.join(' · ') || 'Zobrazit detail';
  }

  openDetail(name: string): void {
    const n = name.trim();
    if (!n) return;
    this.dialog.open(MonsterDetailDialogComponent, {
      data: { monsterName: n } satisfies MonsterDetailDialogData,
      panelClass: 'monster-detail-panel',
      maxWidth: '96vw',
    });
  }

  addToInitiative(event: MouseEvent, monster: JadMonster): void {
    event.stopPropagation();
    this.bridge.addMonster(monster.name);
    this._addedSlug$.next(monster.slug);
  }

  private _crLabelToNum(label: string): number {
    if (label === 'Ostatní') return 9999;
    const m = label.match(/NB (.+)/);
    if (!m) return 9998;
    const v = m[1];
    if (v === '1/8') return 0.125;
    if (v === '1/4') return 0.25;
    if (v === '1/2') return 0.5;
    return parseFloat(v) || 9997;
  }
}

