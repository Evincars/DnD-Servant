import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService, Monster, MONSTER_NAMES } from '@dn-d-servant/util';
import { AutofillInputComponent } from '@dn-d-servant/ui';
import { Dnd5eApiService } from '@dn-d-servant/data-access';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MonsterCardComponent } from '@dn-d-servant/dnd-rules-database-feature';

interface InitiativeRow {
  initiative: number | null;
  name: string;
  ac: number | null;
  hp: number | null;
  /** Temporary delta used by the +/- HP adjuster — defaults to 1 */
  hpDelta: number;
}

const STORAGE_KEY = 'initiative-tracker';

@Component({
  selector: 'initiative-tracker',
  templateUrl: './initiative-tracker.component.html',
  styleUrl: './initiative-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconButton, MatIcon, MatTooltip, MonsterCardComponent, AutofillInputComponent],
})
export class InitiativeTrackerComponent {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dnd5eApi = inject(Dnd5eApiService);

  /** When true the monster-lookup search button is disabled (use DM tools page instead). */
  readonly disableMonsterSearch = input(false);

  readonly monsterNames = MONSTER_NAMES;

  rows = signal<InitiativeRow[]>(this._load());
  activeIndex = signal(0);
  savedMessage = signal(false);
  loadingIndex = signal<number | null>(null);
  selectedRowIndex = signal<number | null>(null);
  monsterData = signal<Monster | null>(null);
  monsterError = signal<string | null>(null);

  private _load(): InitiativeRow[] {
    const saved = this.localStorageService.getDataSync<InitiativeRow[]>(STORAGE_KEY);
    return saved?.map(r => ({ hpDelta: 1, ...r })) ?? [this._emptyRow()];
  }

  private _emptyRow(): InitiativeRow {
    return { initiative: null, name: '', ac: null, hp: null, hpDelta: 1 };
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
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2000);
  }

  lookupMonster(name: string, rowIndex: number) {
    if (this.selectedRowIndex() === rowIndex) {
      this.closeMonster();
      return;
    }

    // Strip copy-postfix (e.g. "Berserker B" → "Berserker") and find canonical name
    const canonical = this._resolveCanonicalMonsterName(name);

    const index = (canonical ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!index) return;

    this.selectedRowIndex.set(rowIndex);
    this.loadingIndex.set(rowIndex);
    this.monsterData.set(null);
    this.monsterError.set(null);

    this.dnd5eApi.getMonster(index).subscribe({
      next: m => {
        this.monsterData.set(m);
        this.loadingIndex.set(null);
        // Auto-fill AC and HP into the row
        this.rows.update(rows =>
          rows.map((row, i) =>
            i === rowIndex
              ? {
                  ...row,
                  ac: m.armor_class?.[0]?.value ?? row.ac,
                  hp: m.hit_points ?? row.hp,
                }
              : row,
          ),
        );
      },
      error: () => {
        this.monsterError.set(`Příšera „${name.trim()}" nebyla nalezena.`);
        this.loadingIndex.set(null);
      },
    });
  }

  /** Strips trailing single-letter copy postfix (e.g. " B", " C") then finds the
   *  best match in MONSTER_NAMES (case-insensitive). Falls back to the raw name. */
  private _resolveCanonicalMonsterName(name: string): string {
    const baseName = this._extractBaseName(name.trim());
    const lower = baseName.toLowerCase();
    const match = MONSTER_NAMES.find(m => m.toLowerCase() === lower);
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
  }
}
