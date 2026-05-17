import {
  ChangeDetectionStrategy, Component, computed, DestroyRef,
  effect, ElementRef, inject, input, signal, untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  catchError, debounceTime, fromEvent, map, merge,
  Observable, of, skip, Subject, switchMap, timer,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  LocalStorageService, Monster, INITIATIVE_TRACKER_KEY,
  COMBINED_MONSTER_NAMES, COMBINED_MONSTER_MAP, normalizeMonsterName,
} from '@dn-d-servant/util';
import { AutofillInputComponent } from '@dn-d-servant/ui';
import { Dnd5eApiService, JadBestiaryService } from '@dn-d-servant/data-access';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MonsterCardComponent, JadMonsterCardComponent } from '@dn-d-servant/dnd-rules-database-feature';

interface InitiativeRow {
  id: number;
  initiative: number | null;
  name: string;
  ac: number | null;
  baseAc: number | null;
  hp: number | null;
  maxHp: number | null;
  hpDelta: number;
}

interface MonsterLookupResult {
  isJad: boolean;
  monster: Monster | null;
  jadMonsterHtml: string | null;
  hitPoints: number | null;
  hitPointsRoll: string | null;
  armorClass: number | null;
  error: string | null;
}

interface MonsterCardEntry {
  rowId: number;
  rowName: string;
  isJad: boolean;
  monster: Monster | null;
  jadMonsterHtml: string | null;
  hitPointsRoll: string | null;
  hitPointsAverage: number | null;
  armorClass: number | null;
  error: string | null;
  loading: boolean;
  highlightAnim: boolean;
  collapsed: boolean;
}

const STORAGE_KEY = INITIATIVE_TRACKER_KEY;

@Component({
  selector: 'initiative-tracker',
  templateUrl: './initiative-tracker.component.html',
  styleUrl: './initiative-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconButton, MatIcon, MatTooltip, MonsterCardComponent, JadMonsterCardComponent, AutofillInputComponent],
})
export class InitiativeTrackerComponent {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dnd5eApi = inject(Dnd5eApiService);
  private readonly jadBestiary = inject(JadBestiaryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  /** When true the monster-lookup search button is disabled (use DM tools page instead). */
  readonly disableMonsterSearch = input(false);

  readonly monsterNames = COMBINED_MONSTER_NAMES as string[];

  private _nextId = 1;

  rows = signal<InitiativeRow[]>(this._load());
  activeIndex = signal(0);
  savedMessage = signal(false);
  openCards = signal<MonsterCardEntry[]>([]);
  initDialogOpen = signal(false);
  private readonly _initPending = signal(0);
  readonly initRunning = computed(() => this._initPending() > 0);

  /** Fast O(1) card lookup by rowId, derived from openCards signal. */
  readonly openCardByRowId = computed(() =>
    new Map(this.openCards().map(c => [c.rowId, c]))
  );

  /** True when every open card is expanded (none collapsed). */
  readonly allCardsExpanded = computed(() =>
    this.openCards().length > 0 && this.openCards().every(c => !c.collapsed)
  );

  private readonly _saveMsg$ = new Subject<void>();

  constructor() {
    // ① native input events – fires when the user types in any input inside this component
    const inputEvents$ = fromEvent(this.elRef.nativeElement, 'input');
    // ② structural changes – fires when rows are added, removed, sorted, copied
    const structuralChanges$ = toObservable(this.rows).pipe(skip(1));

    merge(inputEvents$, structuralChanges$)
      .pipe(debounceTime(1500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.localStorageService.setDataSync(STORAGE_KEY, this.rows());
        this._saveMsg$.next();
      });

    // Replace setTimeout saved-message timer with RxJS
    this._saveMsg$.pipe(
      switchMap(() => merge(of(true), timer(2000).pipe(map(() => false)))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(v => this.savedMessage.set(v));

    // Auto-expand the active row's card and collapse all others when turn changes.
    // Only tracks activeIndex — rows/openCards are read without creating dependencies.
    effect(() => {
      const idx = this.activeIndex();
      const activeRowId = untracked(() => this.rows())[idx]?.id;
      if (activeRowId === undefined || untracked(() => this.openCards()).length === 0) return;
      this.openCards.update(cards =>
        cards.map(c => ({ ...c, collapsed: c.rowId !== activeRowId }))
      );
    });
  }

  private _load(): InitiativeRow[] {
    const saved = this.localStorageService.getDataSync<InitiativeRow[]>(STORAGE_KEY);
    if (!saved) return [this._emptyRow()];
    return saved.map(r => ({
      ...r,
      id: r.id ?? this._nextId++,
      hpDelta: r.hpDelta ?? 1,
      maxHp: r.maxHp ?? null,
      baseAc: r.baseAc ?? null,
    }));
  }

  private _emptyRow(): InitiativeRow {
    return { id: this._nextId++, initiative: null, name: '', ac: null, baseAc: null, hp: null, maxHp: null, hpDelta: 1 };
  }

  addRow() {
    this.rows.update(r => [...r, this._emptyRow()]);
  }

  copyRow(index: number) {
    const row = this.rows()[index];
    const baseName = this._extractBaseName(row.name);
    const existingNames = new Set(this.rows().map(r => r.name));

    const letters = 'BCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nextLetter = '';
    for (const letter of letters) {
      if (!existingNames.has(`${baseName} ${letter}`)) {
        nextLetter = letter;
        break;
      }
    }
    if (!nextLetter) return;

    const newRow: InitiativeRow = { ...row, id: this._nextId++, name: `${baseName} ${nextLetter}` };
    this.rows.update(rows => [
      ...rows.slice(0, index + 1),
      newRow,
      ...rows.slice(index + 1),
    ]);
  }

  addHp(index: number) {
    this.rows.update(rows =>
      rows.map((row, i) =>
        i === index ? { ...row, hp: (row.hp ?? 0) + (row.hpDelta || 1) } : row,
      ),
    );
  }

  removeHp(index: number) {
    this.rows.update(rows =>
      rows.map((row, i) =>
        i === index ? { ...row, hp: (row.hp ?? 0) - (row.hpDelta || 1) } : row,
      ),
    );
  }

  removeRow(index: number) {
    const row = this.rows()[index];
    this.rows.update(r => r.filter((_, i) => i !== index));
    this.activeIndex.update(i => Math.min(i, Math.max(0, this.rows().length - 1)));
    if (row) {
      this.openCards.update(cards => cards.filter(c => c.rowId !== row.id));
    }
  }

  nextRow() {
    const len = this.rows().length;
    if (len === 0) return;
    this.activeIndex.update(i => (i + 1) % len);
  }

  sortRows() {
    this.rows.update(r => [...r].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    this.activeIndex.set(0);
  }

  save() {
    this.localStorageService.setDataSync(STORAGE_KEY, this.rows());
    this._saveMsg$.next();
  }

  /** Returns HP as a percentage of maxHp (0–100). */
  hpPercent(row: InitiativeRow): number {
    if (!row.maxHp || row.hp === null) return 100;
    return Math.max(0, Math.min(100, (row.hp / row.maxHp) * 100));
  }

  lookupMonster(name: string, rowId: number) {
    const existing = this.openCardByRowId().get(rowId);
    if (existing) {
      // Card already open — trigger highlight animation and expand it
      this.openCards.update(cards =>
        cards.map(c => c.rowId === rowId ? { ...c, highlightAnim: true, collapsed: false } : c)
      );
      return;
    }

    if (!name.trim()) return;

    // Add loading placeholder to queue
    this.openCards.update(cards => [...cards, {
      rowId, rowName: name, isJad: false,
      monster: null, jadMonsterHtml: null,
      hitPointsRoll: null, hitPointsAverage: null, armorClass: null,
      error: null, loading: true, highlightAnim: false, collapsed: false,
    }]);

    this._monsterLookup$(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this._applyHpAcToRow(rowId, result.hitPoints, result.armorClass);
        this.openCards.update(cards =>
          cards.map(c => c.rowId === rowId ? {
            ...c,
            isJad: result.isJad,
            monster: result.monster,
            jadMonsterHtml: result.jadMonsterHtml,
            error: result.error,
            loading: false,
            hitPointsRoll: result.hitPointsRoll,
            hitPointsAverage: result.hitPoints,
            armorClass: result.armorClass,
          } : c)
        );
      });
  }

  closeCard(rowId: number) {
    this.openCards.update(cards => cards.filter(c => c.rowId !== rowId));
  }

  clearHighlight(rowId: number) {
    this.openCards.update(cards =>
      cards.map(c => c.rowId === rowId ? { ...c, highlightAnim: false } : c)
    );
  }

  toggleCardCollapse(rowId: number) {
    this.openCards.update(cards =>
      cards.map(c => c.rowId === rowId ? { ...c, collapsed: !c.collapsed } : c)
    );
  }

  toggleAllCards() {
    const expandAll = !this.allCardsExpanded();
    this.openCards.update(cards => cards.map(c => ({ ...c, collapsed: !expandAll })));
  }

  startInitDialog() {
    if (this.initRunning()) return;
    this.initDialogOpen.set(true);
  }

  runInit(mode: 'average' | 'dice') {
    this.initDialogOpen.set(false);
    const rows = this.rows().filter(r => r.name.trim());
    if (!rows.length) return;

    // Reset cards and start fresh
    this.openCards.set([]);
    this._initPending.set(rows.length);

    for (const row of rows) {
      this.openCards.update(cards => [...cards, {
        rowId: row.id, rowName: row.name, isJad: false,
        monster: null, jadMonsterHtml: null,
        hitPointsRoll: null, hitPointsAverage: null, armorClass: null,
        error: null, loading: true, highlightAnim: false, collapsed: false,
      }]);

      this._monsterLookup$(row.name)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          const hp = (mode === 'dice' && result.hitPointsRoll)
            ? this._rollDiceFormula(result.hitPointsRoll)
            : result.hitPoints;

          this._applyHpAcForce(row.id, hp, result.armorClass);

          this.openCards.update(cards =>
            cards.map(c => c.rowId === row.id ? {
              ...c,
              isJad: result.isJad,
              monster: result.monster,
              jadMonsterHtml: result.jadMonsterHtml,
              error: result.error,
              loading: false,
              hitPointsRoll: result.hitPointsRoll,
              hitPointsAverage: result.hitPoints,
              armorClass: result.armorClass,
            } : c)
          );
          this._initPending.update(n => Math.max(0, n - 1));
        });
    }
  }

  // ── Shared monster fetch ──────────────────────────────────────────────────

  private _monsterLookup$(name: string): Observable<MonsterLookupResult> {
    const displayName = this._resolveDisplayName(name.trim());
    const entry = COMBINED_MONSTER_MAP.get(displayName.toLowerCase());

    if (entry?.source === 'jad' || (!entry && this.jadBestiary.isJadMonster(displayName))) {
      const jadName = entry?.canonicalName ?? displayName;
      return this.jadBestiary.getMonster(jadName).pipe(
        map(result => result ? ({
          isJad: true, monster: null,
          jadMonsterHtml: result.html,
          hitPoints: result.hitPoints,
          hitPointsRoll: result.hitPointsRoll ?? null,
          armorClass: result.armorClass,
          error: null,
        } as MonsterLookupResult) : ({
          isJad: true, monster: null, jadMonsterHtml: null,
          hitPoints: null, hitPointsRoll: null, armorClass: null,
          error: `Příšera „${jadName}" nebyla nalezena v JaD wiki.`,
        } as MonsterLookupResult)),
        catchError(() => of<MonsterLookupResult>({
          isJad: true, monster: null, jadMonsterHtml: null,
          hitPoints: null, hitPointsRoll: null, armorClass: null,
          error: `Příšera „${jadName}" nebyla nalezena v JaD wiki.`,
        })),
      );
    }

    const canonicalName = entry?.canonicalName ?? displayName;
    const apiIndex = canonicalName.trim().toLowerCase()
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!apiIndex) {
      return of({ isJad: false, monster: null, jadMonsterHtml: null, hitPoints: null, hitPointsRoll: null, armorClass: null, error: 'Neplatné jméno.' });
    }

    return this.dnd5eApi.getMonster(apiIndex).pipe(
      map(m => ({
        isJad: false, monster: m, jadMonsterHtml: null,
        hitPoints: m.hit_points ?? null,
        hitPointsRoll: m.hit_points_roll ?? null,
        armorClass: m.armor_class?.[0]?.value ?? null,
        error: null,
      } as MonsterLookupResult)),
      catchError(() => of<MonsterLookupResult>({
        isJad: false, monster: null, jadMonsterHtml: null,
        hitPoints: null, hitPointsRoll: null, armorClass: null,
        error: `Příšera „${name.trim()}" nebyla nalezena.`,
      })),
    );
  }

  /** Auto-fills HP/AC only if the user hasn't manually changed them. */
  private _applyHpAcToRow(rowId: number, hp: number | null, ac: number | null): void {
    this.rows.update(rows =>
      rows.map(row => {
        if (row.id !== rowId) return row;
        const hpUnmodified = row.hp === null || row.hp === row.maxHp;
        const acUnmodified = row.ac === null || row.ac === row.baseAc;
        return {
          ...row,
          ac: acUnmodified ? ac : row.ac,
          baseAc: ac,
          hp: hpUnmodified ? hp : row.hp,
          maxHp: hp,
        };
      }),
    );
  }

  /** Force-sets HP/AC (used during initialization — overwrites any user edits). */
  private _applyHpAcForce(rowId: number, hp: number | null, ac: number | null): void {
    this.rows.update(rows =>
      rows.map(row => row.id !== rowId ? row : { ...row, ac, baseAc: ac, hp, maxHp: hp })
    );
  }

  /** Rolls a dice formula like "2d6+2" or "5k8 + 10" (Czech notation supported). */
  private _rollDiceFormula(formula: string): number {
    const norm = formula.replace(/[kK]/g, 'd').replace(/\s+/g, '');
    const match = norm.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!match) {
      const n = parseInt(formula, 10);
      return isNaN(n) ? 1 : n;
    }
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const bonus = match[3] ? parseInt(match[3], 10) : 0;
    let total = bonus;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return Math.max(1, total);
  }

  private _resolveDisplayName(raw: string): string {
    const baseName = this._extractBaseName(raw);
    const normBase = normalizeMonsterName(baseName);
    for (const [key, entry] of COMBINED_MONSTER_MAP) {
      if (normalizeMonsterName(key) === normBase) return entry.display;
    }
    return baseName;
  }

  private _extractBaseName(name: string): string {
    return name.replace(/\s+[B-Z]$/i, '').trim();
  }
}
