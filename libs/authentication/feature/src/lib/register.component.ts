import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'register',
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-strip">
          <span class="auth-gem">◆</span>
          <span class="auth-line"></span>
          <span class="auth-gem">◆</span>
        </div>

        <div class="auth-crest">📜</div>
        <h1 class="auth-title">Registrace</h1>
        <p class="auth-subtitle">Zapiš své jméno do kroniky</p>

        <div class="auth-divider"><span>⚔</span></div>

        <div class="auth-info">
          <div class="auth-info__title">
            <mat-icon>info</mat-icon>
            Poznámka k registraci
          </div>
          <p>
            Email se neověřuje — může být falešný. Slouží pouze k ukládání dat pod tvým účtem. Při zapomenutí hesla bez reálného
            mailu nelze účet obnovit.
          </p>
          <p class="auth-info__example">
            Např:
            <code>mujtest&#64;falesny.cz</code>
            /
            <code>test123</code>
          </p>
        </div>

        @if (errorMessage()) {
        <div class="auth-error">
          <mat-icon>warning</mat-icon>
          {{ errorMessage() }}
        </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Uživatelské jméno</label>
            <input class="auth-input" type="text" formControlName="username" placeholder="Aragorn" />
          </div>
          <div class="auth-field">
            <label class="auth-label">Email</label>
            <input class="auth-input" type="email" formControlName="email" placeholder="hrdina@jeskyně.cz" />
          </div>
          <div class="auth-field">
            <label class="auth-label">Heslo</label>
            <input class="auth-input" type="password" formControlName="password" placeholder="••••••••" />
          </div>
          <button class="auth-btn" type="submit" [disabled]="!form.valid">
            <mat-icon>how_to_reg</mat-icon>
            Registrovat se
          </button>
        </form>

        <div class="auth-divider"><span>🐉</span></div>

        <p class="auth-footer">
          Už máš účet?
          <a class="auth-link" [routerLink]="'/login'">Přihlásit se</a>
        </p>

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
      max-width: 420px;
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

    .auth-info {
      margin: 0 24px 12px;
      padding: 10px 14px;
      background: rgba(200,160,60,.06);
      border: 1px solid rgba(200,160,60,.18);
      border-radius: 6px;
      font-size: 12px;
      color: #9a9090;
      line-height: 1.6;

      p { margin: 4px 0 0; }

      &__title {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #c8a03c;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .06em;
        text-transform: uppercase;
        margin-bottom: 4px;

        mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }

      &__example {
        margin-top: 6px !important;
        color: #7a7080;

        code {
          background: rgba(200,160,60,.1);
          border: 1px solid rgba(200,160,60,.2);
          border-radius: 3px;
          padding: 1px 5px;
          color: #c8a03c;
          font-size: 11px;
        }
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
  imports: [ReactiveFormsModule, MatIcon, RouterLink],
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.authService
      .register(rawForm.email, rawForm.username, rawForm.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: err => {
          this.errorMessage.set(err.code);
        },
      });
  }
}
