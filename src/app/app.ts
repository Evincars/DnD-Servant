import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatPrefix } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav mode="over">
        <mat-toolbar class="toolbar u-flex u-align-end u-justify-end">
          <button matButton="outlined" (click)="sidenav.toggle()" class="font">
            <mat-icon matPrefix>close</mat-icon>
            Close menu
          </button>
        </mat-toolbar>

        <mat-divider class="u-mb-3 u-mt-3" />
        <a [routerLink]="routes.characterSheet">
          <button matButton="tonal" class="u-mb-3 u-mt-3 u-w-100 font" (click)="sidenav.toggle()">Karta postavy</button>
        </a>
        <a [routerLink]="routes.dmScreen">
          <button matButton="tonal" class="u-mb-3 u-mt-3 u-w-100 font" (click)="sidenav.toggle()">PH zástěna</button>
        </a>
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
              <a class="link token" [routerLink]="routes.login">Přihlásit</a>
              |
              <a class="link token" href="/#">Odhlásit</a>
              |
              <a class="link token u-mr-9" [routerLink]="routes.register">Registrovat</a>
              Created by
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
    MatDivider,
  ],
})
export class App {
  protected readonly routes = routes;
}
