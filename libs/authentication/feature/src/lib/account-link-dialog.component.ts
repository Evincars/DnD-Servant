import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AuthCredential } from '@angular/fire/auth';
import { AccountLinkResult, AuthService } from '@dn-d-servant/util';
import { DataMigrationService, MigrationSummary } from './data-migration.service';

export interface AccountLinkDialogData {
  email: string;
  googleCredential: AuthCredential;
}

type DialogState = 'form' | 'migrating' | 'done' | 'error';

@Component({
  selector: 'app-account-link-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon],
  template: `
    <div class="al-panel">
      <!-- Header -->
      <div class="al-header">
        <mat-icon class="al-header-icon">link</mat-icon>
        <span class="al-title">Propojení Google účtu</span>
        @if (state() !== 'migrating') {
          <button type="button" class="al-close-btn" (click)="close()" aria-label="Zavřít">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      <!-- Form state -->
      @if (state() === 'form') {
        <div class="al-body">
          <div class="al-info-box">
            <mat-icon class="al-info-icon">info</mat-icon>
            <div>
              <p class="al-info-text">
                Byl nalezen existující účet pro&nbsp;
                <strong class="al-email">{{ data.email }}</strong>.
              </p>
              <p class="al-info-sub">
                Zadej heslo k&nbsp;původnímu účtu. Google přihlášení bude propojeno
                a&nbsp;všechna tvá data budou zkopírována pod nové jméno.
              </p>
            </div>
          </div>

          @if (errorMsg()) {
            <div class="al-error">
              <mat-icon>warning</mat-icon>
              {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="al-form">
            <div class="al-field">
              <label class="al-label">Heslo k&nbsp;původnímu účtu</label>
              <input
                class="al-input"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>
            <button class="al-btn" type="submit" [disabled]="!form.valid">
              <mat-icon>merge</mat-icon>
              Propojit a&nbsp;migrovat data
            </button>
          </form>
        </div>
      }

      <!-- Migrating state -->
      @if (state() === 'migrating') {
        <div class="al-body al-body--center">
          <div class="al-spinner" aria-label="Načítání..."></div>
          <p class="al-migrating-text">Probíhá migrace dat&hellip;</p>
          <p class="al-migrating-sub">Kopíruju tvá data pod nové jméno. Chviličku&nbsp;strpení.</p>
        </div>
      }

      <!-- Done state -->
      @if (state() === 'done') {
        <div class="al-body al-body--center">
          <div class="al-success-icon">✅</div>
          <p class="al-done-title">Hotovo!</p>
          @if (linkResult()) {
            <p class="al-done-sub">
              Účet&nbsp;<strong class="al-username">{{ linkResult()!.oldUsername }}</strong>
              byl propojen a&nbsp;data zkopírována pod
              <strong class="al-username">{{ linkResult()!.newUsername }}</strong>.
            </p>
          }
          @if (migrationSummary()) {
            <div class="al-summary">
              <span class="al-summary-item al-summary-item--ok">
                <mat-icon>check_circle</mat-icon>
                {{ migrationSummary()!.migrated }} zkopírováno
              </span>
              @if (migrationSummary()!.skipped > 0) {
                <span class="al-summary-item al-summary-item--skip">
                  <mat-icon>skip_next</mat-icon>
                  {{ migrationSummary()!.skipped }} přeskočeno
                </span>
              }
            </div>
          }
          <button class="al-btn al-btn--done" type="button" (click)="finish()">
            <mat-icon>arrow_forward</mat-icon>
            Pokračovat
          </button>
        </div>
      }

      <!-- Error state -->
      @if (state() === 'error') {
        <div class="al-body">
          <div class="al-error al-error--large">
            <mat-icon>error_outline</mat-icon>
            <div>
              <p class="al-error-title">Něco se pokazilo</p>
              <p class="al-error-detail">{{ errorMsg() }}</p>
            </div>
          </div>
          <button class="al-btn al-btn--secondary" type="button" (click)="resetToForm()">
            <mat-icon>refresh</mat-icon>
            Zkusit znovu
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    /* ── Panel ─────────────────────────────────────────────── */
    .al-panel {
      background: linear-gradient(180deg, rgba(8,5,18,.99) 0%, rgba(14,10,24,.99) 100%);
      border: 1px solid rgba(200,160,60,.4);
      border-radius: 10px;
      overflow: hidden;
      width: min(460px, 96vw);
      display: flex;
      flex-direction: column;
      position: relative;

      &::before {
        content: '';
        display: none;
      }
    }

    /* ── Header ────────────────────────────────────────────── */
    .al-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px 12px;
      border-bottom: 1px solid rgba(200,160,60,.18);
      background: rgba(200,160,60,.04);
      flex-shrink: 0;
    }

    .al-header-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(200,160,60,.85);
      flex-shrink: 0;
    }

    .al-title {
      flex: 1;
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: .08em;
      color: #e8c96a;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
    }

    .al-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      color: rgba(200,160,60,.45);
      transition: color .15s, background .15s;
      flex-shrink: 0;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover {
        background: rgba(200,160,60,.1);
        color: rgba(200,160,60,.9);
      }
    }

    /* ── Body ──────────────────────────────────────────────── */
    .al-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 24px 24px;

      &--center {
        align-items: center;
        text-align: center;
      }
    }

    /* ── Info box ──────────────────────────────────────────── */
    .al-info-box {
      display: flex;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(200,160,60,.06);
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 6px;
    }

    .al-info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(200,160,60,.7);
      flex-shrink: 0;
      margin-top: 1px;
    }

    .al-info-text {
      margin: 0 0 4px;
      font-size: 13px;
      color: rgba(220,195,140,.9);
      line-height: 1.5;
    }

    .al-info-sub {
      margin: 0;
      font-size: 12px;
      color: rgba(160,140,110,.75);
      line-height: 1.5;
    }

    .al-email {
      color: #e8c96a;
      font-style: normal;
    }

    /* ── Error ─────────────────────────────────────────────── */
    .al-error {
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

      &--large {
        align-items: flex-start;
        mat-icon { font-size: 20px; width: 20px; height: 20px; margin-top: 1px; }
      }
    }

    .al-error-title {
      margin: 0 0 3px;
      font-size: 13px;
      font-weight: 600;
      color: #e08080;
    }

    .al-error-detail {
      margin: 0;
      font-size: 11px;
      color: rgba(200,120,120,.7);
    }

    /* ── Form ──────────────────────────────────────────────── */
    .al-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .al-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .al-label {
      font-size: 11px;
      font-weight: 600;
      color: #c8a03c;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .al-input {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 6px;
      padding: 10px 14px;
      color: #e0d4c0;
      font-size: 14px;
      outline: none;
      transition: border-color .18s, box-shadow .18s;
      font-family: sans-serif;
      width: 100%;
      box-sizing: border-box;

      &::placeholder { color: #4a4050; }

      &:focus {
        border-color: rgba(200,160,60,.6);
        box-shadow: 0 0 0 3px rgba(200,160,60,.1);
      }
    }

    /* ── Button ────────────────────────────────────────────── */
    .al-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
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
      width: 100%;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(200,160,60,.32) 0%, rgba(200,140,40,.44) 100%);
        border-color: rgba(200,160,60,.75);
        box-shadow: 0 0 18px rgba(200,160,60,.25);
        transform: translateY(-1px);
      }

      &:disabled { opacity: .4; cursor: not-allowed; }

      &--done {
        background: linear-gradient(135deg, rgba(60,160,80,.2) 0%, rgba(60,140,60,.3) 100%);
        border-color: rgba(60,180,80,.45);
        color: #80e8a0;
        text-shadow: none;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(60,160,80,.32) 0%, rgba(60,140,60,.44) 100%);
          border-color: rgba(60,180,80,.75);
          box-shadow: 0 0 18px rgba(60,180,80,.2);
        }
      }

      &--secondary {
        background: rgba(255,255,255,.03);
        border-color: rgba(200,160,60,.2);
        color: rgba(200,160,60,.6);
        text-shadow: none;
        font-size: 13px;

        &:hover:not(:disabled) {
          background: rgba(200,160,60,.1);
          border-color: rgba(200,160,60,.45);
          color: #e8c96a;
        }
      }
    }

    /* ── Spinner ───────────────────────────────────────────── */
    .al-spinner {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid rgba(200,160,60,.15);
      border-top-color: rgba(200,160,60,.8);
      animation: al-spin 0.8s linear infinite;
    }

    @keyframes al-spin {
      to { transform: rotate(360deg); }
    }

    .al-migrating-text {
      margin: 0;
      font-family: 'Mikadan', sans-serif;
      font-size: 16px;
      color: #e8c96a;
      letter-spacing: .06em;
    }

    .al-migrating-sub {
      margin: 0;
      font-size: 12px;
      color: rgba(160,140,110,.65);
    }

    /* ── Success ───────────────────────────────────────────── */
    .al-success-icon {
      font-size: 42px;
      filter: drop-shadow(0 0 12px rgba(60,200,80,.35));
    }

    .al-done-title {
      margin: 0;
      font-family: 'Mikadan', sans-serif;
      font-size: 18px;
      color: #e8c96a;
      letter-spacing: .06em;
    }

    .al-done-sub {
      margin: 0;
      font-size: 13px;
      color: rgba(200,185,155,.75);
      line-height: 1.5;
    }

    .al-username {
      color: #e8c96a;
    }

    .al-summary {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .al-summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;

      mat-icon { font-size: 14px; width: 14px; height: 14px; }

      &--ok {
        color: rgba(80,200,100,.9);
        background: rgba(60,200,80,.08);
        border: 1px solid rgba(60,200,80,.2);
      }

      &--skip {
        color: rgba(200,160,60,.7);
        background: rgba(200,160,60,.06);
        border: 1px solid rgba(200,160,60,.18);
      }
    }
  `,
})
export class AccountLinkDialogComponent {
  readonly data = inject<AccountLinkDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AccountLinkDialogComponent>);
  private readonly authService = inject(AuthService);
  private readonly migrationService = inject(DataMigrationService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly state = signal<DialogState>('form');
  readonly errorMsg = signal<string | null>(null);
  readonly linkResult = signal<AccountLinkResult | null>(null);
  readonly migrationSummary = signal<MigrationSummary | null>(null);

  readonly form = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (!this.form.valid) return;

    const password = this.form.getRawValue().password;
    this.state.set('migrating');
    this.errorMsg.set(null);

    this.authService
      .linkGoogleAccount(this.data.email, password, this.data.googleCredential)
      .pipe(
        switchMap(result => {
          this.linkResult.set(result);
          // If usernames are the same there's nothing to migrate — emit a zero summary.
          if (result.oldUsername === result.newUsername) {
            return [{ total: 0, migrated: 0, skipped: 0 } as MigrationSummary];
          }
          return this.migrationService.migrateAllData(result.oldUsername, result.newUsername);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: summary => {
          this.migrationSummary.set(summary);
          this.state.set('done');
        },
        error: err => {
          const msg = err?.code ?? err?.message ?? 'Neznámá chyba';
          this.errorMsg.set(msg);
          this.state.set('error');
        },
      });
  }

  resetToForm(): void {
    this.state.set('form');
    this.errorMsg.set(null);
    this.form.reset();
  }

  finish(): void {
    const result = this.linkResult();
    this.dialogRef.close();
    const username = result?.newUsername ?? result?.oldUsername ?? '';
    this.snackBar.open(
      `⚔️ Účet propojen! Vítej zpět, ${username}. Data migrována.`,
      '✕',
      { verticalPosition: 'top', duration: 4500, panelClass: ['snackbar--success'] },
    );
    this.router.navigateByUrl('/');
  }

  close(): void {
    this.dialogRef.close();
  }
}


