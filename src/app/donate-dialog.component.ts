import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-donate-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  template: `
    <div class="dn-panel">
      <!-- Header -->
      <div class="dn-header">
        <mat-icon class="dn-header-icon">coffee</mat-icon>
        <span class="dn-title">Kup mi kafe</span>
        <button type="button" class="dn-close-btn" (click)="close()" aria-label="Zavřít">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="dn-body">
        <p class="dn-subtitle">Jsem vděčný za každou korunu ☕</p>
        <div class="dn-qr-wrap">
          <img src="QR-donate.jpg" alt="QR kód pro darování" class="dn-qr" />
        </div>
        <p class="dn-hint">Naskenuj QR kód nebo přispěj libovolnou částkou.</p>
      </div>

      <!-- Footer -->
      <div class="dn-footer">
        <span class="dn-footer-text">Děkuji za podporu!</span>
      </div>
    </div>
  `,
  styles: `
    /* ── Panel ─────────────────────────────────────────────── */
    .dn-panel {
      background: linear-gradient(180deg, rgba(8,5,18,.99) 0%, rgba(14,10,24,.99) 100%);
      border: 1px solid rgba(200,160,60,.4);
      border-radius: 10px;
      overflow: hidden;
      width: min(380px, 96vw);
      display: flex;
      flex-direction: column;
      position: relative;

      &::before {
        content: '◆';
        position: absolute;
        top: -7px; left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        color: rgba(200,160,60,.6);
        background: rgba(8,5,18,1);
        padding: 0 6px;
        pointer-events: none;
        z-index: 2;
      }
    }

    /* ── Header ────────────────────────────────────────────── */
    .dn-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px 12px;
      border-bottom: 1px solid rgba(200,160,60,.18);
      background: rgba(200,160,60,.04);
      flex-shrink: 0;
    }

    .dn-header-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(200,160,60,.85);
      flex-shrink: 0;
    }

    .dn-title {
      flex: 1;
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: .08em;
      color: #e8c96a;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
    }

    .dn-close-btn {
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
    .dn-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
    }

    .dn-subtitle {
      margin: 0;
      font-family: sans-serif;
      font-size: 14px;
      color: rgba(220, 195, 140, .9);
      letter-spacing: .04em;
      text-align: center;
    }

    .dn-qr-wrap {
      border: 2px solid rgba(200,160,60,.4);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0 28px rgba(200,160,60,.18), 0 4px 16px rgba(0,0,0,.6);
      background: #fff;
      padding: 8px;
    }

    .dn-qr {
      display: block;
      width: 220px;
      height: 220px;
      object-fit: contain;
    }

    .dn-hint {
      margin: 0;
      font-family: sans-serif;
      font-size: 11px;
      color: rgba(200,160,60,.45);
      text-align: center;
      letter-spacing: .03em;
      line-height: 1.5;
    }

    /* ── Footer ────────────────────────────────────────────── */
    .dn-footer {
      flex-shrink: 0;
      padding: 10px 16px;
      border-top: 1px solid rgba(200,160,60,.12);
      background: rgba(200,160,60,.02);
      display: flex;
      justify-content: center;
    }

    .dn-footer-text {
      font-family: 'Mikadan', sans-serif;
      font-size: 12px;
      color: rgba(200,160,60,.5);
      letter-spacing: .08em;
    }
  `,
})
export class DonateDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DonateDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}

