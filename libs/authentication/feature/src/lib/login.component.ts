import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CharacterSheetApiService } from '@dn-d-servant/character-sheet-data-access';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'login',
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <!-- top strip -->
        <div class="auth-strip">
          <span class="auth-gem">◆</span>
          <span class="auth-line"></span>
          <span class="auth-gem">◆</span>
        </div>

        <!-- crest -->
        <div class="auth-crest">🛡</div>
        <h1 class="auth-title">Přihlášení</h1>
        <p class="auth-subtitle">Vítej zpět, hrdino</p>

        <div class="auth-divider"><span>⚔</span></div>

        @if (errorMessage()) {
        <div class="auth-error">
          <mat-icon>warning</mat-icon>
          {{ errorMessage() }}
        </div>
        }

        <div class="auth-warning">
          <mat-icon>info</mat-icon>
          <span>Přihlášení neověřeným emailem je zastaralý (pro náš server už nebezpečný) způsob. Doporučujeme použít Google účet. Všechna data pod starým username lze importovat přes tlačítko na Kartě Postavy nahoře pro Google účet.</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Email</label>
            <input class="auth-input" type="email" formControlName="email" placeholder="hrdina@jeskyně.cz" />
          </div>
          <div class="auth-field">
            <label class="auth-label">Heslo</label>
            <input class="auth-input" type="password" formControlName="password" placeholder="••••••••" />
          </div>
          <button class="auth-btn" type="submit" [disabled]="!form.valid">
            <mat-icon>login</mat-icon>
            Přihlásit se
          </button>
        </form>

        <div class="auth-divider"><span>NEBO</span></div>

        <div class="auth-social">
          <button class="auth-btn-google" type="button" (click)="onGoogleLogin()">
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Přihlásit se přes Google
          </button>
        </div>

        <div class="auth-divider"><span>🐉</span></div>

        <div class="auth-import-section">
          <div class="auth-import-title">
            <mat-icon>cloud_download</mat-icon>
            Importovat data z jiného účtu
          </div>
          <p class="auth-import-text">
            Pokud chceš přenést data (character-sheet, group-sheet, questy, předměty) z jiného uživatele, zadej jeho jméno:
          </p>
          <div class="auth-import-form">
            <input
              class="auth-input"
              type="text"
              [(ngModel)]="importUsername"
              placeholder="např. Evincars"
            />
            <button
              class="auth-btn-import"
              type="button"
              (click)="onImportData()"
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

        <!-- bottom strip -->
        <div class="auth-strip auth-strip--bottom">
          <span class="auth-gem">◆</span>
          <span class="auth-line"></span>
          <span class="auth-gem">◆</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .auth-page {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      box-sizing: border-box;
      overflow: hidden;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background:
        linear-gradient(180deg, rgba(10,8,6,.99) 0%, rgba(18,14,10,.99) 60%, rgba(10,8,6,.99) 100%),
        url('https://www.transparenttextures.com/patterns/dark-leather.png');
      background-color: #0c0a07;
      border: 1px solid rgba(200,160,60,.35);
      border-radius: 12px;
      padding: 0 0 8px;
      box-shadow:
        0 0 0 1px rgba(200,160,60,.08),
        0 12px 60px rgba(0,0,0,.9),
        inset 0 1px 0 rgba(255,220,100,.06);
      overflow: hidden;
    }

    .auth-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px 6px;
    }
    .auth-strip--bottom { padding: 6px 16px 10px; }

    .auth-gem {
      color: #c8a03c;
      font-size: 9px;
      flex-shrink: 0;
      text-shadow: 0 0 6px rgba(200,160,60,.5);
    }

    .auth-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(200,160,60,.15), rgba(200,160,60,.6), rgba(200,160,60,.15));
    }

    .auth-crest {
      text-align: center;
      font-size: 40px;
      margin-top: 4px;
      filter: drop-shadow(0 0 12px rgba(200,160,60,.4));
    }

    .auth-title {
      font-family: 'Mikadan', sans-serif;
      text-align: center;
      font-size: 26px;
      font-weight: 700;
      color: #e8c96a;
      letter-spacing: .08em;
      text-shadow: 0 0 16px rgba(200,160,60,.45);
      margin: 6px 0 2px;
    }

    .auth-subtitle {
      text-align: center;
      font-size: 11px;
      color: #6b6070;
      letter-spacing: .1em;
      text-transform: uppercase;
      margin: 0 0 4px;
    }

    .auth-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 24px;
      color: #c8a03c;
      font-size: 14px;
      margin: 4px 0;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200,160,60,.4), transparent);
      }
    }

    .auth-error {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 4px 24px 8px;
      padding: 8px 12px;
      background: rgba(200,60,60,.12);
      border: 1px solid rgba(200,60,60,.3);
      border-radius: 6px;
      color: #e07070;
      font-size: 12px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .auth-warning {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin: 4px 24px 8px;
      padding: 8px 12px;
      background: rgba(200,140,60,.12);
      border: 1px solid rgba(200,140,60,.3);
      border-radius: 6px;
      color: #d4a055;
      font-size: 11px;
      line-height: 1.5;

      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 24px 12px;
    }

    .auth-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .auth-label {
      font-size: 11px;
      font-weight: 600;
      color: #c8a03c;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .auth-input {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 6px;
      padding: 10px 14px;
      color: #e0d4c0;
      font-size: 14px;
      outline: none;
      transition: border-color .18s, box-shadow .18s;
      font-family: sans-serif;

      &::placeholder { color: #4a4050; }

      &:focus {
        border-color: rgba(200,160,60,.6);
        box-shadow: 0 0 0 3px rgba(200,160,60,.1);
      }
    }

    .auth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 4px;
      padding: 11px 20px;
      background: linear-gradient(135deg, rgba(200,160,60,.2) 0%, rgba(200,140,40,.3) 100%);
      border: 1px solid rgba(200,160,60,.45);
      border-radius: 6px;
      color: #e8c96a;
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: .06em;
      cursor: pointer;
      transition: background .18s, border-color .18s, box-shadow .18s, transform .12s;
      text-shadow: 0 0 10px rgba(200,160,60,.4);

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(200,160,60,.32) 0%, rgba(200,140,40,.44) 100%);
        border-color: rgba(200,160,60,.75);
        box-shadow: 0 0 18px rgba(200,160,60,.25);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: .4;
        cursor: not-allowed;
      }
    }

    .auth-social {
      padding: 0 24px 8px;
    }

    .auth-btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 11px 20px;
      background: rgba(255,255,255,.96);
      border: 1px solid rgba(200,160,60,.25);
      border-radius: 6px;
      color: #3c4043;
      font-family: 'Roboto', 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background .18s, border-color .18s, box-shadow .18s, transform .12s;
      box-shadow: 0 1px 3px rgba(0,0,0,.12);

      &:hover {
        background: rgba(255,255,255,1);
        border-color: rgba(200,160,60,.4);
        box-shadow: 0 2px 6px rgba(0,0,0,.2), 0 0 12px rgba(200,160,60,.15);
        transform: translateY(-1px);
      }

      &:active {
        background: rgba(240,240,240,.96);
        transform: translateY(0);
      }
    }

    .google-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .auth-import-section {
      padding: 0 24px 12px;
      margin-top: 4px;
    }

    .auth-import-title {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #c8a03c;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      margin-bottom: 8px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .auth-import-text {
      font-size: 11px;
      color: #8a7a80;
      line-height: 1.5;
      margin: 0 0 10px;
    }

    .auth-import-form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .auth-btn-import {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      background: linear-gradient(135deg, rgba(100,160,200,.2) 0%, rgba(80,140,180,.3) 100%);
      border: 1px solid rgba(100,160,200,.45);
      border-radius: 6px;
      color: #7ab8e0;
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: .06em;
      cursor: pointer;
      transition: background .18s, border-color .18s, box-shadow .18s, transform .12s;
      text-shadow: 0 0 10px rgba(100,160,200,.4);
      white-space: nowrap;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(100,160,200,.32) 0%, rgba(80,140,180,.44) 100%);
        border-color: rgba(100,160,200,.75);
        box-shadow: 0 0 18px rgba(100,160,200,.25);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: .4;
        cursor: not-allowed;
      }
    }

    .auth-footer {
      text-align: center;
      font-size: 12px;
      color: #6b6070;
      margin: 4px 0 8px;
    }

    .auth-link {
      color: #c8a03c;
      text-decoration: none;
      transition: color .15s;

      &:hover { color: #e8c96a; text-decoration: underline; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, MatIcon, RouterLink],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly characterSheetApiService = inject(CharacterSheetApiService);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage = signal<string | null>(null);
  importUsername = '';
  importLoading = signal(false);

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.authService
      .login(rawForm.email, rawForm.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('⚔️ Přihlášení úspěšné! Vítej zpět, hrdino.', '✕', {
            verticalPosition: 'top',
            duration: 3500,
            panelClass: ['snackbar--success'],
          });
          this.router.navigateByUrl('/');
        },
        error: err => {
          this.errorMessage.set(err.code);
        },
      });
  }

  onGoogleLogin(): void {
    this.authService
      .loginWithGoogle()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('⚔️ Přihlášení přes Google úspěšné! Vítej zpět, hrdino.', '✕', {
            verticalPosition: 'top',
            duration: 3500,
            panelClass: ['snackbar--success'],
          });
          this.router.navigateByUrl('/');
        },
        error: err => {
          this.errorMessage.set(err.code || 'Přihlášení přes Google selhalo');
        },
      });
  }

  onImportData(): void {
    if (!this.importUsername.trim()) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.snackBar.open('⚠️ Musíš být přihlášen pro import dat!', '✕', {
        verticalPosition: 'top',
        duration: 3000,
      });
      return;
    }

    this.importLoading.set(true);
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
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.importLoading.set(false);
          this.importUsername = '';
          this.snackBar.open(`📦 Data z účtu "${sourceUsername}" byla úspěšně importována!`, '✕', {
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['snackbar--success'],
          });
        },
        error: err => {
          this.importLoading.set(false);
          this.snackBar.open(`❌ Import dat selhal: ${err.message}`, '✕', {
            verticalPosition: 'top',
            duration: 4000,
          });
        },
      });
  }
}
