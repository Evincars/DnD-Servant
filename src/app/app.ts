import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatPrefix } from '@angular/material/form-field';
import { routes } from './app.routes';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import html2canvas from 'html2canvas';

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
            <button
              matIconButton
              (click)="onScreenshotBackupClick()"
              class="u-ml-3"
              [disabled]="screenshotLoading()"
              style="color: var(--primary-color);"
              matTooltip="Stáhnout zálohu jako obrázky (PNG)"
            >
              @if (screenshotLoading()) {
              <mat-icon>hourglass_empty</mat-icon>
              } @else {
              <mat-icon>photo_camera</mat-icon>
              }
            </button>
          </div>
          <div class="author-info">
            <span class="u-flex u-align-center">
              @if (authService.currentUser()) { Přihlášen&nbsp;
              <b class="username u-mr-3">{{ authService.currentUser()!.username }}</b>
              <a class="link token u-mr-9" href="#" (click)="this.authService.logout()">Odhlásit</a>
              } @if (authService.currentUser() === null) {
              <a class="link token u-mr-3" [routerLink]="routes.login">Přihlásit</a>
              <a class="link token u-mr-9" [routerLink]="routes.register">Registrovat</a>
              }
              <a target="_blank" href="https://github.com/Evincars/DnD-Servant" class="link u-flex u-align-center u-mr-2">
                <mat-icon>code_blocks</mat-icon>
              </a>
              Created by&nbsp;
              <a class="link" target="_blank" href="https://lasak.netlify.app/">lasaks.eu</a>
            </span>
          </div>
        </mat-toolbar>
        <div class="main-content u-flex-col" #content>
          <router-outlet />
        </div>
        @if (showBackToTop()) {
        <button
          (click)="scrollToTop()"
          mat-fab
          class="back-to-top"
          matTooltip="Scroll zpátky nahoru"
          color="secondary"
          aria-label="Back to top"
        >
          <mat-icon>arrow_upward</mat-icon>
        </button>
        }
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .font {
      font-family: 'Mikadan', sans-serif;
      font-size: 19px;
    }

    .container {
      background: url('/wallpaper-1.webp') no-repeat center center fixed;
    }

    .main-content {
      width: 1310px;
      margin: 0 auto;
      border: 2px solid #333;
      padding: var(--spacing-3);
      border-radius: var(--border-radius-1);
      background: #232222;
      opacity: 0.9;
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

    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
    MatFabButton,
    MatTooltip,
  ],
})
export class App implements OnInit, OnDestroy {
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  routes = routes;
  showBackToTop = signal(false);
  screenshotLoading = signal(false);

  @ViewChild('content') formElement: ElementRef | undefined;

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
    window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll, true);
  }

  onScroll = (): void => {
    this.showBackToTop.set(window.scrollY > 200);
  };

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async onScreenshotBackupClick() {
    if (!this.formElement || this.screenshotLoading()) return;
    this.screenshotLoading.set(true);

    try {
      const element = this.formElement.nativeElement as HTMLElement;
      const fullHeight = element.scrollHeight;
      const fullWidth = element.scrollWidth;

      // Capture the full element at its natural size
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        logging: false,
      });

      // Split into A4-height slices (~1122px at 96dpi) so each image fits on a page
      const sliceHeight = 1122;
      const totalSlices = Math.ceil(fullHeight / sliceHeight);
      const timestamp = new Date().toISOString().slice(0, 10);

      for (let i = 0; i < totalSlices; i++) {
        const sliceCanvas = document.createElement('canvas');
        const currentSliceHeight = Math.min(sliceHeight, fullHeight - i * sliceHeight);
        sliceCanvas.width = fullWidth;
        sliceCanvas.height = currentSliceHeight;

        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, i * sliceHeight, fullWidth, currentSliceHeight, 0, 0, fullWidth, currentSliceHeight);

        const link = document.createElement('a');
        link.download = `karta-postavy-${timestamp}-${i + 1}z${totalSlices}.png`;
        link.href = sliceCanvas.toDataURL('image/png');
        link.click();

        // Small delay between downloads so browser doesn't block them
        await new Promise(r => setTimeout(r, 300));
      }
    } finally {
      this.screenshotLoading.set(false);
    }
  }
}
