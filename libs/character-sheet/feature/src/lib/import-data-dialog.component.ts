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

interface PreviewData {
  characterSheet: boolean;
  groupSheet: boolean;
  notesPage: boolean;
  itemVault: boolean;
  quests: boolean;
  dmQuests: boolean;
  dmNotes: boolean;
  dmStoryTimeline: boolean;
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

          <!-- Found data list -->
          <p class="id-preview-heading">Nalezená data z „{{ importUsername }}":</p>
          <ul class="id-preview-list">
            @for (item of previewItems(); track item.label) {
              <li class="id-preview-item" [class.id-preview-item--found]="item.found" [class.id-preview-item--missing]="!item.found">
                <mat-icon>{{ item.found ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
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
          <button class="id-btn id-btn--cancel" type="button" (click)="resetToInput()">
            <mat-icon>arrow_back</mat-icon> Zpět
          </button>
          <button
            class="id-btn id-btn--danger"
            type="button"
            (click)="onImport()"
            [disabled]="foundCount() === 0"
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
          <p class="id-done-title">Import dokončen!</p>
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
        content: '◆';
        position: absolute;
        top: -7px; left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        color: rgba(200,160,60,.6);
        background: rgba(8,5,18,1);
        padding: 0 6px;
        pointer-events: none;
        z-index: 2;
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
      font-family: 'Mikadan', sans-serif;
      font-size: 14px; color: #e8a060; letter-spacing: .04em;
    }

    .id-warn-text {
      margin: 0; font-size: 12px; color: rgba(200,160,120,.75); line-height: 1.5;
    }

    /* ── Preview list ────────────────────────────────────────────── */
    .id-preview-heading {
      margin: 0;
      font-size: 12px; font-weight: 600;
      color: rgba(200,160,60,.7); letter-spacing: .06em; text-transform: uppercase;
    }

    .id-preview-list {
      list-style: none; margin: 0; padding: 0;
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
    }

    .id-preview-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 5px;
      font-size: 12px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }

      &--found {
        background: rgba(60,180,80,.08);
        border: 1px solid rgba(60,180,80,.2);
        color: rgba(120,220,140,.9);
        mat-icon { color: rgba(80,200,100,.9); }
      }

      &--missing {
        background: rgba(255,255,255,.02);
        border: 1px solid rgba(255,255,255,.06);
        color: rgba(120,110,100,.5);
      }
    }

    .id-preview-empty { font-size: 10px; color: rgba(120,110,100,.4); }

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
      margin: 0; font-family: 'Mikadan', sans-serif;
      font-size: 15px; color: #e8c96a; letter-spacing: .06em;
    }
    .id-loading-sub { margin: 0; font-size: 12px; color: rgba(160,140,110,.55); }

    /* ── Success ─────────────────────────────────────────────────── */
    .id-success-icon { font-size: 44px; filter: drop-shadow(0 0 10px rgba(60,200,80,.3)); }
    .id-done-title {
      margin: 0; font-family: 'Mikadan', sans-serif;
      font-size: 18px; color: #e8c96a; letter-spacing: .06em;
    }
    .id-done-sub { margin: 0; font-size: 13px; color: rgba(200,185,155,.75); line-height: 1.5; }

    /* ── Buttons ─────────────────────────────────────────────────── */
    .id-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 9px 18px;
      border-radius: 6px;
      font-family: 'Mikadan', sans-serif; font-size: 14px; letter-spacing: .06em;
      cursor: pointer; transition: background .18s, border-color .18s, transform .12s;
      border: 1px solid;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:disabled { opacity: .4; cursor: not-allowed; }

      &--cancel {
        background: rgba(140,100,100,.12); border-color: rgba(140,100,100,.28); color: #b88888;
        &:hover:not(:disabled) { background: rgba(140,100,100,.22); transform: translateY(-1px); }
      }

      &--primary {
        background: linear-gradient(135deg, rgba(100,160,200,.2), rgba(80,140,180,.3));
        border-color: rgba(100,160,200,.45); color: #7ab8e0;
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(100,160,200,.32), rgba(80,140,180,.44));
          border-color: rgba(100,160,200,.75); box-shadow: 0 0 16px rgba(100,160,200,.2);
          transform: translateY(-1px);
        }
      }

      &--danger {
        background: linear-gradient(135deg, rgba(200,80,60,.18), rgba(180,60,40,.28));
        border-color: rgba(200,80,60,.45); color: #e89080;
        text-shadow: 0 0 8px rgba(200,80,60,.35);
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(200,80,60,.3), rgba(180,60,40,.4));
          border-color: rgba(200,80,60,.75); box-shadow: 0 0 16px rgba(200,80,60,.2);
          transform: translateY(-1px);
        }
      }
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
  readonly state         = signal<DialogState>('input');
  readonly errorMsg      = signal<string | null>(null);
  readonly currentUsername = signal<string>('');

  importUsername = '';

  private _preview: PreviewData | null = null;

  readonly previewItems = signal<Array<{ label: string; found: boolean }>>([]);
  readonly foundCount   = signal(0);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private buildPreviewItems(p: PreviewData) {
    return [
      { label: 'Karta postavy',     found: p.characterSheet   },
      { label: 'Karta skupiny',     found: p.groupSheet        },
      { label: 'Poznámky hráče',    found: p.notesPage         },
      { label: 'Předměty',          found: p.itemVault         },
      { label: 'Questy hráče',      found: p.quests            },
      { label: 'DM Questy',         found: p.dmQuests          },
      { label: 'DM Poznámky',       found: p.dmNotes           },
      { label: 'Příběhové události',found: p.dmStoryTimeline   },
    ];
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
      characterSheet:   this.csApi.getCharacterSheetByUsername(src)            .pipe(catchError(() => of(undefined))),
      groupSheet:       this.csApi.getGroupSheetByUsername(`${src}${GROUP_SUFFIX}`) .pipe(catchError(() => of(undefined))),
      notesPage:        this.csApi.getNotesPageByUsername(`${src}${NOTES_SUFFIX}`)  .pipe(catchError(() => of(undefined))),
      itemVault:        this.csApi.getItemVaultByUsername(src)                  .pipe(catchError(() => of(undefined))),
      quests:           this.csApi.getQuestsByUsername(src)                     .pipe(catchError(() => of(undefined))),
      dmQuests:         this.dmApi.getDmQuestsByUsername(src)                   .pipe(catchError(() => of(undefined))),
      dmNotes:          this.dmApi.getDmNotesByUsername(src)                    .pipe(catchError(() => of(undefined))),
      dmStoryTimeline:  this.dmApi.getDmStoryTimeline(src)                      .pipe(catchError(() => of(undefined))),
    }).subscribe({
      next: data => {
        this._preview = {
          characterSheet:  !!data.characterSheet,
          groupSheet:      !!data.groupSheet,
          notesPage:       !!data.notesPage,
          itemVault:       !!data.itemVault,
          quests:          !!data.quests,
          dmQuests:        !!data.dmQuests,
          dmNotes:         !!data.dmNotes,
          dmStoryTimeline: !!data.dmStoryTimeline,
        };
        // Store fetched data for the actual import step
        this._fetchedData = data;

        const items = this.buildPreviewItems(this._preview);
        this.previewItems.set(items);
        this.foundCount.set(items.filter(i => i.found).length);
        this.state.set('confirm');
      },
      error: err => {
        this.errorMsg.set(`Načtení dat selhalo: ${err?.message ?? err}`);
        this.state.set('error');
      },
    });
  }

  // ── Step 2 — confirmed, do the actual import ─────────────────────────────────
  onImport(): void {
    const data = this._fetchedData;
    if (!data) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const tgt = currentUser.username;
    this.state.set('importing');

    const writes: Observable<void>[] = [];

    if (data.characterSheet)
      writes.push(this.csApi.updateCharacterSheet({ ...data.characterSheet, username: tgt }));
    if (data.groupSheet)
      writes.push(this.csApi.updateGroupSheet({ ...data.groupSheet, username: `${tgt}${GROUP_SUFFIX}` }));
    if (data.notesPage)
      writes.push(this.csApi.updateNotesPage({ ...data.notesPage, username: `${tgt}${NOTES_SUFFIX}` }));
    if (data.itemVault)
      writes.push(this.csApi.saveItemVault({ ...data.itemVault, username: tgt }));
    if (data.quests)
      writes.push(this.csApi.saveQuests({ ...data.quests, username: tgt }));
    if (data.dmQuests)
      writes.push(this.dmApi.saveDmQuests({ ...data.dmQuests, username: tgt }));
    if (data.dmNotes)
      writes.push(this.dmApi.saveDmNotes({ ...data.dmNotes, username: tgt }));
    if (data.dmStoryTimeline)
      writes.push(this.dmApi.saveDmStoryTimeline({ ...data.dmStoryTimeline, username: tgt }));

    (writes.length > 0 ? forkJoin(writes) : of([] as void[])).subscribe({
      next: () => {
        this.state.set('done');
      },
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
    this._preview     = null;
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
