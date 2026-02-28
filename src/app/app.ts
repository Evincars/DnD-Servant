import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { routes } from './app.routes';
import { AuthService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav mode="over" class="sidenav">
        <!-- decorative top border strip -->
        <div class="sidenav__top-strip">
          <span class="sidenav__gem sidenav__gem--left">◆</span>
          <span class="sidenav__strip-line"></span>
          <span class="sidenav__gem sidenav__gem--right">◆</span>
        </div>

        <!-- logo -->
        <div class="sidenav__logo-wrap">
          <img src="JaD-logo.png" alt="Jeskyně a Draci" class="sidenav__logo" />
          <div class="sidenav__title">Servant</div>
          <div class="sidenav__subtitle">Průvodce hrdiny</div>
        </div>

        <div class="sidenav__divider">
          <span>⚔</span>
        </div>

        <!-- navigation -->
        <nav class="sidenav__nav">
          <a [routerLink]="routes.characterSheet" class="sidenav__link" (click)="sidenav.toggle()">
            <span class="sidenav__link-icon"><mat-icon>person_edit</mat-icon></span>
            <span class="sidenav__link-label">Karta postavy</span>
            <span class="sidenav__link-arrow">›</span>
          </a>
          <a [routerLink]="routes.dmScreen" class="sidenav__link" (click)="sidenav.toggle()">
            <span class="sidenav__link-icon"><mat-icon>full_coverage</mat-icon></span>
            <span class="sidenav__link-label">PH zástěna</span>
            <span class="sidenav__link-arrow">›</span>
          </a>
        </nav>

        <div class="sidenav__divider">
          <span>🐉</span>
        </div>

        <!-- decorative bottom -->
        <div class="sidenav__bottom-strip">
          <span class="sidenav__gem">◆</span>
          <span class="sidenav__strip-line"></span>
          <span class="sidenav__gem">◆</span>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar u-flex u-justify-between u-align-center">
          <div class="u-flex u-align-center">
            <button matIconButton (click)="sidenav.toggle()" class="menu-btn u-mr-3" aria-label="Toggle menu">
              <mat-icon>menu</mat-icon>
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
      background-size: cover;
      min-height: 100vh;
      min-width: 100vw;
    }

    /* ═══════════════════════════════════════════════════
       SIDENAV — Dark D&D Parchment Style
    ═══════════════════════════════════════════════════ */

    .sidenav {
      width: 280px !important;
      background:
        linear-gradient(180deg, rgba(8,5,16,.97) 0%, rgba(18,12,28,.97) 60%, rgba(8,5,16,.97) 100%),
        url('https://www.transparenttextures.com/patterns/dark-leather.png') !important;
      background-color: #0d0910 !important;
      border-right: none !important;
      box-shadow: 4px 0 32px rgba(0,0,0,.8), inset -1px 0 0 rgba(200,160,60,.25) !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* top & bottom decorative strips */
    .sidenav__top-strip,
    .sidenav__bottom-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px 6px;
    }
    .sidenav__bottom-strip { padding: 6px 14px 12px; margin-top: auto; }

    .sidenav__gem { color: #c8a03c; font-size: 10px; flex-shrink: 0; }
    .sidenav__strip-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(200,160,60,.6), rgba(200,160,60,.15));
    }
    .sidenav__top-strip .sidenav__strip-line {
      background: linear-gradient(90deg, rgba(200,160,60,.15), rgba(200,160,60,.6));
    }

    /* logo area */
    .sidenav__logo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 20px 12px;
      gap: 4px;
    }

    .sidenav__logo {
      width: 100%;
      max-width: 180px;
      height: auto;
      max-height: 100px;
      object-fit: contain;
      filter: drop-shadow(0 2px 12px rgba(200,160,60,.4));
      transition: filter .2s;
    }
    .sidenav__logo:hover { filter: drop-shadow(0 2px 20px rgba(200,160,60,.7)); }

    .sidenav__title {
      font-family: 'Mikadan', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #e8c96a;
      letter-spacing: .08em;
      text-shadow: 0 0 16px rgba(200,160,60,.5);
      margin-top: 4px;
    }

    .sidenav__subtitle {
      font-size: 11px;
      color: #6b6070;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    /* ornamental divider */
    .sidenav__divider {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 20px;
      color: #c8a03c;
      font-size: 14px;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200,160,60,.4), transparent);
      }
    }

    /* nav links */
    .sidenav__nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 14px;
    }

    .sidenav__link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 6px;
      text-decoration: none;
      color: #c8bfb0;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(200,160,60,.12);
      transition: background .18s, border-color .18s, color .18s, transform .12s;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      /* subtle shimmer line on left */
      &::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, transparent, rgba(200,160,60,.5), transparent);
        opacity: 0;
        transition: opacity .18s;
      }

      &:hover {
        background: rgba(200,160,60,.1);
        border-color: rgba(200,160,60,.4);
        color: #e8d5a0;
        transform: translateX(3px);

        &::before { opacity: 1; }

        .sidenav__link-arrow { opacity: 1; transform: translateX(3px); }
        .sidenav__link-icon mat-icon { color: #c8a03c; }
      }
    }

    .sidenav__link-icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #6b6080;
        transition: color .18s;
      }
    }

    .sidenav__link-label {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: .03em;
    }

    .sidenav__link-arrow {
      font-size: 18px;
      color: #c8a03c;
      opacity: 0;
      transition: opacity .18s, transform .18s;
    }

    /* ─── rest of existing styles ─────────────────────── */
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

    @keyframes menu-pulse {
      0%, 100% { box-shadow: 0 0 6px rgba(200,160,60,.4), 0 0 0 1px rgba(200,160,60,.25); }
      50%       { box-shadow: 0 0 14px rgba(200,160,60,.7), 0 0 0 1px rgba(200,160,60,.5); }
    }

    .menu-btn {
      color: #c8a03c !important;
      border-radius: 6px !important;
      border: 1px solid rgba(200,160,60,.3) !important;
      background: rgba(200,160,60,.08) !important;
      animation: menu-pulse 2.8s ease-in-out infinite;
      transition: background .18s, border-color .18s, transform .12s !important;

      &:hover {
        background: rgba(200,160,60,.18) !important;
        border-color: rgba(200,160,60,.7) !important;
        transform: scale(1.08);
        animation: none;
        box-shadow: 0 0 18px rgba(200,160,60,.5);
      }

      mat-icon { font-size: 22px; }
    }

    .logo {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .author-info {
      font-size: 15px;
    }

    .link {
      color: inherit;
      text-decoration: underline;

      &:hover { text-decoration: none; }
    }

    .token {
      background: #333;
      font-size: 16px;
      border-radius: var(--border-radius-1);
      padding: var(--spacing-1) var(--spacing-2);
    }

    .username { font-size: 18px; }

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
    MatSidenavContent,
    MatIconModule,
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
