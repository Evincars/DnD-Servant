import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CharacterSheetApiService } from '@dn-d-servant/character-sheet-data-access';
import { AuthService } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'import-data-dialog',
  template: `
    <div class="import-dialog">
      <div class="import-dialog-header">
        <mat-icon class="import-dialog-icon">cloud_download</mat-icon>
        <h2 class="import-dialog-title">Importovat data z jiného účtu</h2>
      </div>

      <p class="import-dialog-text">
        Zadej uživatelské jméno, ze kterého chceš přenést všechna data (character-sheet, group-sheet, questy, předměty):
      </p>

      <div class="import-dialog-form">
        <label class="import-dialog-label">Uživatelské jméno</label>
        <input
          class="import-dialog-input"
          type="text"
          [(ngModel)]="importUsername"
          placeholder="např. Evincars"
          (keydown.enter)="onImport()"
          [disabled]="importLoading()"
        />
      </div>

      @if (errorMessage()) {
        <div class="import-dialog-error">
          <mat-icon>warning</mat-icon>
          {{ errorMessage() }}
        </div>
      }

      <div class="import-dialog-actions">
        <button
          class="import-dialog-btn import-dialog-btn--cancel"
          type="button"
          (click)="onCancel()"
          [disabled]="importLoading()"
        >
          <mat-icon>close</mat-icon>
          Zrušit
        </button>
        <button
          class="import-dialog-btn import-dialog-btn--import"
          type="button"
          (click)="onImport()"
          [disabled]="!importUsername || importLoading()"
        >
          @if (importLoading()) {
            <mat-icon>hourglass_empty</mat-icon>
            Importuji...
          } @else {
            <mat-icon>download</mat-icon>
            Importovat
          }
        </button>
      </div>
    </div>
  `,
  styles: `
    .import-dialog {
      padding: 24px;
      background:
        linear-gradient(180deg, rgba(10,8,6,.99) 0%, rgba(18,14,10,.99) 60%, rgba(10,8,6,.99) 100%),
        url('https://www.transparenttextures.com/patterns/dark-leather.png');
      background-color: #0c0a07;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
    }

    .import-dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .import-dialog-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #7ab8e0;
      filter: drop-shadow(0 0 8px rgba(122,184,224,.4));
    }

    .import-dialog-title {
      font-family: 'Mikadan', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #e8c96a;
      letter-spacing: .06em;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
      margin: 0;
    }

    .import-dialog-text {
      font-size: 13px;
      color: #9a9090;
      line-height: 1.6;
      margin: 0 0 20px;
    }

    .import-dialog-form {
      margin-bottom: 20px;
    }

    .import-dialog-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #c8a03c;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .import-dialog-input {
      width: 100%;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 6px;
      padding: 10px 14px;
      color: #e0d4c0;
      font-size: 14px;
      outline: none;
      transition: border-color .18s, box-shadow .18s;
      font-family: sans-serif;
      box-sizing: border-box;

      &::placeholder { color: #4a4050; }

      &:focus {
        border-color: rgba(200,160,60,.6);
        box-shadow: 0 0 0 3px rgba(200,160,60,.1);
      }

      &:disabled {
        opacity: .5;
        cursor: not-allowed;
      }
    }

    .import-dialog-error {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 16px;
      padding: 8px 12px;
      background: rgba(200,60,60,.12);
      border: 1px solid rgba(200,60,60,.3);
      border-radius: 6px;
      color: #e07070;
      font-size: 12px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .import-dialog-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .import-dialog-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 6px;
      font-family: 'Mikadan', sans-serif;
      font-size: 14px;
      letter-spacing: .06em;
      cursor: pointer;
      transition: background .18s, border-color .18s, box-shadow .18s, transform .12s;
      border: 1px solid;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:disabled {
        opacity: .4;
        cursor: not-allowed;
      }
    }

    .import-dialog-btn--cancel {
      background: rgba(140,100,100,.15);
      border-color: rgba(140,100,100,.3);
      color: #b88888;

      &:hover:not(:disabled) {
        background: rgba(140,100,100,.25);
        border-color: rgba(140,100,100,.5);
        transform: translateY(-1px);
      }
    }

    .import-dialog-btn--import {
      background: linear-gradient(135deg, rgba(100,160,200,.2) 0%, rgba(80,140,180,.3) 100%);
      border-color: rgba(100,160,200,.45);
      color: #7ab8e0;
      text-shadow: 0 0 10px rgba(100,160,200,.4);

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(100,160,200,.32) 0%, rgba(80,140,180,.44) 100%);
        border-color: rgba(100,160,200,.75);
        box-shadow: 0 0 18px rgba(100,160,200,.25);
        transform: translateY(-1px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatIcon, FormsModule],
})
export class ImportDataDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ImportDataDialogComponent>);
  private readonly characterSheetApiService = inject(CharacterSheetApiService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  importUsername = '';
  importLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onCancel(): void {
    this.dialogRef.close();
  }

  onImport(): void {
    if (!this.importUsername.trim()) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.errorMessage.set('Musíš být přihlášen pro import dat!');
      return;
    }

    this.importLoading.set(true);
    this.errorMessage.set(null);
    const sourceUsername = this.importUsername.trim();
    const targetUsername = currentUser.username;

    // Fetch all data from source user
    forkJoin({
      characterSheet: this.characterSheetApiService.getCharacterSheetByUsername(sourceUsername).pipe(catchError(() => of(undefined))),
      groupSheet: this.characterSheetApiService.getGroupSheetByUsername(sourceUsername).pipe(catchError(() => of(undefined))),
      notesPage: this.characterSheetApiService.getNotesPageByUsername(sourceUsername).pipe(catchError(() => of(undefined))),
      itemVault: this.characterSheetApiService.getItemVaultByUsername(sourceUsername).pipe(catchError(() => of(undefined))),
      quests: this.characterSheetApiService.getQuestsByUsername(sourceUsername).pipe(catchError(() => of(undefined))),
    })
      .pipe(
        switchMap(data => {
          const imports = [];

          // Update username in all data and save to target user
          if (data.characterSheet) {
            const updated = { ...data.characterSheet, username: targetUsername };
            imports.push(this.characterSheetApiService.updateCharacterSheet(updated));
          }
          if (data.groupSheet) {
            const updated = { ...data.groupSheet, username: targetUsername };
            imports.push(this.characterSheetApiService.updateGroupSheet(updated));
          }
          if (data.notesPage) {
            const updated = { ...data.notesPage, username: targetUsername };
            imports.push(this.characterSheetApiService.updateNotesPage(updated));
          }
          if (data.itemVault) {
            const updated = { ...data.itemVault, username: targetUsername };
            imports.push(this.characterSheetApiService.saveItemVault(updated));
          }
          if (data.quests) {
            const updated = { ...data.quests, username: targetUsername };
            imports.push(this.characterSheetApiService.saveQuests(updated));
          }

          return imports.length > 0 ? forkJoin(imports) : of(null);
        })
      )
      .subscribe({
        next: () => {
          this.importLoading.set(false);
          this.snackBar.open(`📦 Data z účtu "${sourceUsername}" byla úspěšně importována!`, '✕', {
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['snackbar--success'],
          });
          this.dialogRef.close(true);
        },
        error: err => {
          this.importLoading.set(false);
          this.errorMessage.set(`Import dat selhal: ${err.message}`);
        },
      });
  }
}

