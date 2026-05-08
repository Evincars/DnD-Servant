import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  Signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SheetThemeService } from '@dn-d-servant/character-sheet-feature';

export interface SettingsDialogData {
  screenshotLoading: Signal<boolean>;
}

@Component({
  selector: 'app-settings-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatDialogModule],
  template: `
    <div class="sd-panel">
      <!-- Header -->
      <div class="sd-header">
        <mat-icon class="sd-header-icon">settings</mat-icon>
        <span class="sd-title">Nastavení</span>
        <button type="button" class="sd-close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="sd-body">

        <!-- LEFT column -->
        <div class="sd-col-panel">

        <!-- Theme section -->
        <div class="sd-section">
          <div class="sd-section-label">Téma karet</div>
          <div class="sd-theme-grid">
            <button
              type="button"
              class="sd-btn sd-btn--theme"
              [class.sd-btn--active]="sheetTheme.theme() === 'light'"
              (click)="sheetTheme.setTheme('light')"
            >
              <mat-icon class="sd-btn-icon sd-icon--light">light_mode</mat-icon>
              <span class="sd-btn-label">Světlé</span>
            </button>
            <button
              type="button"
              class="sd-btn sd-btn--theme"
              [class.sd-btn--active]="sheetTheme.theme() === 'dark'"
              (click)="sheetTheme.setTheme('dark')"
            >
              <mat-icon class="sd-btn-icon sd-icon--dark">dark_mode</mat-icon>
              <span class="sd-btn-label">Tmavé</span>
            </button>
            <button
              type="button"
              class="sd-btn sd-btn--theme"
              [class.sd-btn--active]="sheetTheme.theme() === 'sirien'"
              (click)="sheetTheme.setTheme('sirien')"
            >
              <mat-icon class="sd-btn-icon sd-icon--sirien">auto_awesome</mat-icon>
              <span class="sd-btn-label">Sirien</span>
            </button>
            <button
              type="button"
              class="sd-btn sd-btn--theme"
              [class.sd-btn--active]="sheetTheme.theme() === 'night'"
              (click)="sheetTheme.setTheme('night')"
            >
              <mat-icon class="sd-btn-icon sd-icon--night">nights_stay</mat-icon>
              <span class="sd-btn-label">Noční</span>
            </button>
          </div>
        </div>

        <div class="sd-divider"></div>

        <!-- Page layout section -->
        <div class="sd-section">
          <div class="sd-section-label">Rozvržení stránek karty</div>
          <div class="sd-col">
            <button
              type="button"
              class="sd-btn sd-btn--wide"
              [class.sd-btn--active]="!sheetTheme.spellsFirst()"
              (click)="sheetTheme.spellsFirst() && sheetTheme.toggleSpellsFirst()"
            >
              <mat-icon class="sd-btn-icon">format_list_numbered</mat-icon>
              <div class="sd-btn-text">
                <span class="sd-btn-label">Výchozí pořadí</span>
                <span class="sd-btn-sub">Str. 2 – Vzhled &amp; popis · str. 3 – Kouzla</span>
              </div>
            </button>
            <button
              type="button"
              class="sd-btn sd-btn--wide"
              [class.sd-btn--active]="sheetTheme.spellsFirst()"
              (click)="!sheetTheme.spellsFirst() && sheetTheme.toggleSpellsFirst()"
            >
              <mat-icon class="sd-btn-icon">auto_fix_high</mat-icon>
              <div class="sd-btn-text">
                <span class="sd-btn-label">Kouzla napřed</span>
                <span class="sd-btn-sub">Str. 2 – Kouzla · str. 3 – Vzhled &amp; popis</span>
              </div>
            </button>
          </div>
        </div>

        </div><!-- /sd-col-panel LEFT -->

        <!-- vertical separator -->
        <div class="sd-col-sep"></div>

        <!-- RIGHT column -->
        <div class="sd-col-panel">

        <!-- Export section -->
        <div class="sd-section">
          <div class="sd-section-label">Záloha &amp; export</div>
          <div class="sd-col">
            <button
              type="button"
              class="sd-btn sd-btn--wide"
              [disabled]="data.screenshotLoading()"
              (click)="screenshotClick.emit()"
            >
              <mat-icon class="sd-btn-icon">
                {{ data.screenshotLoading() ? 'hourglass_empty' : 'photo_camera' }}
              </mat-icon>
              <div class="sd-btn-text">
                <span class="sd-btn-label">Záloha jako obrázek (PNG)</span>
                <span class="sd-btn-sub">Stáhne aktuální kartu jako PNG soubor</span>
              </div>
            </button>
            <button
              type="button"
              class="sd-btn sd-btn--wide"
              (click)="jsonClick.emit()"
            >
              <mat-icon class="sd-btn-icon">download</mat-icon>
              <div class="sd-btn-text">
                <span class="sd-btn-label">Záloha jako JSON</span>
                <span class="sd-btn-sub">Exportuje databázi do JSON souboru</span>
              </div>
            </button>
          </div>
        </div>

        <div class="sd-divider"></div>

        <!-- Keyboard shortcuts section -->
        <div class="sd-section">
          <div class="sd-section-label">Klávesové zkratky &amp; gesta</div>
          <div class="sd-col">
            <div class="sd-shortcut-row">
              <div class="sd-shortcut-keys">
                <kbd>Alt</kbd><span class="sd-shortcut-sep">+</span><kbd>←</kbd>
                <span class="sd-shortcut-slash">/</span>
                <kbd>Alt</kbd><span class="sd-shortcut-sep">+</span><kbd>→</kbd>
              </div>
              <span class="sd-shortcut-desc">Přepínání záložek</span>
            </div>
            <div class="sd-shortcut-row">
              <div class="sd-shortcut-keys">
                <kbd>Ctrl</kbd><span class="sd-shortcut-sep">+</span><kbd>K</kbd>
              </div>
              <span class="sd-shortcut-desc">Rychlá navigace (příkazová paleta)</span>
            </div>
            <div class="sd-shortcut-row">
              <div class="sd-shortcut-keys sd-shortcut-keys--gesture">
                <span class="sd-gesture-icon">👆</span>
                <span class="sd-gesture-swipe">swipe ←</span>
                <span class="sd-shortcut-slash">/</span>
                <span class="sd-gesture-swipe">swipe →</span>
              </div>
              <span class="sd-shortcut-desc">Přepínání záložek (dotyková gesta)</span>
            </div>
          </div>
        </div>

        <div class="sd-divider"></div>

        <!-- Credits section -->
        <div class="sd-section">
          <div class="sd-section-label">Poděkování</div>
          <div class="sd-col">
            <div class="sd-credits-row">
              <mat-icon class="sd-credits-icon">auto_awesome</mat-icon>
              <span class="sd-credits-text">
                Speciální poděkování
                <span class="sd-credit-name">&#64;Sirien</span>
                a
                <span class="sd-credit-name">&#64;Dukolm</span>
                za jejich příspěvky a podporu projektu. A spoustě dalších z J&D komunity.
              </span>
            </div>
            <div class="sd-credits-links">
              <a
                href="https://www.jeskyneadraci.cz/"
                target="_blank"
                rel="noopener noreferrer"
                class="sd-credits-link"
              >
                <mat-icon class="sd-credits-link-icon">menu_book</mat-icon>
                <span>Jeskyně a Draci</span>
              </a>
              <a
                href="https://discord.com/invite/5uVhJh2"
                target="_blank"
                rel="noopener noreferrer"
                class="sd-credits-link"
              >
                <mat-icon class="sd-credits-link-icon">forum</mat-icon>
                <span>Discord Mytago</span>
              </a>
            </div>
          </div>
        </div><!-- /sd-col-panel RIGHT -->

      </div>

      <!-- Version footer -->
      <div class="sd-version-bar">
        <span class="sd-version-label">DnD Servant</span>
        <span class="sd-version-badge">v0.9.4</span>
      </div>
    </div>
  `,
  styles: `
    /* ── Panel ─────────────────────────────────────────────── */
    .sd-panel {
      background:
        linear-gradient(180deg, rgba(10,6,20,.99) 0%, rgba(18,12,28,.99) 100%);
      border: 1px solid rgba(200,160,60,.4);
      border-radius: 10px;
      overflow: hidden;
      min-width: 320px;
      max-width: 760px;

      &::before {
        content: '◆';
        position: absolute;
        top: -7px; left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        color: rgba(200,160,60,.6);
        background: rgba(10,6,20,1);
        padding: 0 6px;
        pointer-events: none;
        z-index: 2;
      }
    }

    /* ── Header ────────────────────────────────────────────── */
    .sd-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px 12px;
      border-bottom: 1px solid rgba(200,160,60,.18);
      background: rgba(200,160,60,.04);
    }

    .sd-header-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(200,160,60,.7);
      flex-shrink: 0;
    }

    .sd-title {
      flex: 1;
      font-family: 'Mikadan', sans-serif;
      font-size: 14px;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
    }

    .sd-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      color: rgba(200,160,60,.45);
      transition: color .15s, background .15s;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover {
        background: rgba(200,160,60,.1);
        color: rgba(200,160,60,.9);
      }
    }

    /* ── Body ──────────────────────────────────────────────── */
    .sd-body {
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 0;
      align-items: start;
    }

    /* ── Two-column panels ─────────────────────────────────── */
    .sd-col-panel {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 4px 0;
    }

    /* ── Vertical separator ────────────────────────────────── */
    .sd-col-sep {
      width: 1px;
      align-self: stretch;
      margin: 0 20px;
      background: linear-gradient(180deg, transparent, rgba(200,160,60,.25), transparent);
    }

    .sd-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sd-section-label {
      font-family: 'Mikadan', sans-serif;
      font-size: 10px;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: rgba(200,160,60,.5);
    }

    .sd-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,160,60,.25), transparent);
      margin: 16px 0;
    }

    /* ── Button rows ───────────────────────────────────────── */
    .sd-row {
      display: flex;
      gap: 8px;
    }

    .sd-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* ── Theme 2×2 grid ────────────────────────────────────── */
    .sd-theme-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    /* ── Individual button ─────────────────────────────────── */
    .sd-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid rgba(200,160,60,.22);
      border-radius: 7px;
      background: rgba(200,160,60,.06);
      cursor: pointer;
      transition: background .15s, border-color .15s, box-shadow .15s;
      text-align: left;
      min-width: 0;
      flex: 1;

      &:hover:not(:disabled) {
        background: rgba(200,160,60,.14);
        border-color: rgba(200,160,60,.55);
        box-shadow: 0 0 12px rgba(200,160,60,.2);
      }

      &--active {
        background: rgba(180,100,20,.25) !important;
        border-color: rgba(210,130,40,.7) !important;
        box-shadow: 0 0 14px rgba(200,120,30,.3) !important;

        .sd-btn-label { color: #f0d080 !important; }
        .sd-btn-icon { color: #f0c060 !important; }
      }

      &--wide {
        flex: none;
        width: 100%;
        box-sizing: border-box;
      }

      &:disabled {
        opacity: .45;
        cursor: not-allowed;
      }
    }

    .sd-btn-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(200,160,60,.6);
      flex-shrink: 0;
      transition: color .15s;
    }

    /* ── Theme button icon colours ─────────────────────────── */
    .sd-icon--light  { color: rgba(240, 200, 80, .75); }
    .sd-icon--dark   { color: rgba(210, 150, 40, .7);  }
    .sd-icon--sirien { color: rgba(140, 15,  15, .9);  }
    .sd-icon--night  { color: rgba(80,  130, 210, .8); }

    .sd-btn--active .sd-icon--dark   { color: #f0c060 !important; }
    .sd-btn--active .sd-icon--sirien { color: #c02020 !important; }
    .sd-btn--active .sd-icon--night  { color: #7ab0f0 !important; }

    /* Tmavé active accent — warm amber */
    .sd-btn.sd-btn--theme:nth-child(2).sd-btn--active {
      background: rgba(160, 100, 10, .28) !important;
      border-color: rgba(220, 150, 40, .75) !important;
      box-shadow: 0 0 14px rgba(200, 130, 20, .3) !important;
      .sd-btn-label { color: #f5cc70 !important; }
    }

    /* Sirien active accent — blood red on charcoal */
    .sd-btn.sd-btn--theme:nth-child(3).sd-btn--active {
      background: rgba(40, 40, 40, .92) !important;
      border-color: rgba(140, 15,  15, .8) !important;
      box-shadow: 0 0 16px rgba(140, 15,  15, .45), inset 0 0 8px rgba(100, 8, 8, .25) !important;
      .sd-btn-label { color: #c84040 !important; }
    }

    /* Noční active accent — steel blue */
    .sd-btn.sd-btn--theme:nth-child(4).sd-btn--active {
      background: rgba(15,  50,  130, .32) !important;
      border-color: rgba(70,  130, 220, .75) !important;
      box-shadow: 0 0 14px rgba(50,  110, 200, .35) !important;
      .sd-btn-label { color: #90c0f8 !important; }
    }

    .sd-btn-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .sd-btn-label {
      font-family: 'Mikadan', sans-serif;
      font-size: 12px;
      letter-spacing: .06em;
      color: #c8bfb0;
      transition: color .15s;
      white-space: nowrap;
    }

    .sd-btn-sub {
      font-size: 10px;
      color: rgba(180,160,130,.45);
      letter-spacing: .04em;
      white-space: normal;
      line-height: 1.3;
    }

    .sd-btn:hover:not(:disabled) {
      .sd-btn-label { color: #e8d5a0; }
      .sd-btn-icon { color: rgba(200,160,60,.9); }
    }

    /* ── Keyboard shortcut rows ────────────────────────────── */
    .sd-shortcut-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border: 1px solid rgba(200,160,60,.15);
      border-radius: 7px;
      background: rgba(200,160,60,.04);
    }

    .sd-shortcut-keys {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
      min-width: 130px;
    }

    .sd-shortcut-sep {
      font-size: 10px;
      color: rgba(200,160,60,.35);
      padding: 0 1px;
    }

    .sd-shortcut-slash {
      font-size: 12px;
      color: rgba(200,160,60,.25);
      padding: 0 4px;
    }

    kbd {
      font-size: 10px;
      padding: 2px 6px;
      border: 1px solid rgba(200,160,60,.35);
      border-bottom-width: 2px;
      border-radius: 4px;
      background: rgba(200,160,60,.08);
      color: rgba(200,160,60,.75);
      font-family: monospace;
      letter-spacing: .03em;
      white-space: nowrap;
    }

    .sd-shortcut-desc {
      font-size: 11px;
      color: rgba(180,160,130,.6);
      letter-spacing: .04em;
      line-height: 1.3;
    }

    .sd-shortcut-keys--gesture {
      min-width: 130px;
    }

    .sd-gesture-icon {
      font-size: 13px;
      line-height: 1;
      flex-shrink: 0;
    }

    .sd-gesture-swipe {
      font-size: 10px;
      font-family: monospace;
      letter-spacing: .04em;
      padding: 2px 6px;
      border: 1px solid rgba(200,160,60,.3);
      border-radius: 4px;
      background: rgba(200,160,60,.07);
      color: rgba(200,160,60,.7);
      white-space: nowrap;
    }

    /* ── Credits section ───────────────────────────────────── */
    .sd-credits-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border: 1px solid rgba(140, 15, 15, .25);
      border-radius: 7px;
      background: rgba(40, 40, 40, .55);
    }

    .sd-credits-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: rgba(140, 15, 15, .8);
      flex-shrink: 0;
      margin-top: 1px;
    }

    .sd-credits-text {
      font-size: 11px;
      color: rgba(180, 155, 130, .65);
      letter-spacing: .03em;
      line-height: 1.5;
    }

    .sd-credit-name {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .06em;
      color: rgba(200, 50, 50, .85);
      padding: 0 2px;
    }

    .sd-credits-links {
      display: flex;
      gap: 8px;
    }

    .sd-credits-link {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      padding: 8px 12px;
      border: 1px solid rgba(140, 15, 15, .2);
      border-radius: 7px;
      background: rgba(40, 40, 40, .4);
      color: rgba(180, 60, 60, .8);
      text-decoration: none;
      font-size: 11px;
      font-family: 'Mikadan', sans-serif;
      letter-spacing: .06em;
      transition: background .15s, border-color .15s, color .15s, box-shadow .15s;

      &:hover {
        background: rgba(40, 40, 40, .8);
        border-color: rgba(140, 15, 15, .6);
        color: rgba(200, 80, 80, 1);
        box-shadow: 0 0 10px rgba(140, 15, 15, .25);
      }
    }

    .sd-credits-link-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      color: inherit;
    }

    /* ── Version bar ───────────────────────────────────────── */
    .sd-version-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 16px;
      border-top: 1px solid rgba(200,160,60,.1);
      background: rgba(200,160,60,.02);
    }

    .sd-version-label {
      font-family: 'Mikadan', sans-serif;
      font-size: 10px;
      letter-spacing: .1em;
      color: rgba(200,160,60,.25);
      text-transform: uppercase;
    }

    .sd-version-badge {
      font-size: 10px;
      font-family: monospace;
      letter-spacing: .08em;
      color: rgba(200,160,60,.45);
      padding: 1px 6px;
      border: 1px solid rgba(200,160,60,.2);
      border-radius: 4px;
      background: rgba(200,160,60,.05);
    }
  `,
})
export class SettingsDialogComponent {
  readonly screenshotClick = output<void>();
  readonly jsonClick = output<void>();

  readonly sheetTheme = inject(SheetThemeService);
  readonly data: SettingsDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SettingsDialogComponent>);


  close(): void {
    this.dialogRef.close();
  }
}




