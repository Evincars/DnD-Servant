import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService } from '@dn-d-servant/util';
import { ItemVaultApiModel, ItemVaultEntry } from '@dn-d-servant/character-sheet-util';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'item-vault',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon, MatIconButton, MatTooltip],
  styles: `
    :host {
      display: block;
      padding: 24px 32px;
      min-height: 100%;
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

        mat-icon { color: #e8c96a; font-size: 28px; width: 28px; height: 28px; }
      }

      &:hover .image-overlay { opacity: 1; }
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
      line-height: 28px !important;

      mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
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

    /* ── Image size warning ──────────────────────────────── */
    .size-warning {
      font-size: 10px;
      color: rgba(220,100,80,.7);
      margin-top: 4px;
      letter-spacing: .04em;
    }
  `,
  template: `
    <div class="vault-header">
      <div class="vault-title">
        <mat-icon>auto_awesome</mat-icon>
        Trezor předmětů
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

        <!-- Image -->
        <div
          class="item-image-wrap"
          (click)="fileInputs[i]?.click()"
          [matTooltip]="item.imageBase64 ? 'Klikni pro změnu obrázku' : 'Klikni pro nahrání obrázku'"
        >
          @if (item.imageBase64) {
          <img [src]="'data:image/png;base64,' + item.imageBase64" [alt]="item.name" />
          } @else {
          <div class="image-placeholder">
            <mat-icon>image</mat-icon>
            Nahrát obrázek
          </div>
          }
          <div class="image-overlay"><mat-icon>upload</mat-icon></div>
        </div>
        <input
          type="file"
          accept="image/*"
          class="image-file-input"
          [attr.data-index]="i"
          (change)="onImageSelected($event, i)"
          #fileInputRef
        />

        <div class="item-body">
          <div class="item-name-row">
            <input
              class="item-name-input"
              [(ngModel)]="items()[i].name"
              placeholder="Název předmětu"
              [attr.aria-label]="'Název předmětu ' + (i + 1)"
            />
            <button mat-icon-button class="item-delete-btn" (click)="removeItem(i)" matTooltip="Smazat předmět">
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
  `,
})
export class ItemVaultComponent {
  private readonly store = inject(CharacterSheetStore);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  items = signal<ItemVaultEntry[]>([]);

  /** Native file inputs — one per item card, tracked by index */
  fileInputs: HTMLInputElement[] = [];

  constructor() {
    // Load from store when vault data arrives
    effect(() => {
      const vault = this.store.itemVault();
      untracked(() => {
        if (vault?.items) {
          this.items.set(vault.items.map(i => ({ ...i })));
        }
      });
    });

    // Trigger load when user is known
    effect(() => {
      const username = this.authService.currentUser()?.username;
      untracked(() => {
        if (username) {
          this.store.getItemVault(username);
        }
      });
    });
  }

  addItem(): void {
    const newItem: ItemVaultEntry = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      imageBase64: null,
    };
    this.items.update(list => [...list, newItem]);
  }

  removeItem(index: number): void {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  onImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = 200 * 1024; // 200 KB
    if (file.size > maxBytes) {
      this.snackBar.open(`Obrázek je příliš velký (${(file.size / 1024).toFixed(0)} KB). Maximum je 200 KB.`, 'Zavřít', {
        verticalPosition: 'top',
        duration: 5000,
      });
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      this.items.update(list => {
        const copy = list.map(i => ({ ...i }));
        copy[index] = { ...copy[index], imageBase64: base64 };
        return copy;
      });
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    const username = this.authService.currentUser()?.username;
    if (!username) return;

    const vault: ItemVaultApiModel = {
      username,
      items: this.items(),
    };
    this.store.saveItemVault(vault);
  }
}
