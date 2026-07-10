import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CharacterSheetApiService } from '@dn-d-servant/character-sheet-data-access';
import {
  CharacterSheetApiModel,
  GroupSheetApiModel,
  ItemVaultApiModel,
  NotesPageApiModel,
  QuestsApiModel,
} from '@dn-d-servant/character-sheet-util';
import { DmPageApiService, DmNotesApiModel, DmQuestsApiModel, DmStoryTimelineApiModel } from '@dn-d-servant/dm-page-feature';
import { AuthService } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ── Document-key suffixes (must match component constants) ────────────────────
const GROUP_SUFFIX  = '_group';
const NOTES_SUFFIX  = '_notes';

// ── Internal state ────────────────────────────────────────────────────────────
type DialogState = 'input' | 'loading' | 'confirm' | 'importing' | 'done' | 'error';

type DataKey = 'characterSheet' | 'groupSheet' | 'notesPage' | 'itemVault' | 'quests' | 'dmQuests' | 'dmNotes' | 'dmStoryTimeline';

interface SelectableItem {
  key: DataKey;
  label: string;
  found: boolean;
  selected: boolean;
}

@Component({
  selector: 'import-data-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatIcon, FormsModule],
  template: `
    <div class="id-panel">

      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="id-header">
        <mat-icon class="id-header-icon">cloud_download</mat-icon>
        <span class="id-title">Importovat data z jiného účtu</span>
        @if (state() !== 'importing') {
          <button type="button" class="id-close-btn" (click)="onCancel()" aria-label="Zavřít">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      <!-- ── INPUT state ────────────────────────────────────────── -->
      @if (state() === 'input') {
        <div class="id-body">
          <p class="id-desc">
            Zadej uživatelské jméno, ze kterého chceš přenést data.
            Nalezená data budou zobrazena před samotným importem.
          </p>

          @if (errorMsg()) {
            <div class="id-error">
              <mat-icon>warning</mat-icon>
              {{ errorMsg() }}
            </div>
          }

          <div class="id-field">
            <label class="id-label">Uživatelské jméno zdroje</label>
            <input
              class="id-input"
              type="text"
              [(ngModel)]="importUsername"
              placeholder="např. Armagedon"
              (keydown.enter)="onPreview()"
            />
          </div>
        </div>

        <div class="id-footer">
          <button class="id-btn id-btn--cancel" type="button" (click)="onCancel()">
            <mat-icon>close</mat-icon> Zrušit
          </button>
          <button
            class="id-btn id-btn--primary"
            type="button"
            (click)="onPreview()"
            [disabled]="!importUsername.trim()"
          >
            <mat-icon>search</mat-icon> Najít data
          </button>
        </div>
      }

      <!-- ── LOADING state ──────────────────────────────────────── -->
      @if (state() === 'loading') {
        <div class="id-body id-body--center">
          <div class="id-spinner"></div>
          <p class="id-loading-text">Načítám data z „{{ importUsername }}"…</p>
        </div>
      }

      <!-- ── CONFIRM state ──────────────────────────────────────── -->
      @if (state() === 'confirm') {
        <div class="id-body">
          <!-- Warning box -->
          <div class="id-warn-box">
            <mat-icon class="id-warn-icon">warning</mat-icon>
            <div>
              <p class="id-warn-title">Pozor — přepsání dat!</p>
              <p class="id-warn-text">
                Import přepíše tvá stávající data uložená pod
                <strong class="id-user">{{ currentUsername() }}</strong>.
                Tuto akci nelze vrátit zpět.
              </p>
            </div>
          </div>

          <!-- List heading + select-all toggle -->
          <div class="id-list-header">
            <p class="id-preview-heading">Nalezená data z „{{ importUsername }}":</p>
            @if (foundCount() > 0) {
              <button
                type="button"
                class="id-toggle-all-btn"
                (click)="toggleAll()"
              >
                {{ allSelected() ? 'Zrušit vše' : 'Vybrat vše' }}
              </button>
            }
          </div>

          <!-- Selectable list -->
          <ul class="id-preview-list">
            @for (item of previewItems(); track item.key) {
              <li
                class="id-preview-item"
                [class.id-preview-item--found]="item.found && item.selected"
                [class.id-preview-item--deselected]="item.found && !item.selected"
                [class.id-preview-item--missing]="!item.found"
                (click)="item.found && toggleItem(item.key)"
                [attr.role]="item.found ? 'checkbox' : null"
                [attr.aria-checked]="item.found ? item.selected : null"
              >
                @if (item.found) {
                  <span class="id-checkbox" [class.id-checkbox--checked]="item.selected">
                    @if (item.selected) {
                      <mat-icon>check</mat-icon>
                    }
                  </span>
                } @else {
                  <mat-icon class="id-missing-icon">radio_button_unchecked</mat-icon>
                }
                {{ item.label }}
                @if (!item.found) {
                  <span class="id-preview-empty">(nenalezeno)</span>
                }
              </li>
            }
          </ul>

          @if (foundCount() === 0) {
            <div class="id-error">
              <mat-icon>info</mat-icon>
              U tohoto uživatele nebyla nalezena žádná data.
            </div>
          }
        </div>

        <div class="id-footer">
          <span class="id-selected-count">{{ selectedCount() }} / {{ foundCount() }} vybráno</span>
          <button class="id-btn id-btn--cancel" type="button" (click)="resetToInput()">
            <mat-icon>arrow_back</mat-icon> Zpět
          </button>
          <button
            class="id-btn id-btn--danger"
            type="button"
            (click)="onImport()"
            [disabled]="selectedCount() === 0"
          >
            <mat-icon>download</mat-icon> Potvrdit import
          </button>
        </div>
      }

      <!-- ── IMPORTING state ────────────────────────────────────── -->
      @if (state() === 'importing') {
        <div class="id-body id-body--center">
          <div class="id-spinner"></div>
          <p class="id-loading-text">Importuji data…</p>
          <p class="id-loading-sub">Chviličku strpení, ukládám vše na server.</p>
        </div>
      }

      <!-- ── DONE state ─────────────────────────────────────────── -->
      @if (state() === 'done') {
        <div class="id-body id-body--center">
          <div class="id-success-icon">📦</div>
          <p class="id-done-title">Import dokončen. Refreshni stránku!</p>
          <p class="id-done-sub">
            Data z účtu <strong class="id-user">{{ importUsername }}</strong>
            byla importována pod <strong class="id-user">{{ currentUsername() }}</strong>.
          </p>
        </div>
        <div class="id-footer">
          <button class="id-btn id-btn--primary" type="button" (click)="onClose()">
            <mat-icon>check</mat-icon> Zavřít
          </button>
        </div>
      }

      <!-- ── ERROR state ────────────────────────────────────────── -->
      @if (state() === 'error') {
        <div class="id-body">
          <div class="id-error id-error--large">
            <mat-icon>error_outline</mat-icon>
            <div>
              <p class="id-error-title">Import selhal</p>
              <p class="id-error-detail">{{ errorMsg() }}</p>
            </div>
          </div>
        </div>
        <div class="id-footer">
          <button class="id-btn id-btn--cancel" type="button" (click)="onCancel()">Zavřít</button>
          <button class="id-btn id-btn--primary" type="button" (click)="resetToInput()">
            <mat-icon>refresh</mat-icon> Zkusit znovu
          </button>
        </div>
      }

    </div>
  `,
  styles: `
    /* ── Panel ─────────────────────────────────────────────────── */
    .id-panel {
      display: flex;
      flex-direction: column;
      width: min(500px, 96vw);
      background: linear-gradient(180deg, rgba(8,5,18,.99) 0%, rgba(14,10,24,.99) 100%);
      border: 1px solid rgba(200,160,60,.4);
      border-radius: 10px;
      overflow: hidden;
      position: relative;

      &::before {
        content: '';
        display: none;
      }
    }

    /* ── Header ─────────────────────────────────────────────────── */
    .id-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px 12px;
      border-bottom: 1px solid rgba(200,160,60,.18);
      background: rgba(200,160,60,.04);
      flex-shrink: 0;
    }

    .id-header-icon {
      font-size: 20px; width: 20px; height: 20px;
      color: #7ab8e0; flex-shrink: 0;
    }

    .id-title {
      flex: 1;
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: .08em;
      color: #e8c96a;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
    }

    .id-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px;
      border: none; background: transparent; cursor: pointer;
      border-radius: 4px; color: rgba(200,160,60,.45);
      transition: color .15s, background .15s; flex-shrink: 0;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(200,160,60,.1); color: rgba(200,160,60,.9); }
    }

    /* ── Body ───────────────────────────────────────────────────── */
    .id-body {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 20px 24px;
      flex: 1;

      &--center {
        align-items: center;
        text-align: center;
        padding: 32px 24px;
      }
    }

    /* ── Footer ─────────────────────────────────────────────────── */
    .id-footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding: 12px 24px 18px;
      border-top: 1px solid rgba(200,160,60,.1);
      background: rgba(200,160,60,.02);
    }

    /* ── Description ────────────────────────────────────────────── */
    .id-desc {
      margin: 0;
      font-size: 13px;
      color: rgba(160,140,110,.8);
      line-height: 1.6;
    }

    /* ── Error ──────────────────────────────────────────────────── */
    .id-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: rgba(200,60,60,.1);
      border: 1px solid rgba(200,60,60,.28);
      border-radius: 6px;
      color: #e08080;
      font-size: 12px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }

      &--large { align-items: flex-start;
        mat-icon { font-size: 20px; width: 20px; height: 20px; margin-top: 1px; }
      }
    }

    .id-error-title { margin: 0 0 3px; font-size: 13px; font-weight: 600; color: #e08080; }
    .id-error-detail { margin: 0; font-size: 11px; color: rgba(200,120,120,.7); }

    /* ── Field ──────────────────────────────────────────────────── */
    .id-field { display: flex; flex-direction: column; gap: 5px; }

    .id-label {
      font-size: 11px; font-weight: 600;
      color: #c8a03c; letter-spacing: .08em; text-transform: uppercase;
    }

    .id-input {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 6px;
      padding: 10px 14px;
      color: #e0d4c0; font-size: 14px; outline: none;
      transition: border-color .18s, box-shadow .18s;
      font-family: sans-serif; width: 100%; box-sizing: border-box;

      &::placeholder { color: #4a4050; }
      &:focus { border-color: rgba(200,160,60,.6); box-shadow: 0 0 0 3px rgba(200,160,60,.1); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    /* ── Warning box ────────────────────────────────────────────── */
    .id-warn-box {
      display: flex; gap: 12px;
      padding: 14px;
      background: rgba(200,100,40,.1);
      border: 1px solid rgba(200,100,40,.35);
      border-radius: 6px;
    }

    .id-warn-icon {
      font-size: 22px; width: 22px; height: 22px;
      color: rgba(220,140,60,.9); flex-shrink: 0; margin-top: 1px;
    }

    .id-warn-title {
      margin: 0 0 4px;
      font-family: sans-serif;
      font-size: 12px; color: #e8a060; letter-spacing: .08em; text-transform: uppercase;
    }

    .id-warn-text {
      margin: 0; font-size: 12px; color: rgba(200,160,120,.75); line-height: 1.5;
    }

    /* ── Preview list ────────────────────────────────────────────── */
    .id-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .id-preview-heading {
      margin: 0;
      font-size: 12px; font-weight: 600;
      color: rgba(200,160,60,.7); letter-spacing: .06em; text-transform: uppercase;
    }

    .id-toggle-all-btn {
      flex-shrink: 0;
      background: rgba(200,160,60,.08);
      border: 1px solid rgba(200,160,60,.25);
      border-radius: 4px;
      color: rgba(200,160,60,.7);
      font-size: 11px; letter-spacing: .05em;
      padding: 3px 10px; cursor: pointer;
      transition: background .15s, color .15s;
      &:hover { background: rgba(200,160,60,.18); color: #e8c96a; }
    }

    .id-preview-list {
      list-style: none; margin: 0; padding: 0;
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
    }

    .id-preview-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 10px; border-radius: 5px;
      font-size: 12px; transition: background .15s, border-color .15s;

      &--found {
        background: rgba(60,180,80,.08);
        border: 1px solid rgba(60,180,80,.25);
        color: rgba(140,230,160,.9);
        cursor: pointer;
        &:hover { background: rgba(60,180,80,.15); border-color: rgba(60,180,80,.5); }
      }

      &--deselected {
        background: rgba(255,255,255,.02);
        border: 1px solid rgba(255,255,255,.08);
        color: rgba(160,150,130,.55);
        cursor: pointer;
        &:hover { background: rgba(60,180,80,.06); border-color: rgba(60,180,80,.2); }
      }

      &--missing {
        background: rgba(255,255,255,.015);
        border: 1px solid rgba(255,255,255,.05);
        color: rgba(120,110,100,.4);
        cursor: default;
      }
    }

    /* Custom checkbox pill */
    .id-checkbox {
      flex-shrink: 0;
      width: 16px; height: 16px;
      border-radius: 4px;
      border: 1.5px solid rgba(60,180,80,.45);
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s, border-color .15s;

      mat-icon { font-size: 12px !important; width: 12px !important; height: 12px !important; color: #80e8a0; }

      &--checked {
        background: rgba(60,180,80,.25);
        border-color: rgba(60,180,80,.8);
      }
    }

    .id-missing-icon {
      font-size: 15px !important; width: 15px !important; height: 15px !important;
      color: rgba(120,110,100,.35); flex-shrink: 0;
    }

    .id-preview-empty { font-size: 10px; color: rgba(120,110,100,.4); margin-left: auto; }

    /* Selected count badge in footer */
    .id-selected-count {
      margin-right: auto;
      font-size: 11px;
      color: rgba(200,160,60,.55);
      letter-spacing: .04em;
      align-self: center;
    }

    .id-user { color: #e8c96a; font-style: normal; }

    /* ── Spinner ─────────────────────────────────────────────────── */
    .id-spinner {
      width: 44px; height: 44px; border-radius: 50%;
      border: 3px solid rgba(200,160,60,.15);
      border-top-color: rgba(200,160,60,.8);
      animation: id-spin .8s linear infinite;
    }
    @keyframes id-spin { to { transform: rotate(360deg); } }

    .id-loading-text {
      margin: 0; font-family: sans-serif;
      font-size: 13px; color: #e8c96a; letter-spacing: .1em; text-transform: uppercase;
    }
    .id-loading-sub { margin: 0; font-size: 12px; color: rgba(160,140,110,.55); }

    /* ── Success ─────────────────────────────────────────────────── */
    .id-success-icon { font-size: 44px; filter: drop-shadow(0 0 10px rgba(60,200,80,.3)); }
    .id-done-title {
      margin: 0; font-family: sans-serif;
      font-size: 14px; color: #e8c96a; letter-spacing: .1em; text-transform: uppercase;
    }
    .id-done-sub { margin: 0; font-size: 12px; color: rgba(200,185,155,.75); line-height: 1.5; }

    /* ── Buttons — use pt-filter-btn global style ──────────────────── */
    .id-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px;
      padding: 4px 12px; border-radius: 6px; font-family: sans-serif; font-size: 11px;
      letter-spacing: .1em; text-transform: uppercase; cursor: pointer;
      background: rgba(200,160,60,.08); border: 1px solid rgba(200,160,60,.2); color: #9a8a6a;
      transition: background .15s, border-color .15s, color .15s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; flex-shrink: 0; }
      &:hover:not(:disabled) { background: rgba(200,160,60,.15); color: #d4c9a0; border-color: rgba(200,160,60,.4); }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }
  `,
})
export class ImportDataDialogComponent {
  private readonly dialogRef   = inject(MatDialogRef<ImportDataDialogComponent>);
  private readonly csApi       = inject(CharacterSheetApiService);
  private readonly dmApi       = inject(DmPageApiService);
  private readonly authService = inject(AuthService);
  private readonly snackBar    = inject(MatSnackBar);

  // ── State ────────────────────────────────────────────────────────────────────
  readonly state           = signal<DialogState>('input');
  readonly errorMsg        = signal<string | null>(null);
  readonly currentUsername = signal<string>('');

  importUsername = '';

  readonly previewItems = signal<SelectableItem[]>([]);

  /** How many items were found in source account. */
  readonly foundCount = signal(0);

  /** How many found items the user currently has checked. */
  readonly selectedCount = signal(0);

  /** True when every found item is checked. */
  readonly allSelected = signal(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private buildItems(data: FetchedData): SelectableItem[] {
    const make = (key: DataKey, label: string): SelectableItem => ({
      key,
      label,
      found:    !!data[key],
      selected: !!data[key], // default: checked when found
    });
    return [
      make('characterSheet',  'Karta postavy'),
      make('groupSheet',      'Karta skupiny'),
      make('notesPage',       'Poznámky hráče'),
      make('itemVault',       'Předměty'),
      make('quests',          'Questy hráče'),
      make('dmQuests',        'DM Questy'),
      make('dmNotes',         'DM Poznámky'),
      make('dmStoryTimeline', 'Příběhové události'),
    ];
  }

  private refreshCounters(items: SelectableItem[]): void {
    const found    = items.filter(i => i.found).length;
    const selected = items.filter(i => i.found && i.selected).length;
    this.foundCount.set(found);
    this.selectedCount.set(selected);
    this.allSelected.set(found > 0 && selected === found);
  }

  toggleItem(key: DataKey): void {
    const updated = this.previewItems().map(i =>
      i.key === key ? { ...i, selected: !i.selected } : i,
    );
    this.previewItems.set(updated);
    this.refreshCounters(updated);
  }

  toggleAll(): void {
    const shouldSelectAll = !this.allSelected();
    const updated = this.previewItems().map(i =>
      i.found ? { ...i, selected: shouldSelectAll } : i,
    );
    this.previewItems.set(updated);
    this.refreshCounters(updated);
  }

  // ── Step 1 — fetch preview ────────────────────────────────────────────────────
  onPreview(): void {
    const src = this.importUsername.trim();
    if (!src) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.errorMsg.set('Musíš být přihlášen!');
      return;
    }

    this.currentUsername.set(currentUser.username);
    this.errorMsg.set(null);
    this.state.set('loading');

    forkJoin({
      characterSheet:  this.csApi.getCharacterSheetByUsername(src)                  .pipe(catchError(() => of(undefined))),
      groupSheet:      this.csApi.getGroupSheetByUsername(`${src}${GROUP_SUFFIX}`)  .pipe(catchError(() => of(undefined))),
      notesPage:       this.csApi.getNotesPageByUsername(`${src}${NOTES_SUFFIX}`)   .pipe(catchError(() => of(undefined))),
      itemVault:       this.csApi.getItemVaultByUsername(src)                        .pipe(catchError(() => of(undefined))),
      quests:          this.csApi.getQuestsByUsername(src)                           .pipe(catchError(() => of(undefined))),
      dmQuests:        this.dmApi.getDmQuestsByUsername(src)                         .pipe(catchError(() => of(undefined))),
      dmNotes:         this.dmApi.getDmNotesByUsername(src)                          .pipe(catchError(() => of(undefined))),
      dmStoryTimeline: this.dmApi.getDmStoryTimeline(src)                            .pipe(catchError(() => of(undefined))),
    }).subscribe({
      next: data => {
        this._fetchedData = data;
        const items = this.buildItems(data);
        this.previewItems.set(items);
        this.refreshCounters(items);
        this.state.set('confirm');
      },
      error: err => {
        this.errorMsg.set(`Načtení dat selhalo: ${err?.message ?? err}`);
        this.state.set('error');
      },
    });
  }

  // ── Step 2 — confirmed, import only selected items ────────────────────────────
  onImport(): void {
    const data = this._fetchedData;
    if (!data) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const tgt = currentUser.username;
    this.state.set('importing');

    // Build a Set of selected keys for O(1) lookup
    const selected = new Set(
      this.previewItems()
        .filter(i => i.found && i.selected)
        .map(i => i.key),
    );

    const writes: Observable<void>[] = [];

    if (selected.has('characterSheet') && data.characterSheet)
      writes.push(this.csApi.updateCharacterSheet({ ...data.characterSheet, username: tgt }));
    if (selected.has('groupSheet') && data.groupSheet)
      writes.push(this.csApi.updateGroupSheet({ ...data.groupSheet, username: `${tgt}${GROUP_SUFFIX}` }));
    if (selected.has('notesPage') && data.notesPage)
      writes.push(this.csApi.updateNotesPage({ ...data.notesPage, username: `${tgt}${NOTES_SUFFIX}` }));
    if (selected.has('itemVault') && data.itemVault)
      writes.push(this.csApi.saveItemVault({ ...data.itemVault, username: tgt }));
    if (selected.has('quests') && data.quests)
      writes.push(this.csApi.saveQuests({ ...data.quests, username: tgt }));
    if (selected.has('dmQuests') && data.dmQuests)
      writes.push(this.dmApi.saveDmQuests({ ...data.dmQuests, username: tgt }));
    if (selected.has('dmNotes') && data.dmNotes)
      writes.push(this.dmApi.saveDmNotes({ ...data.dmNotes, username: tgt }));
    if (selected.has('dmStoryTimeline') && data.dmStoryTimeline)
      writes.push(this.dmApi.saveDmStoryTimeline({ ...data.dmStoryTimeline, username: tgt }));

    (writes.length > 0 ? forkJoin(writes) : of([] as void[])).subscribe({
      next: () => { this.state.set('done'); },
      error: err => {
        this.errorMsg.set(`Uložení dat selhalo: ${err?.message ?? err}`);
        this.state.set('error');
      },
    });
  }

  onClose(): void {
    this.snackBar.open(
      `📦 Data z „${this.importUsername}" byla importována pod „${this.currentUsername()}"!`,
      '✕',
      { verticalPosition: 'top', duration: 4000, panelClass: ['snackbar--success'] },
    );
    this.dialogRef.close(true);
  }

  resetToInput(): void {
    this._fetchedData = null;
    this.previewItems.set([]);
    this.foundCount.set(0);
    this.selectedCount.set(0);
    this.allSelected.set(false);
    this.errorMsg.set(null);
    this.state.set('input');
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // ── Private cache ─────────────────────────────────────────────────────────────
  private _fetchedData: FetchedData | null = null;
}

// ── Fetched data shape ────────────────────────────────────────────────────────
interface FetchedData {
  characterSheet:  CharacterSheetApiModel  | undefined;
  groupSheet:      GroupSheetApiModel      | undefined;
  notesPage:       NotesPageApiModel       | undefined;
  itemVault:       ItemVaultApiModel       | undefined;
  quests:          QuestsApiModel          | undefined;
  dmQuests:        DmQuestsApiModel        | undefined;
  dmNotes:         DmNotesApiModel         | undefined;
  dmStoryTimeline: DmStoryTimelineApiModel | undefined;
}
