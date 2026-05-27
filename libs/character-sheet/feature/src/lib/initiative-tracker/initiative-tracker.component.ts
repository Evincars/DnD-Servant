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
  LocalStorageService, Monster, INITIATIVE_TRACKER_KEY, INITIATIVE_TRACKER_CARDS_KEY,
  COMBINED_MONSTER_NAMES, COMBINED_MONSTER_MAP, normalizeMonsterName,
  InitiativeBridgeService,
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
  /** Deduplication key: `_extractBaseName(rawName)`, e.g. "Goblin" for "Goblin B". */
  baseName: string;
  /** All row IDs associated with this monster (Goblin, Goblin B, Goblin C → same card). */
  rowIds: number[];
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
const CARDS_STORAGE_KEY = INITIATIVE_TRACKER_CARDS_KEY;

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
  private readonly bridge = inject(InitiativeBridgeService);

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

  /** Fast O(1) card lookup by any rowId (all rowIds in a card map to it). */
  readonly openCardByRowId = computed(() => {
    const map = new Map<number, MonsterCardEntry>();
    for (const card of this.openCards()) {
      for (const id of card.rowIds) {
        map.set(id, card);
      }
    }
    return map;
  });

  /** The row-id of the currently active row (tracks both activeIndex and rows). */
  readonly activeRowId = computed(() => {
    const idx = this.activeIndex();
    return this.rows()[idx]?.id ?? null;
  });

  /** True when every open card is expanded (none collapsed). */
  readonly allCardsExpanded = computed(() =>
    this.openCards().length > 0 && this.openCards().every(c => !c.collapsed)
  );

  private readonly _saveMsg$ = new Subject<void>();
  /** Prevents the card-load effect from firing more than once. */
  private _cardsLoaded = false;

  constructor() {
    // ── Bridge: consume monsters added from the Monsters tab ─────────────────
    effect(() => {
      const pending = this.bridge.queue();
      if (!pending.length) return;
      untracked(() => {
        const drained = this.bridge.drain();
        this.rows.update(r => [
          ...r,
          ...drained.map(e => ({ ...this._emptyRow(), name: e.name })),
        ]);
      });
    });

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

    // Auto-expand the active row's card and collapse all others when turn changes
    // or when rows are removed (activeRowId tracks both activeIndex and rows).
    effect(() => {
      const activeId = this.activeRowId();
      untracked(() => this._expandActiveCard(activeId));
    });

    // Load saved cards from localStorage once (only for PH tools page where search is enabled).
    // The effect reads disableMonsterSearch() so it fires after inputs are bound.
    effect(() => {
      if (this._cardsLoaded) return;
      const searchEnabled = !this.disableMonsterSearch();
      this._cardsLoaded = true;
      if (searchEnabled) {
        untracked(() => {
          const saved = this.localStorageService.getDataSync<any[]>(CARDS_STORAGE_KEY);
          if (saved?.length) {
            this.openCards.set(saved.map(c => ({
              // Migrate old format (rowId: number) → new (rowIds: number[], baseName: string)
              baseName: c.baseName ?? this._extractBaseName(c.rowName ?? ''),
              rowIds: c.rowIds ?? (c.rowId !== undefined ? [c.rowId] : []),
              rowName: c.rowName ?? '',
              isJad: c.isJad ?? false,
              monster: c.monster ?? null,
              jadMonsterHtml: c.jadMonsterHtml ?? null,
              hitPointsRoll: c.hitPointsRoll ?? null,
              hitPointsAverage: c.hitPointsAverage ?? null,
              armorClass: c.armorClass ?? null,
              error: c.error ?? null,
              loading: false,
              highlightAnim: false,
              collapsed: c.collapsed ?? false,
            } as MonsterCardEntry)));
          }
        });
      }
    });

    // Persist open cards to localStorage whenever they change (PH tools page only).
    toObservable(this.openCards)
      .pipe(skip(1), debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe(cards => {
        if (!this.disableMonsterSearch()) {
          this.localStorageService.setDataSync(CARDS_STORAGE_KEY, cards.filter(c => !c.loading));
        }
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
      // Remove the rowId from any card that references it; remove card if it has no rowIds left
      this.openCards.update(cards =>
        cards
          .map(c => ({ ...c, rowIds: c.rowIds.filter(id => id !== row.id) }))
          .filter(c => c.rowIds.length > 0)
      );
      // Re-expand the card belonging to the now-active row after removal
      this._expandActiveCard(this.activeRowId());
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
    const baseName = this._extractBaseName(name);
    const existingByBase = this.openCards().find(c => c.baseName === baseName);

    if (existingByBase) {
      // Card already open for this monster — add rowId if missing, highlight, expand
      this.openCards.update(cards =>
        cards.map(c => c.baseName === baseName ? {
          ...c,
          rowIds: c.rowIds.includes(rowId) ? c.rowIds : [...c.rowIds, rowId],
          highlightAnim: true,
          collapsed: false,
        } : c)
      );
      return;
    }

    if (!name.trim()) return;

    // Add loading placeholder to queue
    this.openCards.update(cards => [...cards, {
      baseName,
      rowIds: [rowId],
      rowName: baseName,
      isJad: false,
      monster: null, jadMonsterHtml: null,
      hitPointsRoll: null, hitPointsAverage: null, armorClass: null,
      error: null, loading: true, highlightAnim: false, collapsed: false,
    }]);

    this._monsterLookup$(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this._applyHpAcToRow(rowId, result.hitPoints, result.armorClass);
        this.openCards.update(cards =>
          cards.map(c => c.baseName === baseName ? {
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

  closeCard(baseName: string) {
    this.openCards.update(cards => cards.filter(c => c.baseName !== baseName));
  }

  clearHighlight(baseName: string) {
    this.openCards.update(cards =>
      cards.map(c => c.baseName === baseName ? { ...c, highlightAnim: false } : c)
    );
  }

  toggleCardCollapse(baseName: string) {
    this.openCards.update(cards =>
      cards.map(c => c.baseName === baseName ? { ...c, collapsed: !c.collapsed } : c)
    );
  }

  closeAllCards() {
    this.openCards.set([]);
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

    // Deduplicate: Goblin + Goblin B + Goblin C → one card entry
    const dedupedEntries: { baseName: string; rowIds: number[]; name: string }[] = [];
    const seenBaseNames = new Set<string>();
    for (const row of rows) {
      const baseName = this._extractBaseName(row.name);
      if (seenBaseNames.has(baseName)) {
        dedupedEntries.find(e => e.baseName === baseName)!.rowIds.push(row.id);
      } else {
        seenBaseNames.add(baseName);
        dedupedEntries.push({ baseName, rowIds: [row.id], name: row.name });
      }
    }

    // Reset cards and start fresh
    this.openCards.set([]);
    this._initPending.set(dedupedEntries.length);

    for (const entry of dedupedEntries) {
      this.openCards.update(cards => [...cards, {
        baseName: entry.baseName,
        rowIds: entry.rowIds,
        rowName: entry.baseName,
        isJad: false,
        monster: null, jadMonsterHtml: null,
        hitPointsRoll: null, hitPointsAverage: null, armorClass: null,
        error: null, loading: true, highlightAnim: false, collapsed: false,
      }]);

      this._monsterLookup$(entry.name)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          // Roll separately for each copy so every monster gets its own HP value.
          for (const rowId of entry.rowIds) {
            const hp = (mode === 'dice' && result.hitPointsRoll)
              ? this._rollDiceFormula(result.hitPointsRoll)
              : result.hitPoints;
            this._applyHpAcForce(rowId, hp, result.armorClass);
          }

          this.openCards.update(cards =>
            cards.map(c => c.baseName === entry.baseName ? {
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
        // hit_points_roll (e.g. "9d8+18") is preferred; fall back to hit_dice ("9d8")
        // so the dice mode always has a formula to roll even if the API omits the field.
        hitPointsRoll: (m.hit_points_roll || m.hit_dice) ?? null,
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
    return name.replace(/\s+[A-Z]$/i, '').trim();
  }

  /**
   * Expands the card that owns `activeId` and collapses all others.
   * Called from the activeRowId effect and from removeRow to avoid stale expansion state.
   */
  private _expandActiveCard(activeId: number | null): void {
    if (activeId === null || this.openCards().length === 0) return;
    this.openCards.update(cards =>
      cards.map(c => ({ ...c, collapsed: !c.rowIds.includes(activeId) }))
    );
  }
}
