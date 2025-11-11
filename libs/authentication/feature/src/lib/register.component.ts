import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'register',
  template: `
    <h1>Register</h1>

    @if (errorMessage) {
    <div>{{ errorMessage }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <input type="text" placeholder="Uživatelské jméno" formControlName="username" />
      </div>
      <div>
        <input type="text" placeholder="Email" formControlName="email" />
      </div>
      <div>
        <input type="password" placeholder="Heslo" formControlName="password" />
      </div>
      <div>
        <button type="submit">Registrovat</button>
      </div>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
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
  errorMessage: string | null = null;

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
          this.errorMessage = err.code;
        },
      });
  }
}
