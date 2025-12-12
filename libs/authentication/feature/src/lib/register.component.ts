import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

@Component({
  selector: 'register',
  template: `
    <h1 class="align-center">Registrace</h1>

    <div style="width: 600px; margin: 0 auto;">
      Email se neověřuje. Může být klidně falešný. Přihlašování slouží pouze k tomu, abych mohl pod jednotlivými uživateli ukládat
      data na server. Nevýhoda neexistujícího mailu je, že při zapomenutí hesla nejde obnovit.
      <br />
      <br />
      Např. můžete klidně použít:
      <ul>
        <li>
          <span class="u-text-muted">email:</span>
          mujtest&commat;falesny.cz
        </li>
        <li>
          <span class="u-text-muted">heslo:</span>
          test123
        </li>
      </ul>
    </div>

    @if (errorMessage()) {
    <div class="align-center">{{ errorMessage() }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="u-flex-col u-gap-2">
      <mat-form-field>
        <mat-label>Už. jméno</mat-label>
        <input type="text" matInput formControlName="username" placeholder="Evincars" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input type="email" matInput formControlName="email" placeholder="pat@example.com" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Heslo</mat-label>
        <input type="password" matInput formControlName="password" />
      </mat-form-field>
      <button type="submit" [disabled]="!form.valid" matButton="tonal">Registrovat se</button>
    </form>
  `,
  styles: `
    form {
      width: 300px;
      margin: 0 auto;
    }
    .align-center {
      text-align: center;
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButton, MatFormField, MatInput, MatLabel],
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
