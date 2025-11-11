import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  template: `
    <h1>Login</h1>

    @if (errorMessage) {
    <div>{{ errorMessage }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <input type="text" placeholder="Email" formControlName="email" />
      </div>
      <div>
        <input type="password" placeholder="Password" formControlName="password" />
      </div>
      <div>
        <button type="submit">Sign In</button>
      </div>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit(): void {
    console.log('login');
  }
}
