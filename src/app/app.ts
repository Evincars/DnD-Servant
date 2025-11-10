import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatButton, MatIconButton } from '@angular/material/button';
import { CharacterSheetComponent } from '@dn-d-servant/character-sheet-feature';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatPrefix } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav mode="over">
        <button matButton (click)="sidenav.toggle()">
          <mat-icon matPrefix>close</mat-icon>
          Close menu
        </button>
        <mat-divider class="u-mb-3 u-mt-3" />
        <button matButton class="u-mb-3 u-mt-3">Karta postavy</button>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <button matIconButton (click)="sidenav.toggle()">
            <mat-icon matPrefix>menu</mat-icon>
          </button>
          <span>D&D Servant</span>
        </mat-toolbar>
        <div class="main-content u-flex-col u-overflow-auto u-mt-5">
          <p>Vítejte v D&D Servant! Toto je vaše digitální karta postavy pro hraní Dungeons & Dragons.</p>
          <character-sheet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
      .container {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
      }
      .main-content {
        width: 70%;
        margin: 0 auto;
        border: 2px solid #333;
        padding: var(--spacing-3);
        border-radius: var(--border-radius-2);
        background: #111;
      }
  `,
  imports: [
    RouterModule,
    MatSidenavContainer,
    MatSidenav,
    MatButton,
    MatSidenavContent,
    CharacterSheetComponent,
    MatIconModule,
    MatPrefix,
    MatToolbar,
    MatIconButton,
    MatDivider,
  ],
})
export class App {}
