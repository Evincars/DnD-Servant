import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService } from '@dn-d-servant/util';
import { ItemVaultEntry } from '@dn-d-servant/character-sheet-util';
import { SpinnerOverlayComponent } from '@dn-d-servant/ui';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'player-items-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip, SpinnerOverlayComponent],
  styles: `
    :host {
      display: block;
      padding: 24px 32px;
      font-family: 'Mikadan', sans-serif;
    }

    /* ── Page header ─────────────────────────────────────── */
    .vault-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg,
        transparent, rgba(200,160,60,.6) 20%,
        rgba(240,200,80,.9) 50%,
        rgba(200,160,60,.6) 80%, transparent) 1;
    }

    .vault-title {
      font-size: 22px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 18px rgba(200,160,60,.4), 0 0 4px rgba(200,160,60,.2);
      display: flex;
      align-items: center;
      gap: 10px;

      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #c8a03c; }
    }

    .vault-subtitle {
      font-size: 11px;
      color: rgba(200,160,60,.4);
      letter-spacing: .06em;
      margin-top: 5px;
      font-family: sans-serif;
      font-style: italic;
      text-transform: none;
    }

    .vault-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    /* ── Add / Save buttons ──────────────────────────────── */
    .btn-dnd {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .1em;
      text-transform: uppercase;
      border: 1px solid rgba(200,160,60,.35);
      border-radius: 3px;
      background: rgba(200,160,60,.08);
      color: rgba(200,160,60,.8);
      padding: 6px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background .18s, border-color .18s, color .18s;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }

      &:hover {
        background: rgba(200,160,60,.16);
        border-color: rgba(200,160,60,.6);
        color: #e8c96a;
      }
    }

    .btn-dnd-save {
      border-color: rgba(80,160,80,.35);
      color: rgba(100,200,100,.8);
      background: rgba(60,120,60,.08);

      &:hover {
        background: rgba(60,140,60,.18);
        border-color: rgba(80,180,80,.6);
        color: #80e080;
      }
    }

    /* ── Item grid ───────────────────────────────────────── */
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #3a3228;
      font-size: 14px;
      letter-spacing: .1em;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        display: block;
        margin: 0 auto 16px;
        color: rgba(200,160,60,.2);
      }
    }

    /* ── Single item card ────────────────────────────────── */
    .item-card {
      position: relative;
      border-radius: 3px;
      background:
        linear-gradient(160deg,
          rgba(42,32,14,.97) 0%,
          rgba(28,20,8,.99) 100%);
      border: 1px solid rgba(200,160,60,.18);
      box-shadow:
        0 4px 20px rgba(0,0,0,.6),
        inset 0 1px 0 rgba(255,220,100,.05);
      overflow: hidden;
      transition: border-color .2s, box-shadow .2s;

      /* corner ornament top-left */
      &::before {
        content: '◆';
        position: absolute;
        top: 5px; left: 6px;
        font-size: 7px;
        color: rgba(200,160,60,.35);
        pointer-events: none;
      }
      /* corner ornament bottom-right */
      &::after {
        content: '◆';
        position: absolute;
        bottom: 5px; right: 6px;
        font-size: 7px;
        color: rgba(200,160,60,.35);
        pointer-events: none;
      }

      &:hover {
        border-color: rgba(200,160,60,.38);
        box-shadow:
          0 6px 28px rgba(0,0,0,.7),
          0 0 12px rgba(200,160,60,.08),
          inset 0 1px 0 rgba(255,220,100,.07);
      }
    }

    /* card top gold rule */
    .item-card-rule {
      height: 2px;
      background: linear-gradient(90deg,
        rgba(200,160,60,.0) 0%,
        rgba(200,160,60,.5) 30%,
        rgba(240,200,80,.8) 50%,
        rgba(200,160,60,.5) 70%,
        rgba(200,160,60,.0) 100%);
    }

    /* ── Image area ──────────────────────────────────────── */
    .item-image-wrap {
      position: relative;
      height: 160px;
      background:
        repeating-linear-gradient(
          45deg,
          rgba(200,160,60,.02) 0px,
          rgba(200,160,60,.02) 1px,
          transparent 1px,
          transparent 8px
        ),
        rgba(14,10,4,.6);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
      transition: background .18s, box-shadow .18s;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .image-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: rgba(200,160,60,.25);
        font-size: 10px;
        letter-spacing: .12em;
        text-transform: uppercase;
        pointer-events: none;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }

      .image-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.55);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity .18s;
        pointer-events: none;

        mat-icon { color: #e8c96a; font-size: 28px; width: 28px; height: 28px; }
      }

      &:hover .image-overlay { opacity: 1; }

      /* drag-over state */
      &.drag-over {
        background:
          repeating-linear-gradient(
            45deg,
            rgba(200,160,60,.06) 0px,
            rgba(200,160,60,.06) 1px,
            transparent 1px,
            transparent 8px
          ),
          rgba(30,22,8,.85);
        box-shadow: inset 0 0 0 2px rgba(200,160,60,.6);

        .image-overlay {
          opacity: 1;
          background: rgba(200,160,60,.12);
        }
      }
    }

    .image-file-input { display: none; }

    /* ── Card body ───────────────────────────────────────── */
    .item-body {
      padding: 14px 16px 16px;
    }

    .item-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .item-name-input {
      flex: 1;
      background: rgba(0,0,0,.25);
      border: none;
      border-bottom: 1px solid rgba(200,160,60,.25);
      color: #e8c96a;
      font-family: 'Mikadan', sans-serif;
      font-size: 14px;
      letter-spacing: .08em;
      padding: 4px 2px;
      outline: none;
      transition: border-color .18s;

      &::placeholder { color: rgba(200,160,60,.25); }
      &:focus { border-bottom-color: rgba(200,160,60,.65); }
    }

    .item-delete-btn {
      color: rgba(180,60,60,.5) !important;
      transition: color .18s !important;
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;
      line-height: 1 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;

      .mat-icon, mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
        line-height: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      &:hover { color: #e05555 !important; }
    }

    .item-desc-textarea {
      width: 100%;
      box-sizing: border-box;
      background: rgba(0,0,0,.2);
      border: 1px solid rgba(200,160,60,.12);
      border-radius: 2px;
      color: #c8b896;
      font-family: sans-serif;
      font-size: 12px;
      line-height: 1.55;
      padding: 8px 10px;
      resize: vertical;
      outline: none;
      min-height: 72px;
      transition: border-color .18s;

      &::placeholder { color: rgba(200,160,60,.2); font-style: italic; }
      &:focus { border-color: rgba(200,160,60,.35); }
    }

    /* ── View full image button ──────────────────────────── */
    .item-image-view-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 2;
      width: 26px !important;
      height: 26px !important;
      padding: 0 !important;
      line-height: 1 !important;
      background: rgba(0,0,0,.55) !important;
      color: rgba(200,160,60,.8) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 3px !important;
      transition: background .18s, color .18s !important;

      .mat-icon, mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
        line-height: 15px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      &:hover { background: rgba(0,0,0,.8) !important; color: #e8c96a !important; }
    }

    /* ── Confirm delete dialog ───────────────────────────── */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,.75);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeInBackdrop .14s ease;
    }

    .confirm-dialog {
      position: relative;
      background:
        linear-gradient(160deg,
          rgba(50,34,12,.99) 0%,
          rgba(30,20,7,1)  100%);
      border: 1px solid rgba(200,160,60,.35);
      border-top: 2px solid rgba(200,160,60,.7);
      box-shadow:
        0 12px 50px rgba(0,0,0,.9),
        inset 0 1px 0 rgba(255,220,80,.07);
      border-radius: 3px;
      padding: 28px 32px 24px;
      min-width: 320px;
      max-width: 420px;
      animation: scaleInImg .14s ease;
      cursor: default;

      /* corner ornaments */
      &::before {
        content: '◆';
        position: absolute;
        top: 7px; left: 9px;
        font-size: 7px;
        color: rgba(200,160,60,.4);
        pointer-events: none;
      }
      &::after {
        content: '◆';
        position: absolute;
        bottom: 7px; right: 9px;
        font-size: 7px;
        color: rgba(200,160,60,.4);
        pointer-events: none;
      }
    }

    .confirm-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 14px;

      mat-icon {
        font-size: 38px;
        width: 38px;
        height: 38px;
        color: rgba(200,80,60,.7);
        filter: drop-shadow(0 0 10px rgba(200,60,40,.35));
      }
    }

    .confirm-title {
      font-family: 'Mikadan', sans-serif;
      font-size: 15px;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #e8c96a;
      text-align: center;
      margin-bottom: 10px;
    }

    .confirm-message {
      font-size: 12px;
      color: #a09070;
      text-align: center;
      line-height: 1.6;
      margin-bottom: 24px;

      strong {
        color: #d4a84b;
        font-style: italic;
      }
    }

    .confirm-rule {
      height: 1px;
      background: linear-gradient(90deg,
        transparent, rgba(200,160,60,.3) 50%, transparent);
      margin-bottom: 20px;
    }

    .confirm-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .confirm-btn {
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .1em;
      text-transform: uppercase;
      border-radius: 3px;
      padding: 7px 22px;
      cursor: pointer;
      transition: background .18s, border-color .18s, color .18s;
    }

    .confirm-btn-cancel {
      background: rgba(200,160,60,.06);
      border: 1px solid rgba(200,160,60,.25);
      color: rgba(200,160,60,.65);

      &:hover {
        background: rgba(200,160,60,.14);
        border-color: rgba(200,160,60,.5);
        color: #e8c96a;
      }
    }

    .confirm-btn-delete {
      background: rgba(160,40,30,.25);
      border: 1px solid rgba(200,60,50,.4);
      color: rgba(220,100,80,.85);

      &:hover {
        background: rgba(180,40,30,.45);
        border-color: rgba(220,80,60,.7);
        color: #ff9980;
      }
    }

    /* ── Full-scale image dialog backdrop ───────────────── */
    .img-preview-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,.88);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
      animation: fadeInBackdrop .18s ease;
    }

    @keyframes fadeInBackdrop {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .img-preview-container {
      position: relative;
      max-width: 90vw;
      max-height: 88vh;
      cursor: default;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: scaleInImg .18s ease;
    }

    @keyframes scaleInImg {
      from { transform: scale(.92); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }

    .img-preview-title {
      font-family: 'Mikadan', sans-serif;
      font-size: 13px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
      margin-bottom: 12px;
    }

    .img-preview-frame {
      border: 1px solid rgba(200,160,60,.35);
      box-shadow:
        0 0 0 1px rgba(0,0,0,.8),
        0 8px 40px rgba(0,0,0,.9),
        0 0 60px rgba(200,160,60,.08);
      background: rgba(14,10,4,.95);
      padding: 6px;

      img {
        display: block;
        max-width: 88vw;
        max-height: 78vh;
        object-fit: contain;
      }
    }

    .img-preview-close {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 30px !important;
      height: 30px !important;
      padding: 0 !important;
      line-height: 1 !important;
      background: rgba(40,28,10,.98) !important;
      border: 1px solid rgba(200,160,60,.4) !important;
      color: #c8a03c !important;
      border-radius: 3px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;

      .mat-icon, mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
        line-height: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      &:hover { background: rgba(200,160,60,.15) !important; color: #e8c96a !important; }
    }

    .img-preview-hint {
      margin-top: 10px;
      font-size: 10px;
      color: rgba(200,160,60,.3);
      letter-spacing: .1em;
    }

    /* ── Force MDC icon-button internals to center ───────── */
    ::ng-deep .item-image-view-btn,
    ::ng-deep .img-preview-close,
    ::ng-deep .item-delete-btn {
      .mat-mdc-button-persistent-ripple,
      .mat-mdc-button-touch-target,
      .mdc-icon-button__ripple {
        display: none !important;
      }

      .mat-icon {
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    }
  `,
  template: `
    <spinner-overlay [showSpinner]="store.loading()" [diameter]="50">
      <div class="vault-header">
        <div>
          <div class="vault-title">
            <mat-icon>auto_awesome</mat-icon>
            Moje předměty
          </div>
          <div class="vault-subtitle">
            Zde si můžeš uložit obrázky a popisky tvojich magických/vzácných nebo i běžných předmětů až je máš pořád po ruce
          </div>
        </div>
        <div class="vault-actions">
          <button class="btn-dnd" (click)="addItem()" matTooltip="Přidat předmět">
            <mat-icon>add</mat-icon>
            Přidat předmět
          </button>
          <button class="btn-dnd btn-dnd-save" (click)="save()" matTooltip="Uložit do databáze">
            <mat-icon>save</mat-icon>
            Uložit
          </button>
        </div>
      </div>

      <div class="items-grid">
        @if (items().length === 0) {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          Trezor je prázdný. Přidej svůj první předmět.
        </div>
        } @for (item of items(); track item.id; let i = $index) {
        <div class="item-card">
          <div class="item-card-rule"></div>

          <!-- Image drop zone -->
          <div
            class="item-image-wrap"
            [class.drag-over]="dragOverIndex() === i"
            (click)="triggerFileInput(i)"
            (dragover)="onDragOver($event, i)"
            (dragleave)="onDragLeave()"
            (drop)="onDrop($event, i)"
            matTooltip="Klikni nebo přetáhni obrázek"
          >
            @if (item.imageBase64) {
            <img [src]="'data:image/png;base64,' + item.imageBase64" [alt]="item.name" />
            } @else {
            <div class="image-placeholder">
              <mat-icon>upload_file</mat-icon>
              Klikni nebo přetáhni
            </div>
            }
            <div class="image-overlay">
              <mat-icon>upload</mat-icon>
            </div>

            @if (item.imageBase64) {
            <button
              mat-icon-button
              class="item-image-view-btn"
              (click)="openPreview($event, item)"
              matTooltip="Zobrazit v plné velikosti"
            >
              <mat-icon>open_in_full</mat-icon>
            </button>
            }
          </div>

          <input type="file" accept="image/*" class="image-file-input" (change)="onImageSelected($event, i)" #fileInputRef />

          <div class="item-body">
            <div class="item-name-row">
              <input
                class="item-name-input"
                [(ngModel)]="items()[i].name"
                placeholder="Název předmětu"
                [attr.aria-label]="'Název předmětu ' + (i + 1)"
              />
              <button mat-icon-button class="item-delete-btn" (click)="askDelete(i)" matTooltip="Smazat předmět">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
            <textarea
              class="item-desc-textarea"
              [(ngModel)]="items()[i].description"
              placeholder="Popis, vlastnosti, bonusy, příběh předmětu..."
              rows="3"
            ></textarea>
          </div>
        </div>
        }
      </div>
    </spinner-overlay>

    <!-- ── Confirm delete dialog ─────────────────────────── -->
    @if (confirmDeleteIndex() !== null) {
    <div class="confirm-backdrop" (click)="cancelDelete()">
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
        <div class="confirm-icon"><mat-icon>delete_forever</mat-icon></div>
        <div class="confirm-title">Smazat předmět?</div>
        <div class="confirm-message">
          Opravdu chceš smazat předmět @if (items()[confirmDeleteIndex()!]?.name) {
          <strong>„{{ items()[confirmDeleteIndex()!].name }}"</strong>
          } @else {
          <strong>bez názvu</strong>
          }? Tato akce je nevratná.
        </div>
        <div class="confirm-rule"></div>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn-cancel" (click)="cancelDelete()">Zrušit</button>
          <button class="confirm-btn confirm-btn-delete" (click)="confirmDelete()">Smazat</button>
        </div>
      </div>
    </div>
    }

    <!-- ── Full-scale image preview overlay ──────────────── -->
    @if (previewItem()) {
    <div class="img-preview-backdrop" (click)="closePreview()">
      <div class="img-preview-container" (click)="$event.stopPropagation()">
        <button mat-icon-button class="img-preview-close" (click)="closePreview()" matTooltip="Zavřít">
          <mat-icon>close</mat-icon>
        </button>
        @if (previewItem()!.name) {
        <div class="img-preview-title">{{ previewItem()!.name }}</div>
        }
        <div class="img-preview-frame">
          <img [src]="'data:image/png;base64,' + previewItem()!.imageBase64" [alt]="previewItem()!.name" />
        </div>
        <div class="img-preview-hint">Klikni mimo obrázek nebo stiskni Esc pro zavření</div>
      </div>
    </div>
    }
  `,
})
export class PlayerItemsCardsComponent {
  readonly store = inject(CharacterSheetStore);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  items = signal<ItemVaultEntry[]>([]);
  dragOverIndex = signal<number | null>(null);
  previewItem = signal<ItemVaultEntry | null>(null);
  confirmDeleteIndex = signal<number | null>(null);

  private readonly fileInputRefs = viewChildren<ElementRef<HTMLInputElement>>('fileInputRef');

  constructor() {
    effect(() => {
      const vault = this.store.itemVault();
      untracked(() => {
        if (vault?.items) {
          this.items.set(vault.items.map(i => ({ ...i })));
        }
      });
    });

    effect(() => {
      const username = this.authService.currentUser()?.username;
      untracked(() => {
        if (username) {
          this.store.getItemVault(username);
        }
      });
    });
  }

  triggerFileInput(index: number): void {
    const inputs = this.fileInputRefs();
    inputs[index]?.nativeElement.click();
  }

  addItem(): void {
    this.items.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        imageBase64: null,
      },
    ]);
  }

  askDelete(index: number): void {
    this.confirmDeleteIndex.set(index);
  }

  cancelDelete(): void {
    this.confirmDeleteIndex.set(null);
  }

  confirmDelete(): void {
    const idx = this.confirmDeleteIndex();
    if (idx === null) return;
    this.items.update(list => list.filter((_, i) => i !== idx));
    this.confirmDeleteIndex.set(null);
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.dragOverIndex.set(index);
  }

  onDragLeave(): void {
    this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverIndex.set(null);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file, index);
  }

  onImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.processFile(file, index);
    input.value = '';
  }

  private processFile(file: File, index: number): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Soubor není obrázek.', 'Zavřít', { verticalPosition: 'top', duration: 3000 });
      return;
    }
    const maxBytes = 200 * 1024;
    if (file.size > maxBytes) {
      this.snackBar.open(`Obrázek je příliš velký (${(file.size / 1024).toFixed(0)} KB). Maximum je 200 KB.`, 'Zavřít', {
        verticalPosition: 'top',
        duration: 5000,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.items.update(list => {
        const copy = list.map(i => ({ ...i }));
        copy[index] = { ...copy[index], imageBase64: base64 };
        return copy;
      });
    };
    reader.readAsDataURL(file);
  }

  openPreview(event: MouseEvent, item: ItemVaultEntry): void {
    event.stopPropagation();
    this.previewItem.set(item);
  }

  closePreview(): void {
    this.previewItem.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.previewItem()) {
      this.closePreview();
      return;
    }
    if (this.confirmDeleteIndex() !== null) this.cancelDelete();
  }

  save(): void {
    const username = this.authService.currentUser()?.username;
    if (!username) return;
    this.store.saveItemVault({ username, items: this.items() });
  }
}
