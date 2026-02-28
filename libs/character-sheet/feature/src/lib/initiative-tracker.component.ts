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
    <div class="it-wrapper">
      <div class="it-card">
        <div class="it-header">
          <mat-icon class="it-header__icon">shield</mat-icon>
          <h2 class="it-header__title">Sledování iniciativy</h2>
        </div>
        <p class="it-notice">Data se ukládají pouze v tomto prohlížeči — na jiném zařízení budou řádky prázdné.</p>

        <!-- Column headers -->
        <div class="it-col-headers">
          <span class="it-col-header it-col-header--indicator"></span>
          <span class="it-col-header it-col-header--sm">⚔ Init.</span>
          <span class="it-col-header it-col-header--name">👤 Jméno</span>
          <span class="it-col-header it-col-header--sm">🛡 OČ</span>
          <span class="it-col-header it-col-header--sm">❤ HP</span>
          <span class="it-col-header it-col-header--del"></span>
        </div>

        <div class="it-rows">
          @for (row of rows(); track $index) {
          <div class="it-row" [class.it-row--odd]="$index % 2 === 1" [class.it-row--active]="$index === activeIndex()">
            <span class="it-turn-indicator">{{ $index === activeIndex() ? '▶' : '' }}</span>
            <input [(ngModel)]="row.initiative" type="number" class="it-input it-input--sm" placeholder="—" />
            <input [(ngModel)]="row.name" type="text" class="it-input it-input--name" placeholder="Název / jméno" />
            <input [(ngModel)]="row.ac" type="number" class="it-input it-input--sm" placeholder="—" />
            <input [(ngModel)]="row.hp" type="number" class="it-input it-input--sm" placeholder="—" />
            <button mat-icon-button type="button" (click)="removeRow($index)" class="it-remove-btn" title="Odstranit řádek">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          }
        </div>

        <div class="it-actions">
          <button type="button" class="it-btn it-btn--add" (click)="addRow()">
            <mat-icon>add</mat-icon>
            Přidat
          </button>
          <button type="button" class="it-btn it-btn--next" (click)="nextRow()">
            <mat-icon>arrow_downward</mat-icon>
            Další tah
          </button>
          <button type="button" class="it-btn it-btn--sort" (click)="sortRows()">
            <mat-icon>sort</mat-icon>
            Seřadit
          </button>
          <button type="button" class="it-btn it-btn--save" (click)="save()">
            <mat-icon>save</mat-icon>
            Uložit
          </button>
        </div>

        @if (savedMessage()) {
        <p class="it-saved-msg">✓ Uloženo do prohlížeče</p>
        }
      </div>
    </div>
  `,
  styles: `
    /* ── Outer wrapper ───────────────────────────────────────────── */
    :host {
      display: block;
      height: 100%;
    }

    .it-wrapper {
      height: 100%;
      overflow-y: auto;
      padding: 32px 24px;
      background:
        linear-gradient(rgba(10,10,20,.78), rgba(10,10,20,.78)),
        url('https://www.transparenttextures.com/patterns/dark-leather.png');
      background-color: #12111a;
      box-sizing: border-box;
    }

    /* ── Card ────────────────────────────────────────────────────── */
    .it-card {
      max-width: 720px;
      background: rgba(25, 22, 38, 0.92);
      border: 1px solid rgba(200,160,60,.35);
      border-radius: 10px;
      padding: 28px 28px 24px;
      box-shadow: 0 8px 40px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,220,100,.08);
    }

    /* ── Header ──────────────────────────────────────────────────── */
    .it-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .it-header__icon {
      color: #c8a03c;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .it-header__title {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #e8d5a0;
      letter-spacing: .04em;
      text-shadow: 0 1px 8px rgba(200,160,60,.4);
    }

    /* ── Notice ──────────────────────────────────────────────────── */
    .it-notice {
      margin: 0 0 20px;
      font-size: 11px;
      color: #6b6580;
    }

    /* ── Column headers ──────────────────────────────────────────── */
    .it-col-headers {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 0 6px 0;
      border-bottom: 1px solid rgba(200,160,60,.25);
      margin-bottom: 6px;
    }

    .it-col-header {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #c8a03c;
      user-select: none;
    }

    .it-col-header--indicator { width: 14px; flex-shrink: 0; }
    .it-col-header--sm  { width: 70px; text-align: center; flex-shrink: 0; }
    .it-col-header--name { flex: 1; padding-left: 4px; }
    .it-col-header--del  { width: 40px; flex-shrink: 0; }

    /* ── Rows ────────────────────────────────────────────────────── */
    .it-rows {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 20px;
    }

    .it-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px;
      border-radius: 5px;
      background: rgba(255,255,255,.03);
      transition: background .15s;
    }

    .it-row--odd {
      background: rgba(255,255,255,.055);
    }

    .it-row--active {
      background: rgba(200,160,60,.15) !important;
      border: 1px solid rgba(200,160,60,.5);
      box-shadow: 0 0 10px rgba(200,160,60,.15);
    }

    .it-row:hover {
      background: rgba(200,160,60,.07);
    }

    .it-turn-indicator {
      width: 14px;
      flex-shrink: 0;
      color: #c8a03c;
      font-size: 12px;
      text-align: center;
    }

    /* ── Inputs ──────────────────────────────────────────────────── */
    .it-input {
      padding: 7px 10px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 5px;
      font-size: 14px;
      background: rgba(0,0,0,.35);
      color: #e8e0d0;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }

    .it-input::placeholder { color: #4a4560; }

    .it-input:focus {
      border-color: #c8a03c;
      box-shadow: 0 0 0 2px rgba(200,160,60,.2);
    }

    .it-input--sm {
      width: 70px;
      text-align: center;
      flex-shrink: 0;
    }

    .it-input--name {
      flex: 1;
    }

    /* hide number spinners */
    .it-input[type=number]::-webkit-inner-spin-button,
    .it-input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
    .it-input[type=number] { -moz-appearance: textfield; }

    /* ── Remove button ───────────────────────────────────────────── */
    .it-remove-btn {
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      flex-shrink: 0;
      color: #6b6580 !important;
      transition: color .15s !important;
    }

    .it-remove-btn:hover { color: #e05555 !important; }

    /* ── Action buttons ──────────────────────────────────────────── */
    .it-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .it-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 8px 18px;
      border: 1px solid transparent;
      border-radius: 5px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: .03em;
      transition: filter .15s, transform .1s;
    }

    .it-btn:active { transform: scale(.97); }

    .it-btn--add {
      background: #2a2540;
      border-color: rgba(200,160,60,.3);
      color: #c8a03c;
    }
    .it-btn--add:hover { filter: brightness(1.3); }

    .it-btn--next {
      background: #2a1a10;
      border-color: rgba(220,120,40,.4);
      color: #e08840;
    }
    .it-btn--next:hover { filter: brightness(1.3); }

    .it-btn--sort {
      background: #152040;
      border-color: rgba(60,120,200,.4);
      color: #78aae8;
    }
    .it-btn--sort:hover { filter: brightness(1.3); }

    .it-btn--save {
      background: #0f2a18;
      border-color: rgba(60,180,90,.4);
      color: #6ecf8a;
    }
    .it-btn--save:hover { filter: brightness(1.3); }

    /* ── Saved message ───────────────────────────────────────────── */
    .it-saved-msg {
      margin: 14px 0 0;
      font-size: 13px;
      color: #6ecf8a;
      letter-spacing: .02em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconButton, MatIcon],
})
export class InitiativeTrackerComponent {
  private readonly localStorageService = inject(LocalStorageService);

  rows = signal<InitiativeRow[]>(this._load());
  activeIndex = signal(0);
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
    // keep activeIndex in bounds
    this.activeIndex.update(i => Math.min(i, Math.max(0, this.rows().length - 1)));
  }

  nextRow() {
    const len = this.rows().length;
    if (len === 0) return;
    this.activeIndex.update(i => (i + 1) % len);
  }

  sortRows() {
    this.rows.update(rows => [...rows].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)));
    this.activeIndex.set(0);
  }

  save() {
    this.localStorageService.setDataSync(STORAGE_KEY, this.rows());
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 2000);
  }
}
