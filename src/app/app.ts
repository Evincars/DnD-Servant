import { Component, ChangeDetectionStrategy, DestroyRef, ElementRef, inject, DOCUMENT, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { routes } from './app.routes';
import { AuthService, LocalStorageService, DB_BACKUP_KEY_CHARACTER, DB_BACKUP_KEY_GROUP, DB_BACKUP_KEY_NOTES, TabNavigatorService } from '@dn-d-servant/util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import html2canvas from 'html2canvas';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { DiceRollerComponent } from '@dn-d-servant/ui';
import { SheetThemeService } from '@dn-d-servant/character-sheet-feature';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent, SettingsDialogData } from './settings-dialog.component';
import { CommandPaletteComponent } from './command-palette.component';
import { ReleaseNotesDialogComponent } from './release-notes-dialog.component';
import { fromEvent } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
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

      <mat-sidenav-content #sidenavContent>
        <mat-toolbar class="toolbar">
          <div class="toolbar__inner">
            <div class="toolbar__left u-flex u-align-center">
              <button matIconButton (click)="sidenav.toggle()" class="menu-btn u-mr-3" aria-label="Otevřít menu" matTooltip="Navigace">
                <mat-icon>menu</mat-icon>
              </button>
              <img src="JaD-logo.png" alt="Dungeons & Dragons Logo" class="logo u-mr-3" />
              <span class="toolbar-servant-text">Servant</span>
              <button
                type="button"
                class="github-link settings-btn u-ml-2"
                (click)="openSettings()"
                matTooltip="Nastavení"
              >
                <mat-icon class="toolbar-icon">settings</mat-icon>
              </button>
              <button
                type="button"
                class="github-link settings-btn u-ml-2 cmd-palette-btn"
                (click)="openCommandPalette()"
                matTooltip="Rychlé akce (Ctrl+K)"
                aria-label="Rychlé akce"
              >
                <mat-icon class="toolbar-icon">search</mat-icon>
              </button>
              <button
                type="button"
                class="github-link settings-btn u-ml-2"
                (click)="openReleaseNotes()"
                matTooltip="Co je nového"
                aria-label="Co je nového"
              >
                <mat-icon class="toolbar-icon">new_releases</mat-icon>
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

            <!-- Mobile auth toggle (hidden on desktop) -->
            <button
              class="mobile-auth-btn github-link u-ml-2"
              (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              aria-label="Účet / přihlášení"
              matTooltip="Přihlášení & nastavení"
            >
              <mat-icon class="toolbar-icon">{{ mobileMenuOpen() ? 'close' : 'manage_accounts' }}</mat-icon>
            </button>
          </div>
        </mat-toolbar>
        <!-- Mobile account dropdown -->
        @if (mobileMenuOpen()) {
        <div class="mobile-menu-backdrop" (click)="mobileMenuOpen.set(false)"></div>
        <div class="mobile-menu-dropdown">
          <div class="mobile-menu-section">
            @if (authService.currentUser()) {
            <b class="mobile-menu-username">{{ authService.currentUser()!.username }}</b>
            <a class="link token mobile-menu-link" href="#" (click)="$event.preventDefault(); logout(); mobileMenuOpen.set(false)">
              <mat-icon class="mobile-menu-icon">logout</mat-icon> Odhlásit
            </a>
            } @if (authService.currentUser() === null) {
            <a class="link token mobile-menu-link" [routerLink]="routes.login" (click)="mobileMenuOpen.set(false)">
              <mat-icon class="mobile-menu-icon">login</mat-icon> Přihlásit
            </a>
            <a class="link token mobile-menu-link" [routerLink]="routes.register" (click)="mobileMenuOpen.set(false)">
              <mat-icon class="mobile-menu-icon">person_add</mat-icon> Registrovat
            </a>
            }
          </div>
          <div class="mobile-menu-divider"></div>
          <div class="mobile-menu-section">
            <a target="_blank" href="https://github.com/Evincars/DnD-Servant" class="mobile-menu-link token" (click)="mobileMenuOpen.set(false)">
              <mat-icon class="mobile-menu-icon">code_blocks</mat-icon> GitHub
            </a>
            <a class="mobile-menu-link token" target="_blank" href="https://lasak.netlify.app/" (click)="mobileMenuOpen.set(false)">
              <mat-icon class="mobile-menu-icon">language</mat-icon> lasaks.eu
            </a>
          </div>
        </div>
        }
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
  readonly sheetTheme = inject(SheetThemeService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly characterSheetStore = inject(CharacterSheetStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly tabNavigator = inject(TabNavigatorService);
  private readonly doc = inject(DOCUMENT);

  routes = routes;
  showBackToTop = signal(false);
  screenshotLoading = signal(false);
  mobileMenuOpen = signal(false);
  private firstLoad = true;

  // ── Single-finger horizontal swipe tracking ──────────────
  private _touchStartX = 0;
  private _touchStartY = 0;
  private _touchLastX = 0;
  private _touchLastY = 0;
  private _touchActive = false;

  readonly sidenavContent = viewChild<MatSidenavContent>('sidenavContent');
  readonly formElement = viewChild<ElementRef>('content');

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

    // Listen to the mat-sidenav-content scroll, not window
    const contentEl = this.sidenavContent()?.getElementRef().nativeElement as HTMLElement | undefined;
    if (contentEl) {
      contentEl.addEventListener('scroll', this.onScroll);
    }

    // Two-finger swipe — passive listeners for best scroll performance
    fromEvent<TouchEvent>(this.doc, 'touchstart', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.onTouchStart(e));

    fromEvent<TouchEvent>(this.doc, 'touchmove', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.onTouchMove(e));

    fromEvent<TouchEvent>(this.doc, 'touchend', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.onTouchEnd(e));
  }

  ngOnDestroy(): void {
    const contentEl = this.sidenavContent()?.getElementRef().nativeElement as HTMLElement | undefined;
    if (contentEl) {
      contentEl.removeEventListener('scroll', this.onScroll);
    }
  }

  // ── Keyboard shortcut handler (via host binding) ─────────

  onGlobalKeydown(event: KeyboardEvent): void {
    // Ctrl+K → command palette
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.openCommandPalette();
      return;
    }

    // Alt+Left / Alt+Right → navigate tabs
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      this.tabNavigator.navigate(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  // ── Two-finger swipe ─────────────────────────────────────

  private onTouchStart(e: TouchEvent): void {
    // Only track single-finger touches; pinch/zoom (2+ fingers) are ignored
    if (e.touches.length !== 1) {
      this._touchActive = false;
      return;
    }
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
    this._touchLastX = this._touchStartX;
    this._touchLastY = this._touchStartY;
    this._touchActive = true;
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this._touchActive || e.touches.length !== 1) return;
    this._touchLastX = e.touches[0].clientX;
    this._touchLastY = e.touches[0].clientY;
  }

  private onTouchEnd(_e: TouchEvent): void {
    if (!this._touchActive) return;
    this._touchActive = false;

    const dx = this._touchLastX - this._touchStartX;
    const dy = this._touchLastY - this._touchStartY;
    const minSwipe = 55;

    // Require clearly horizontal motion: dx must dominate dy by 2× and exceed threshold.
    // This keeps vertical scrolling and drag-and-drop interactions untouched.
    if (Math.abs(dx) >= minSwipe && Math.abs(dx) > Math.abs(dy) * 2) {
      this.tabNavigator.navigate(dx < 0 ? 1 : -1); // swipe left → next, swipe right → prev
    }
  }

  // ── Command palette ──────────────────────────────────────

  private _commandPaletteRef: MatDialogRef<CommandPaletteComponent> | null = null;

  openCommandPalette(): void {
    // If already open, close it (Ctrl+K acts as a toggle)
    if (this._commandPaletteRef) {
      this._commandPaletteRef.close();
      this._commandPaletteRef = null;
      return;
    }
    this._commandPaletteRef = this.dialog.open(CommandPaletteComponent, {
      panelClass: 'cp-dialog-panel',
      backdropClass: 'cp-dialog-backdrop',
      hasBackdrop: true,
      restoreFocus: false,
    });
    this._commandPaletteRef.afterClosed().subscribe(() => {
      this._commandPaletteRef = null;
    });
  }

  openReleaseNotes(): void {
    this.dialog.open(ReleaseNotesDialogComponent, {
      panelClass: 'sd-dialog-panel',
      backdropClass: 'sd-dialog-backdrop',
      hasBackdrop: true,
    });
  }

  // ── Scroll handler ───────────────────────────────────────

  onScroll = (): void => {
    const contentEl = this.sidenavContent()?.getElementRef().nativeElement as HTMLElement | undefined;
    this.showBackToTop.set((contentEl?.scrollTop ?? 0) > 200);
  };

  scrollToTop(): void {
    const contentEl = this.sidenavContent()?.getElementRef().nativeElement as HTMLElement | undefined;
    contentEl?.scrollTo({ top: 0, behavior: 'smooth' });
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

  openSettings(): void {
    const ref = this.dialog.open<SettingsDialogComponent, SettingsDialogData>(SettingsDialogComponent, {
      panelClass: 'sd-dialog-panel',
      backdropClass: 'sd-dialog-backdrop',
      hasBackdrop: true,
      data: { screenshotLoading: this.screenshotLoading },
    });

    ref.componentInstance.screenshotClick.subscribe(() => {
      ref.close();
      this.onScreenshotBackupClick();
    });
    ref.componentInstance.jsonClick.subscribe(() => {
      ref.close();
      this.onJsonBackupClick();
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
        (this.formElement()?.nativeElement as HTMLElement);

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
