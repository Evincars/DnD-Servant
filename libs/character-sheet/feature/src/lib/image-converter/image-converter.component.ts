import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GIF from 'gif.js';

interface ConversionResult {
  dataUrl: string;
  blob: Blob;
  sizeKb: number;
  width: number;
  height: number;
  attempts: number;
}

const TARGET_BYTES = 200 * 1024; // 200 KB

/** Scale steps to try before giving up — from 100 % down to 15 % */
const SCALE_STEPS = [1.0, 0.78, 0.6, 0.45, 0.32, 0.22, 0.15];

@Component({
  selector: 'image-converter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      padding: 24px 32px 40px;
      box-sizing: border-box;
      font-family: 'Mikadan', sans-serif;
    }

    /* ── Header ─────────────────────────────────── */
    .ic-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 28px;
      padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(
          90deg,
          transparent,
          rgba(200, 160, 60, 0.6) 20%,
          rgba(240, 200, 80, 0.85) 50%,
          rgba(200, 160, 60, 0.6) 80%,
          transparent
        )
        1;
    }
    .ic-title {
      font-size: 22px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow:
        0 0 18px rgba(200, 160, 60, 0.4),
        0 0 4px rgba(200, 160, 60, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
      mat-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
        color: #c8a03c;
      }
    }
    .ic-subtitle {
      font-size: 11px;
      color: rgba(200, 160, 60, 0.35);
      letter-spacing: 0.05em;
      margin-top: 5px;
      font-family: sans-serif;
      font-style: italic;
      text-transform: none;
    }

    .ic-reset-btn {
      font-family: 'Mikadan', sans-serif;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      background: transparent;
      color: rgba(255, 255, 255, 0.3);
      padding: 6px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition:
        background 0.18s,
        border-color 0.18s,
        color 0.18s;
      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
      &:hover {
        background: rgba(180, 50, 40, 0.12);
        border-color: rgba(200, 80, 60, 0.35);
        color: rgba(220, 100, 80, 0.85);
      }
    }

    /* ── Drop zone ───────────────────────────────── */
    .ic-dropzone {
      border: 2px dashed rgba(200, 160, 60, 0.2);
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 36px 24px;
      cursor: pointer;
      transition:
        border-color 0.18s,
        background 0.18s;
      margin-bottom: 28px;
      min-height: 140px;
      text-align: center;

      &--over {
        border-color: rgba(200, 160, 60, 0.6);
        background: rgba(200, 160, 60, 0.06);
      }
      &:hover {
        border-color: rgba(200, 160, 60, 0.45);
        background: rgba(200, 160, 60, 0.04);
      }
    }
    .ic-dropzone__icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: rgba(200, 160, 60, 0.35);
    }
    .ic-dropzone__title {
      font-size: 13px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(200, 160, 60, 0.6);
    }
    .ic-dropzone__hint {
      font-family: sans-serif;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.2);
      font-style: italic;
    }
    .ic-dropzone__btn {
      margin-top: 6px;
      font-family: 'Mikadan', sans-serif;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1px solid rgba(200, 160, 60, 0.3);
      border-radius: 3px;
      background: rgba(200, 160, 60, 0.08);
      color: rgba(200, 160, 60, 0.7);
      padding: 6px 18px;
      cursor: pointer;
      transition:
        background 0.15s,
        color 0.15s;
      &:hover {
        background: rgba(200, 160, 60, 0.18);
        color: #e8c96a;
      }
    }

    /* ── Side-by-side comparison ─────────────────── */
    .ic-compare {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: start;
      margin-bottom: 24px;
    }
    .ic-compare__arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 40px;
      color: rgba(200, 160, 60, 0.4);
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    /* ── Preview card ────────────────────────────── */
    .ic-preview-card {
      background: linear-gradient(160deg, rgba(28, 22, 14, 0.97) 0%, rgba(18, 14, 8, 0.99) 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);
    }
    .ic-preview-card--result {
      border-color: rgba(200, 160, 60, 0.25);
    }
    .ic-preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px 7px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.1);
    }
    .ic-preview-label {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.3);
      flex: 1;
    }
    .ic-preview-size {
      font-family: sans-serif;
      font-size: 11px;
      font-weight: 700;
      &--ok {
        color: rgba(80, 200, 100, 0.85);
      }
      &--big {
        color: rgba(220, 100, 80, 0.85);
      }
    }
    .ic-preview-dim {
      font-family: sans-serif;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.2);
      margin-left: 6px;
    }
    .ic-preview-img {
      width: 100%;
      max-height: 340px;
      object-fit: contain;
      display: block;
      background: rgba(0, 0, 0, 0.15);
    }

    /* ── Spinner / progress ──────────────────────── */
    .ic-converting {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 40px 0;
      color: rgba(200, 160, 60, 0.6);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ic-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(200, 160, 60, 0.15);
      border-top-color: rgba(200, 160, 60, 0.8);
      border-radius: 50%;
      animation: ic-spin 0.7s linear infinite;
    }
    @keyframes ic-spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* ── Error ───────────────────────────────────── */
    .ic-error {
      background: rgba(180, 40, 30, 0.1);
      border: 1px solid rgba(180, 40, 30, 0.3);
      border-radius: 3px;
      padding: 12px 16px;
      font-family: sans-serif;
      font-size: 12px;
      color: rgba(220, 100, 80, 0.85);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 18px;
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
    }

    /* ── Action buttons ──────────────────────────── */
    .ic-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .ic-btn {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 3px;
      padding: 8px 20px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition:
        background 0.18s,
        border-color 0.18s,
        color 0.18s;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &--convert {
        background: rgba(200, 160, 60, 0.1);
        border: 1px solid rgba(200, 160, 60, 0.45);
        color: rgba(220, 185, 80, 0.85);
        &:hover {
          background: rgba(200, 160, 60, 0.22);
          border-color: rgba(220, 185, 80, 0.7);
          color: #f0d070;
        }
        &:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      }
      &--download {
        background: rgba(60, 160, 80, 0.1);
        border: 1px solid rgba(80, 180, 80, 0.35);
        color: rgba(100, 200, 100, 0.85);
        &:hover {
          background: rgba(60, 160, 80, 0.22);
          border-color: rgba(80, 200, 80, 0.6);
          color: #80e080;
        }
      }
    }

    /* ── Info box ────────────────────────────────── */
    .ic-info {
      margin-top: 28px;
      background: rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-left: 3px solid rgba(200, 160, 60, 0.3);
      border-radius: 2px;
      padding: 12px 16px;
      font-family: sans-serif;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.25);
      line-height: 1.6;
      letter-spacing: 0.02em;
      strong {
        color: rgba(200, 160, 60, 0.55);
        font-weight: 600;
      }
    }

    .ic-attempts-badge {
      font-family: sans-serif;
      font-size: 10px;
      color: rgba(200, 160, 60, 0.4);
      margin-left: auto;
      font-style: italic;
    }
  `,
  template: `
    <!-- ── Header ── -->
    <div class="ic-header">
      <div>
        <div class="ic-title">
          <mat-icon>auto_fix_high</mat-icon>
          Konvertor Obrázků
        </div>
        <div class="ic-subtitle">
          Převod PNG / JPG / JPEG → GIF · automatická redukce na max 200 KB pro nahrání jako portrét postavy
        </div>
      </div>
      @if (originalPreview()) {
        <button class="ic-reset-btn" type="button" (click)="reset()">
          <mat-icon>restart_alt</mat-icon>
          Nový obrázek
        </button>
      }
    </div>

    <!-- ── Drop zone (shown only before a file is picked) ── -->
    @if (!originalPreview()) {
      <div
        class="ic-dropzone"
        [class.ic-dropzone--over]="dragOver()"
        (click)="fileInputEl()!.nativeElement.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <mat-icon class="ic-dropzone__icon">add_photo_alternate</mat-icon>
        <span class="ic-dropzone__title">Přetáhni obrázek sem</span>
        <span class="ic-dropzone__hint">nebo klikni pro výběr ze souboru</span>
        <button class="ic-dropzone__btn" type="button">Vybrat soubor</button>
        <input #fileInputRef type="file" accept="image/*" style="display:none" (change)="onFileChange($event)" />
      </div>
    }

    <!-- ── Error ── -->
    @if (error()) {
      <div class="ic-error">
        <mat-icon>error_outline</mat-icon>
        {{ error() }}
      </div>
    }

    <!-- ── Converting spinner ── -->
    @if (converting()) {
      <div class="ic-converting">
        <div class="ic-spinner"></div>
        Konvertuji na GIF…
      </div>
    }

    <!-- ── Side-by-side comparison ── -->
    @if (originalPreview() && !converting()) {
      <div class="ic-compare">
        <!-- Original -->
        <div class="ic-preview-card">
          <div class="ic-preview-header">
            <span class="ic-preview-label">Originál</span>
            <span class="ic-preview-size" [class.ic-preview-size--big]="originalSizeKb() > 500">{{ originalSizeKb() }} KB</span>
            @if (originalDim()) {
              <span class="ic-preview-dim">{{ originalDim()!.w }}×{{ originalDim()!.h }}</span>
            }
          </div>
          <img [src]="originalPreview()!" alt="Originál" class="ic-preview-img" />
        </div>

        <!-- Arrow -->
        <div class="ic-compare__arrow">
          <mat-icon>arrow_forward</mat-icon>
        </div>

        <!-- Result -->
        <div class="ic-preview-card ic-preview-card--result">
          <div class="ic-preview-header">
            <span class="ic-preview-label">GIF výsledek</span>
            @if (result()) {
              <span
                class="ic-preview-size"
                [class.ic-preview-size--ok]="result()!.sizeKb <= 200"
                [class.ic-preview-size--big]="result()!.sizeKb > 200"
                matTooltip="{{
                  result()!.sizeKb <= 200 ? 'Vhodné pro nahrání (pod 200 KB)' : 'Přesahuje 200 KB — zkus jiný obrázek'
                }}"
              >
                {{ result()!.sizeKb }} KB {{ result()!.sizeKb <= 200 ? '✓' : '⚠' }}
              </span>
              <span class="ic-preview-dim">{{ result()!.width }}×{{ result()!.height }}</span>
              @if (result()!.attempts > 1) {
                <span class="ic-attempts-badge">{{ result()!.attempts }} pokusy</span>
              }
            } @else {
              <span class="ic-preview-size">—</span>
            }
          </div>
          @if (result()) {
            <img [src]="result()!.dataUrl" alt="GIF výsledek" class="ic-preview-img" />
          } @else {
            <div
              style="height:200px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.12); font-size:11px; letter-spacing:.08em;"
            >
              Klikni Převést
            </div>
          }
        </div>
      </div>

      <!-- ── Action buttons ── -->
      <div class="ic-actions">
        <button class="ic-btn ic-btn--convert" type="button" (click)="convert()" [disabled]="converting()">
          <mat-icon>autorenew</mat-icon>
          Převést na GIF
        </button>
        @if (result()) {
          <button class="ic-btn ic-btn--download" type="button" (click)="download()">
            <mat-icon>download</mat-icon>
            Stáhnout GIF ({{ result()!.sizeKb }} KB)
          </button>
        }
      </div>
    }

    <!-- ── Info note ── -->
    <div class="ic-info">
      <strong>Jak to funguje:</strong>
      Obrázek je převeden na formát GIF (max 256 barev) a automaticky zmenšen, dokud nepřekročí
      <strong>200 KB</strong>
      . Výsledný GIF pak můžeš přímo nahrát jako portrét postavy na stránce
      <strong>Karta postavy → strana 2</strong>
      . GIF funguje nejlépe pro ilustrace a kreslené portréty — fotografie mohou ztratit kvalitu.
    </div>
  `,
})
export class ImageConverterComponent {
  readonly fileInputEl = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');

  originalPreview = signal<string | null>(null);
  originalSizeKb = signal<number>(0);
  originalDim = signal<{ w: number; h: number } | null>(null);
  result = signal<ConversionResult | null>(null);
  converting = signal(false);
  error = signal<string | null>(null);
  dragOver = signal(false);

  private originalFile: File | null = null;

  // ── File input / drop ─────────────────────────────────────────────────────

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  private processFile(file: File): void {
    this.originalFile = file;
    this.originalSizeKb.set(Math.round(file.size / 1024));
    this.result.set(null);
    this.error.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.originalPreview.set(dataUrl);
      const img = new Image();
      img.onload = () => this.originalDim.set({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  // ── Conversion ────────────────────────────────────────────────────────────

  async convert(): Promise<void> {
    const preview = this.originalPreview();
    if (!preview || this.converting()) return;

    this.converting.set(true);
    this.error.set(null);
    this.result.set(null);

    try {
      const img = await this.loadImage(preview);
      let lastResult: ConversionResult | null = null;

      for (let i = 0; i < SCALE_STEPS.length; i++) {
        const scale = SCALE_STEPS[i];
        const w = Math.max(40, Math.round(img.naturalWidth * scale));
        const h = Math.max(40, Math.round(img.naturalHeight * scale));
        // Use lower quality (= looser color sampling) for later attempts to shave more bytes
        const quality = i < 2 ? 10 : i < 4 ? 15 : 20;

        const blob = await this.encodeGif(img, w, h, quality);
        lastResult = {
          dataUrl: URL.createObjectURL(blob),
          blob,
          sizeKb: Math.round(blob.size / 1024),
          width: w,
          height: h,
          attempts: i + 1,
        };

        if (blob.size <= TARGET_BYTES) break; // ✓ fits under 200 KB
      }

      this.result.set(lastResult);
    } catch (e) {
      console.error('[ImageConverter]', e);
      this.error.set('Konverze selhala. Ujisti se, že /gif.worker.js je dostupný, nebo zkus jiný obrázek.');
    } finally {
      this.converting.set(false);
    }
  }

  download(): void {
    const r = this.result();
    if (!r) return;
    const name = (this.originalFile?.name ?? 'image').replace(/\.[^.]+$/, '') + '.gif';
    const a = document.createElement('a');
    a.href = r.dataUrl;
    a.download = name;
    a.click();
  }

  reset(): void {
    this.originalFile = null;
    this.originalPreview.set(null);
    this.originalSizeKb.set(0);
    this.originalDim.set(null);
    this.result.set(null);
    this.error.set(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private encodeGif(img: HTMLImageElement, w: number, h: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      // White background — GIF doesn't support full alpha
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const gif = new GIF({
        workers: 1,
        quality, // 1 = best quality / largest file; higher = smaller / faster
        width: w,
        height: h,
        workerScript: '/gif.worker.js',
      });

      gif.addFrame(canvas, { copy: true });
      gif.on('finished', (blob: Blob) => resolve(blob));
      (gif as any).on('error', (err: unknown) => reject(err));
      gif.render();
    });
  }
}
