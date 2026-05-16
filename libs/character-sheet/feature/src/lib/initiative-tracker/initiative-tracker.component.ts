import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent, merge, skip } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { LocalStorageService, Monster, MONSTER_NAMES, JAD_MONSTER_NAMES, INITIATIVE_TRACKER_KEY } from '@dn-d-servant/util';
import { AutofillInputComponent } from '@dn-d-servant/ui';
import { Dnd5eApiService, JadBestiaryService } from '@dn-d-servant/data-access';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MonsterCardComponent, JadMonsterCardComponent } from '@dn-d-servant/dnd-rules-database-feature';

interface InitiativeRow {
  initiative: number | null;
  name: string;
  ac: number | null;
  /** Base AC as returned by the monster lookup — used to detect whether the user
   *  has already overridden AC so we don't overwrite it on a repeated search. */
  baseAc: number | null;
  hp: number | null;
  /** Max HP as returned by the monster lookup — used to detect whether the user
   *  has already decreased HP so we don't overwrite it on a repeated search. */
  maxHp: number | null;
  /** Temporary delta used by the +/- HP adjuster — defaults to 1 */
  hpDelta: number;
}

const STORAGE_KEY = INITIATIVE_TRACKER_KEY;

/** Combined autocomplete list: JaD Czech names + English API names, sorted. */
const ALL_MONSTER_NAMES: string[] = [
  ...JAD_MONSTER_NAMES,
  ...MONSTER_NAMES,
].sort((a, b) => a.localeCompare(b, 'cs'));

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

  readonly monsterNames = ALL_MONSTER_NAMES;

  rows = signal<InitiativeRow[]>(this._load());
  activeIndex = signal(0);
  savedMessage = signal(false);
  loadingIndex = signal<number | null>(null);
  selectedRowIndex = signal<number | null>(null);
  monsterData = signal<Monster | null>(null);
  monsterError = signal<string | null>(null);
  /** Pre-rendered HTML for a JaD wiki monster (mutually exclusive with monsterData). */
  jadMonsterHtml = signal<string | null>(null);
  /** Tracks whether the current lookup is a JaD wiki lookup (true) or API lookup (false/null). */
  isJadLookup = signal(false);

  private _savedMessageTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // ① native input events – fires when the user types in any input inside
    //   this component (ngModel mutates objects in-place without touching the signal)
    const inputEvents$ = fromEvent(this.elRef.nativeElement, 'input');

    // ② structural changes – fires when rows are added, removed, sorted, copied
    //   (these call signal.update() so the signal emits a new reference)
    const structuralChanges$ = toObservable(this.rows).pipe(skip(1));

    merge(inputEvents$, structuralChanges$)
      .pipe(
        debounceTime(1500),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.localStorageService.setDataSync(STORAGE_KEY, this.rows());
        this._showSavedMessage();
      });
  }

  private _load(): InitiativeRow[] {
    const saved = this.localStorageService.getDataSync<InitiativeRow[]>(STORAGE_KEY);
    return saved?.map(r => ({ ...r, hpDelta: r.hpDelta ?? 1, maxHp: r.maxHp ?? null, baseAc: r.baseAc ?? null })) ?? [this._emptyRow()];
  }

  private _emptyRow(): InitiativeRow {
    return { initiative: null, name: '', ac: null, baseAc: null, hp: null, maxHp: null, hpDelta: 1 };
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

    const newRow: InitiativeRow = { ...row, name: `${baseName} ${nextLetter}` };
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
    this.rows.update(r => r.filter((_, i) => i !== index));
    this.activeIndex.update(i => Math.min(i, Math.max(0, this.rows().length - 1)));
    if (this.selectedRowIndex() === index) this.closeMonster();
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
    this._showSavedMessage();
  }

  private _showSavedMessage() {
    this.savedMessage.set(true);
    if (this._savedMessageTimer) clearTimeout(this._savedMessageTimer);
    this._savedMessageTimer = setTimeout(() => this.savedMessage.set(false), 2000);
  }

  lookupMonster(name: string, rowIndex: number) {
    if (this.selectedRowIndex() === rowIndex) {
      this.closeMonster();
      return;
    }

    // Strip copy-postfix (e.g. "Berserker B" → "Berserker") and find canonical name
    const canonical = this._resolveCanonicalMonsterName(name);

    this.selectedRowIndex.set(rowIndex);
    this.loadingIndex.set(rowIndex);
    this.monsterData.set(null);
    this.monsterError.set(null);
    this.jadMonsterHtml.set(null);
    this.isJadLookup.set(false);

    // ── Try JaD wiki first ──────────────────────────────────────────────────
    if (this.jadBestiary.isJadMonster(canonical)) {
      this.isJadLookup.set(true);
      this.jadBestiary.getMonster(canonical).subscribe({
        next: result => {
          if (result) {
            this.jadMonsterHtml.set(result.html);
            this.loadingIndex.set(null);
            // Auto-fill AC and HP from the JaD monster
            this.rows.update(rows =>
              rows.map((row, i) => {
                if (i !== rowIndex) return row;
                const monsterHp = result.hitPoints;
                const monsterAc = result.armorClass;
                const hpUnmodified = row.hp === null || row.hp === row.maxHp;
                const acUnmodified = row.ac === null || row.ac === row.baseAc;
                return {
                  ...row,
                  ac: acUnmodified ? monsterAc : row.ac,
                  baseAc: monsterAc,
                  hp: hpUnmodified ? monsterHp : row.hp,
                  maxHp: monsterHp,
                };
              }),
            );
          } else {
            this.monsterError.set(`Příšera „${name.trim()}" nebyla nalezena v JaD wiki.`);
            this.loadingIndex.set(null);
          }
        },
        error: () => {
          this.monsterError.set(`Příšera „${name.trim()}" nebyla nalezena v JaD wiki.`);
          this.loadingIndex.set(null);
        },
      });
      return;
    }

    // ── Fall back to D&D 5e API ─────────────────────────────────────────────
    const index = (canonical ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!index) return;

    this.dnd5eApi.getMonster(index).subscribe({
      next: m => {
        this.monsterData.set(m);
        this.loadingIndex.set(null);
        // Auto-fill AC and HP into the row
        this.rows.update(rows =>
          rows.map((row, i) => {
            if (i !== rowIndex) return row;
            const monsterHp = m.hit_points ?? null;
            const monsterAc = m.armor_class?.[0]?.value ?? null;
            // Only override HP if the user hasn't changed it since the last lookup
            const hpUnmodified = row.hp === null || row.hp === row.maxHp;
            // Only override AC if the user hasn't changed it since the last lookup
            const acUnmodified = row.ac === null || row.ac === row.baseAc;
            return {
              ...row,
              ac: acUnmodified ? monsterAc : row.ac,
              baseAc: monsterAc,
              hp: hpUnmodified ? monsterHp : row.hp,
              maxHp: monsterHp,
            };
          }),
        );
      },
      error: () => {
        this.monsterError.set(`Příšera „${name.trim()}" nebyla nalezena.`);
        this.loadingIndex.set(null);
      },
    });
  }

  /** Strips trailing single-letter copy postfix (e.g. " B", " C") then finds the
   *  best match in ALL_MONSTER_NAMES (case-insensitive). Falls back to the raw name. */
  private _resolveCanonicalMonsterName(name: string): string {
    const baseName = this._extractBaseName(name.trim());
    const lower = baseName.toLowerCase();
    const match = ALL_MONSTER_NAMES.find(m => m.toLowerCase() === lower);
    return match ?? baseName;
  }

  /** Removes a trailing " B"…" Z" postfix added by copyRow(). */
  private _extractBaseName(name: string): string {
    return name.replace(/\s+[B-Z]$/i, '').trim();
  }

  closeMonster() {
    this.selectedRowIndex.set(null);
    this.loadingIndex.set(null);
    this.monsterData.set(null);
    this.monsterError.set(null);
    this.jadMonsterHtml.set(null);
    this.isJadLookup.set(false);
  }
}
