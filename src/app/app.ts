import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { routes } from './app.routes';
import { AuthService, LocalStorageService, DB_BACKUP_KEY_CHARACTER, DB_BACKUP_KEY_GROUP, DB_BACKUP_KEY_NOTES } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import html2canvas from 'html2canvas';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { DiceRollerComponent } from '@dn-d-servant/ui';

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
          <a [routerLink]="routes.dmPage" class="sidenav__link" (click)="sidenav.toggle()">
            <span class="sidenav__link-icon"><mat-icon>construction</mat-icon></span>
            <span class="sidenav__link-label">PH nástroje</span>
            <span class="sidenav__link-arrow">›</span>
          </a>
          <a [routerLink]="routes.dndDatabase" class="sidenav__link" (click)="sidenav.toggle()">
            <span class="sidenav__link-icon"><mat-icon>menu_book</mat-icon></span>
            <span class="sidenav__link-label">Databáze D&amp;D</span>
            <span class="sidenav__link-arrow">›</span>
          </a>
          <a [routerLink]="routes.helpAndTips" class="sidenav__link" (click)="sidenav.toggle()">
            <span class="sidenav__link-icon"><mat-icon>help_outline</mat-icon></span>
            <span class="sidenav__link-label">Nápověda &amp; Tipy</span>
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
                <mat-icon class="backup-button-icon">hourglass_empty</mat-icon>
                } @else {
                <mat-icon class="backup-button-icon">photo_camera</mat-icon>
                }
                <span class="backup-btn__label">Záloha</span>
              </button>
              <button
                (click)="onJsonBackupClick()"
                class="github-link backup-btn u-ml-2"
                matTooltip="Stáhnout zálohu databáze jako JSON soubor"
              >
                <mat-icon class="backup-button-icon">download</mat-icon>
                <span class="backup-btn__label">JSON</span>
              </button>
            </div>
            <div class="toolbar__right author-info u-flex u-align-center">
              @if (authService.currentUser()) {
              <b class="username u-mr-2">{{ authService.currentUser()!.username }}</b>
              <a class="link token u-mr-2" href="#" (click)="$event.preventDefault(); logout()">Odhlásit</a>
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
              <a class="link author-link" target="_blank" href="https://lasak.netlify.app/">lasaks.eu</a>
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
    <!-- Always-visible dice roller floating on left side -->
    <dice-roller />
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
    DiceRollerComponent,
  ],
})
export class App implements OnInit, OnDestroy {
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  private readonly localStorage = inject(LocalStorageService);
  private readonly characterSheetStore = inject(CharacterSheetStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  routes = routes;
  showBackToTop = signal(false);
  screenshotLoading = signal(false);
  private firstLoad = true;

  @ViewChild('content') formElement: ElementRef | undefined;

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.authService.currentUser.set({
          email: user.email!,
          username: user.displayName!,
        });
        this.characterSheetStore.restoreDraftsToDb();

        if (!this.firstLoad) {
          this.snackBar.open(`⚔️ Vítej zpět, ${user.displayName}!`, '✕', {
            verticalPosition: 'top',
            duration: 3500,
            panelClass: ['snackbar--success'],
          });
        }
      } else {
        this.authService.currentUser.set(null);
      }
      this.firstLoad = false;
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

  logout(): void {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.snackBar.open('🚪 Byl jsi odhlášen. Šťastný lov!', '✕', {
          verticalPosition: 'top',
          duration: 3500,
          panelClass: ['snackbar--info'],
        });
        this.router.navigateByUrl('/login');
      });
  }

  onJsonBackupClick(): void {
    const characterSheet = this.localStorage.getDataSync(DB_BACKUP_KEY_CHARACTER);
    const groupSheet = this.localStorage.getDataSync(DB_BACKUP_KEY_GROUP);
    const notesPage = this.localStorage.getDataSync(DB_BACKUP_KEY_NOTES);

    const backup = {
      exportedAt: new Date().toISOString(),
      characterSheet: characterSheet ?? null,
      groupSheet: groupSheet ?? null,
      notesPage: notesPage ?? null,
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dnd-servant-backup-${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async onScreenshotBackupClick() {
    if (this.screenshotLoading()) return;
    this.screenshotLoading.set(true);

    try {
      // Target only the currently visible tab body
      const activeTabBody =
        (document.querySelector('.mat-mdc-tab-body-active .mat-mdc-tab-body-content') as HTMLElement) ??
        (document.querySelector('.mat-mdc-tab-body-active') as HTMLElement) ??
        (this.formElement?.nativeElement as HTMLElement);

      if (!activeTabBody) return;

      // Temporarily expand overflow so full scroll height is captured
      const prevOverflow = activeTabBody.style.overflow;
      activeTabBody.style.overflow = 'visible';

      const canvas = await html2canvas(activeTabBody, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: activeTabBody.scrollWidth,
        height: activeTabBody.scrollHeight,
        windowWidth: activeTabBody.scrollWidth,
        windowHeight: activeTabBody.scrollHeight,
        logging: false,
      });

      activeTabBody.style.overflow = prevOverflow;

      const timestamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.download = `karta-postavy-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      this.screenshotLoading.set(false);
    }
  }
}
