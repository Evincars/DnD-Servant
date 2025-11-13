import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatPrefix } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';
import { routes } from './app.routes';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav mode="over">
        <mat-toolbar class="toolbar u-flex u-justify-center">
          <img src="JaD-logo.png" alt="Dungeons & Dragons Logo" class="logo" />
        </mat-toolbar>

        <div class="u-flex-col u-pl-1 u-pr-1">
          <a [routerLink]="routes.characterSheet">
            <button matButton="tonal" class="u-mb-3 u-mt-3 u-w-100 font" (click)="sidenav.toggle()">
              <mat-icon matPrefix>person_edit</mat-icon>
              Karta postavy
            </button>
          </a>
          <a [routerLink]="routes.dmScreen">
            <button matButton="tonal" class="u-mb-3 u-mt-3 u-w-100 font" (click)="sidenav.toggle()">
              <mat-icon matPrefix>full_coverage</mat-icon>
              PH zástěna
            </button>
          </a>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar u-flex u-justify-between u-align-center">
          <div class="u-flex u-align-center">
            <button matIconButton (click)="sidenav.toggle()">
              <mat-icon matPrefix>menu</mat-icon>
            </button>
            <img src="JaD-logo.png" alt="Dungeons & Dragons Logo" class="logo u-mr-3" />
            <span>Servant</span>
          </div>
          <div class="author-info">
            <span>
              @if (authService.currentUser()) { Přihlášen
              <b class="username u-mr-3">{{ authService.currentUser()!.username }}</b>
              <a class="link token u-mr-9" href="#" (click)="this.authService.logout()">Odhlásit</a>
              } @if (authService.currentUser() === null) {
              <a class="link token" [routerLink]="routes.login">Přihlásit</a>
              |
              <a class="link token u-mr-9" [routerLink]="routes.register">Registrovat</a>
              } Created by
              <a class="link" target="_blank" href="https://lasak.netlify.app/">lasaks.eu</a>
            </span>
          </div>
        </mat-toolbar>
        <div class="main-content u-flex-col u-overflow-auto">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .font {
      font-family: 'Mikadan', sans-serif;
      font-size: 19px;
    }
    .container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
    .main-content {
      width: 1310px;
      margin: 0 auto;
      border: 2px solid #333;
      padding: var(--spacing-3);
      border-radius: var(--border-radius-2);
      background: #111;
      margin-top: var(--spacing-3) !important;
      margin-bottom: var(--spacing-3) !important;
    }
    .toolbar {
      font-family: 'Mikadan', sans-serif;
    }
    .logo {
      height: 60px;
    }
    .author-info {
      font-size: 15px;
    }
    .link {
      color: inherit;
      text-decoration: underline;
      &:hover {
        text-decoration: none;
      }
    }
    .token {
      background: #333;
      font-size: 16px;
      border-radius: var(--border-radius-1);
      padding: var(--spacing-1) var(--spacing-2);
    }
    .username {
      font-size: 18px;
    }
  `,
  imports: [
    RouterModule,
    MatSidenavContainer,
    MatSidenav,
    MatButton,
    MatSidenavContent,
    MatIconModule,
    MatPrefix,
    MatToolbar,
    MatIconButton,
  ],
})
export class App implements OnInit {
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  routes = routes;

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.authService.currentUser.set({
          email: user.email!,
          username: user.displayName!,
        });
      } else {
        this.authService.currentUser.set(null);
      }
    });
  }
}
