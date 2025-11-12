import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'login',
  template: `
    <h1 class="u-w-100 title">Login</h1>

    @if (errorMessage) {
    <div>{{ errorMessage }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="u-flex-col u-gap-2">
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input type="email" matInput formControlName="email" placeholder="pat@example.com" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Heslo</mat-label>
        <input type="password" matInput formControlName="password" />
      </mat-form-field>
      <button type="submit" [disabled]="!form.valid" matButton="tonal">Přihlásit se</button>
    </form>
  `,
  styles: `
    form {
      width: 300px;
      margin: 0 auto;
    }
    .title {
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.authService
      .login(rawForm.email, rawForm.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: err => {
          this.errorMessage = err.code;
        },
      });
  }
}
