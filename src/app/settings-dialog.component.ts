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

        <!-- Theme section -->
        <div class="sd-section">
          <div class="sd-section-label">Téma karet</div>
          <div class="sd-row">
            <button
              type="button"
              class="sd-btn"
              [class.sd-btn--active]="!sheetTheme.darkMode()"
              (click)="setTheme(false)"
            >
              <mat-icon class="sd-btn-icon">light_mode</mat-icon>
              <span class="sd-btn-label">Světlé</span>
            </button>
            <button
              type="button"
              class="sd-btn"
              [class.sd-btn--active]="sheetTheme.darkMode()"
              (click)="setTheme(true)"
            >
              <mat-icon class="sd-btn-icon">dark_mode</mat-icon>
              <span class="sd-btn-label">Tmavé</span>
            </button>
          </div>
        </div>

        <div class="sd-divider"></div>

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
      max-width: 420px;

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
      display: flex;
      flex-direction: column;
      gap: 0;
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

  setTheme(dark: boolean): void {
    if (this.sheetTheme.darkMode() !== dark) {
      this.sheetTheme.toggle();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}




