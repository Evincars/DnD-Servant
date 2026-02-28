import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '@dn-d-servant/util';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

interface InitiativeRow {
  initiative: number | null;
  name: string;
  ac: number | null;
  hp: number | null;
}

const STORAGE_KEY = 'initiative-tracker';

@Component({
  selector: 'initiative-tracker',
  template: `
    <div class="initiative-tracker">
      <h2 class="initiative-tracker__title">Sledování iniciativy</h2>

      <div class="initiative-tracker__rows">
        @for (row of rows(); track $index) {
        <div class="initiative-tracker__row">
          <input
            [(ngModel)]="row.initiative"
            type="number"
            class="initiative-tracker__input initiative-tracker__input--sm"
            placeholder="Init."
          />
          <input
            [(ngModel)]="row.name"
            type="text"
            class="initiative-tracker__input initiative-tracker__input--name"
            placeholder="Jméno"
          />
          <input
            [(ngModel)]="row.ac"
            type="number"
            class="initiative-tracker__input initiative-tracker__input--sm"
            placeholder="OČ"
          />
          <input
            [(ngModel)]="row.hp"
            type="number"
            class="initiative-tracker__input initiative-tracker__input--sm"
            placeholder="HP"
          />
          <button mat-icon-button type="button" (click)="removeRow($index)" class="initiative-tracker__remove-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        }
      </div>

      <div class="initiative-tracker__actions">
        <button type="button" class="initiative-tracker__btn" (click)="addRow()">
          <mat-icon>add</mat-icon>
          Přidat
        </button>
        <button type="button" class="initiative-tracker__btn initiative-tracker__btn--sort" (click)="sortRows()">
          <mat-icon>sort</mat-icon>
          Seřadit
        </button>
        <button type="button" class="initiative-tracker__btn initiative-tracker__btn--save" (click)="save()">
          <mat-icon>save</mat-icon>
          Uložit
        </button>
      </div>

      @if (savedMessage()) {
      <p class="initiative-tracker__saved-msg">Uloženo ✓</p>
      }
    </div>
  `,
  styles: `
    .initiative-tracker {
      padding: 24px;
      max-width: 700px;
    }

    .initiative-tracker__title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }

    .initiative-tracker__rows {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .initiative-tracker__row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .initiative-tracker__input {
      padding: 6px 10px;
      border: 1px solid #aaa;
      border-radius: 4px;
      font-size: 14px;
      background: transparent;
      color: inherit;
      outline: none;
    }

    .initiative-tracker__input:focus {
      border-color: #f57c00;
    }

    .initiative-tracker__input--sm {
      width: 70px;
      text-align: center;
    }

    .initiative-tracker__input--name {
      flex: 1;
    }

    .initiative-tracker__remove-btn {
      opacity: 0.5;
    }

    .initiative-tracker__remove-btn:hover {
      opacity: 1;
    }

    .initiative-tracker__actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .initiative-tracker__btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      background: #444;
      color: #fff;
    }

    .initiative-tracker__btn:hover {
      background: #555;
    }

    .initiative-tracker__btn--sort {
      background: #1565c0;
    }

    .initiative-tracker__btn--sort:hover {
      background: #1976d2;
    }

    .initiative-tracker__btn--save {
      background: #2e7d32;
    }

    .initiative-tracker__btn--save:hover {
      background: #388e3c;
    }

    .initiative-tracker__saved-msg {
      margin-top: 10px;
      color: #66bb6a;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconButton, MatIcon],
})
export class InitiativeTrackerComponent {
  private readonly localStorageService = inject(LocalStorageService);

  rows = signal<InitiativeRow[]>(this._load());
  savedMessage = signal(false);

  private _load(): InitiativeRow[] {
    const saved = this.localStorageService.getDataSync<InitiativeRow[]>(STORAGE_KEY);
    return saved ?? [this._emptyRow()];
  }

  private _emptyRow(): InitiativeRow {
    return { initiative: null, name: '', ac: null, hp: null };
  }

  addRow() {
    this.rows.update(rows => [...rows, this._emptyRow()]);
  }

  removeRow(index: number) {
    this.rows.update(rows => rows.filter((_, i) => i !== index));
  }

  sortRows() {
    this.rows.update(rows => [...rows].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
  }

  save() {
    this.localStorageService.setDataSync(STORAGE_KEY, this.rows());
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2000);
  }
}
