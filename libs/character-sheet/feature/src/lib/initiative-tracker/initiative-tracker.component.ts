import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '@dn-d-servant/util';
import { Dnd5eApiService, Monster } from '@dn-d-servant/data-access';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MonsterCardComponent } from './monster-card/monster-card.component';

interface InitiativeRow {
  initiative: number | null;
  name: string;
  ac: number | null;
  hp: number | null;
}

const STORAGE_KEY = 'initiative-tracker';

@Component({
  selector: 'initiative-tracker',
  templateUrl: './initiative-tracker.component.html',
  styleUrl: './initiative-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconButton, MatIcon, MonsterCardComponent],
})
export class InitiativeTrackerComponent {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dnd5eApi = inject(Dnd5eApiService);

  rows = signal<InitiativeRow[]>(this._load());
  activeIndex = signal(0);
  savedMessage = signal(false);
  loadingIndex = signal<number | null>(null);
  selectedRowIndex = signal<number | null>(null);
  monsterData = signal<Monster | null>(null);
  monsterError = signal<string | null>(null);

  private _load(): InitiativeRow[] {
    const saved = this.localStorageService.getDataSync<InitiativeRow[]>(STORAGE_KEY);
    return saved ?? [this._emptyRow()];
  }

  private _emptyRow(): InitiativeRow {
    return { initiative: null, name: '', ac: null, hp: null };
  }

  addRow() {
    this.rows.update(r => [...r, this._emptyRow()]);
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

    const index = (name ?? '')
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
      },
      error: () => {
        this.monsterError.set(`Příšera „${name.trim()}" nebyla nalezena.`);
        this.loadingIndex.set(null);
      },
    });
  }

  closeMonster() {
    this.selectedRowIndex.set(null);
    this.loadingIndex.set(null);
    this.monsterData.set(null);
    this.monsterError.set(null);
  }
}
