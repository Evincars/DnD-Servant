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
        <mat-toolbar class="toolbar">
          <div class="toolbar__inner">
            <div class="toolbar__left u-flex u-align-center">
              <button matIconButton (click)="sidenav.toggle()" class="menu-btn u-mr-3" aria-label="Toggle menu">
                <mat-icon>menu</mat-icon>
              </button>
              <img src="JaD-logo.png" alt="Dungeons & Dragons Logo" class="logo u-mr-3" />
              <span>Servant</span>
              <button
                (click)="onScreenshotBackupClick()"
                [disabled]="screenshotLoading()"
                class="github-link backup-btn u-ml-3"
                matTooltip="Stáhnout zálohu jako obrázky (PNG)"
              >
                @if (screenshotLoading()) {
                <mat-icon class="toolbar-icon">hourglass_empty</mat-icon>
                } @else {
                <mat-icon class="toolbar-icon">photo_camera</mat-icon>
                }
                <span class="backup-btn__label">Záloha</span>
              </button>
            </div>
            <div class="toolbar__right author-info u-flex u-align-center">
              @if (authService.currentUser()) {
              <b class="username u-mr-2">{{ authService.currentUser()!.username }}</b>
              <a class="link token u-mr-2" href="#" (click)="$event.preventDefault(); this.authService.logout()">Odhlásit</a>
              } @if (authService.currentUser() === null) {
              <a class="link token u-mr-2" [routerLink]="routes.login">Přihlásit</a>
              <a class="link token u-mr-2" [routerLink]="routes.register">Registrovat</a>
              }
              <a
                target="_blank"
                href="https://github.com/Evincars/DnD-Servant"
                matTooltip="DnD Servant GitHub repository"
                class="github-link u-flex u-align-center u-mr-2"
              >
                <mat-icon class="toolbar-icon">code_blocks</mat-icon>
              </a>
              <a class="link" target="_blank" href="https://lasak.netlify.app/">lasaks.eu</a>
            </div>
          </div>
        </mat-toolbar>
        <div class="main-content u-flex-col" #content>
          <span class="main-corner main-corner--tl">◆</span>
          <span class="main-corner main-corner--tr">◆</span>
          <span class="main-corner main-corner--bl">◆</span>
          <span class="main-corner main-corner--br">◆</span>
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
  styleUrl: './app.component.scss',
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
