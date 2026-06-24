import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, GoogleAccountConflictError } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AccountLinkDialogComponent, AccountLinkDialogData } from './account-link-dialog.component';

@Component({
  selector: 'login',
  template: `
    <div class="auth-page">
      <div class="auth-card">
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
          <span>
            <b>Noví úživatelé se musí registrovat přes Google účet.</b>
            <br />
            <b>Staré přihlášení přes mail/heslo funguje.</b>
            <br />
            <br />

            Přihlášení neověřeným emailem je zastaralý (pro náš server už nebezpečný) způsob.
            Když přihlášením přes google "přepíšete" email, kterým jste se přihlašovali starou metodou a neuvidíte žádná data,
            můžete importovat data ze starého účtu když zadáte starý username (tlačítko je na Kartě Postavy vedle "Uložit")
          </span>
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
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Přihlásit se přes Google
          </button>
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
        linear-gradient(180deg, rgba(10, 8, 6, 0.99) 0%, rgba(18, 14, 10, 0.99) 60%, rgba(10, 8, 6, 0.99) 100%),
        url('https://www.transparenttextures.com/patterns/dark-leather.png');
      background-color: #0c0a07;
      border: 1px solid rgba(200, 160, 60, 0.35);
      border-radius: 12px;
      padding: 0 0 8px;
      box-shadow:
        0 0 0 1px rgba(200, 160, 60, 0.08),
        0 12px 60px rgba(0, 0, 0, 0.9),
        inset 0 1px 0 rgba(255, 220, 100, 0.06);
      overflow: hidden;
    }

    .auth-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px 6px;
    }

    .auth-strip--bottom {
      padding: 6px 16px 10px;
    }

    .auth-gem {
      color: #c8a03c;
      font-size: 9px;
      flex-shrink: 0;
      text-shadow: 0 0 6px rgba(200, 160, 60, 0.5);
    }

    .auth-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(200, 160, 60, 0.15), rgba(200, 160, 60, 0.6), rgba(200, 160, 60, 0.15));
    }

    .auth-crest {
      text-align: center;
      font-size: 40px;
      margin-top: 4px;
      filter: drop-shadow(0 0 12px rgba(200, 160, 60, 0.4));
    }

    .auth-title {
      font-family: 'Mikadan', sans-serif;
      text-align: center;
      font-size: 26px;
      font-weight: 700;
      color: #e8c96a;
      letter-spacing: 0.08em;
      text-shadow: 0 0 16px rgba(200, 160, 60, 0.45);
      margin: 6px 0 2px;
    }

    .auth-subtitle {
      text-align: center;
      font-size: 11px;
      color: #6b6070;
      letter-spacing: 0.1em;
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

      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200, 160, 60, 0.4), transparent);
      }
    }

    .auth-error {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 4px 24px 8px;
      padding: 8px 12px;
      background: rgba(200, 60, 60, 0.12);
      border: 1px solid rgba(200, 60, 60, 0.3);
      border-radius: 6px;
      color: #e07070;
      font-size: 12px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .auth-warning {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin: 4px 24px 8px;
      padding: 8px 12px;
      background: rgba(200, 140, 60, 0.12);
      border: 1px solid rgba(200, 140, 60, 0.3);
      border-radius: 6px;
      color: #d4a055;
      font-size: 11px;
      line-height: 1.5;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-top: 1px;
      }
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
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .auth-input {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(200, 160, 60, 0.2);
      border-radius: 6px;
      padding: 10px 14px;
      color: #e0d4c0;
      font-size: 14px;
      outline: none;
      transition:
        border-color 0.18s,
        box-shadow 0.18s;
      font-family: sans-serif;

      &::placeholder {
        color: #4a4050;
      }

      &:focus {
        border-color: rgba(200, 160, 60, 0.6);
        box-shadow: 0 0 0 3px rgba(200, 160, 60, 0.1);
      }
    }

    .auth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 4px;
      padding: 11px 20px;
      background: linear-gradient(135deg, rgba(200, 160, 60, 0.2) 0%, rgba(200, 140, 40, 0.3) 100%);
      border: 1px solid rgba(200, 160, 60, 0.45);
      border-radius: 6px;
      color: #e8c96a;
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: 0.06em;
      cursor: pointer;
      transition:
        background 0.18s,
        border-color 0.18s,
        box-shadow 0.18s,
        transform 0.12s;
      text-shadow: 0 0 10px rgba(200, 160, 60, 0.4);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(200, 160, 60, 0.32) 0%, rgba(200, 140, 40, 0.44) 100%);
        border-color: rgba(200, 160, 60, 0.75);
        box-shadow: 0 0 18px rgba(200, 160, 60, 0.25);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.4;
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
      background: rgb(43 42 42 / 0.96);
      border: 1px solid rgba(200, 160, 60, 0.25);
      border-radius: 6px;
      color: #cfdde4;
      font-family: 'Roboto', 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition:
        background 0.18s,
        border-color 0.18s,
        box-shadow 0.18s,
        transform 0.12s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

      &:hover {
        background: rgb(43 42 42 / 0.96);
        border-color: rgba(200, 160, 60, 0.4);
        box-shadow:
          0 2px 6px rgba(0, 0, 0, 0.2),
          0 0 12px rgba(200, 160, 60, 0.15);
        transform: translateY(-1px);
      }

      &:active {
        background: rgba(240, 240, 240, 0.96);
        transform: translateY(0);
      }
    }

    .google-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .auth-link {
      color: #c8a03c;
      text-decoration: none;
      transition: color 0.15s;

      &:hover {
        color: #e8c96a;
        text-decoration: underline;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIcon],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage = signal<string | null>(null);

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
        error: (err: unknown) => {
          if (err instanceof GoogleAccountConflictError) {
            this.openAccountLinkDialog(err);
            return;
          }
          const code = (err as { code?: string })?.code;
          this.errorMessage.set(code ?? 'Přihlášení přes Google selhalo');
        },
      });
  }

  private openAccountLinkDialog(conflict: GoogleAccountConflictError): void {
    this.dialog.open<AccountLinkDialogComponent, AccountLinkDialogData>(AccountLinkDialogComponent, {
      panelClass: 'sd-dialog-panel',
      backdropClass: 'sd-dialog-backdrop',
      hasBackdrop: true,
      disableClose: true,
      data: { email: conflict.email, googleCredential: conflict.googleCredential },
    });
  }
}
