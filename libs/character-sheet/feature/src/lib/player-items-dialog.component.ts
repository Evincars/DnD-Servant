import { ChangeDetectionStrategy, Component, inject, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { PlayerItemsCardsComponent } from './players-items-cards/player-items-cards.component';

// ─── Dialog Component ────────────────────────────────────────────────────────

@Component({
  selector: 'player-items-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, PlayerItemsCardsComponent],
  styles: `
    :host { display: block; }

    .pic-dlg {
      display: flex;
      flex-direction: column;
      height: 88vh;
      max-height: 960px;
      background: #0a0805;
      overflow: hidden;
    }

    .pic-dlg-close-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 14px 0;
      flex-shrink: 0;
      background: linear-gradient(180deg, rgba(20,14,4,.95) 0%, rgba(10,8,4,.95) 100%);
      border-bottom: 1px solid rgba(200,160,60,.15);
    }

    .pic-dlg-close {
      background: none;
      border: 1px solid rgba(200,160,60,.25);
      border-radius: 4px;
      color: rgba(200,160,60,.6);
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      transition: all .18s;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .pic-dlg-close:hover {
      border-color: rgba(200,160,60,.7);
      color: #e8c96a;
      background: rgba(200,160,60,.1);
    }

    .pic-dlg-body {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,160,60,.4) rgba(10,8,20,.6);
    }
  `,
  template: `
    <div class="pic-dlg">
      <div class="pic-dlg-close-row">
        <button class="pic-dlg-close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="pic-dlg-body">
        <player-items-cards />
      </div>
    </div>
  `,
})
export class PlayerItemsDialogComponent {
  private readonly ref = inject(MatDialogRef<PlayerItemsDialogComponent>);

  close(): void {
    this.ref.close();
  }
}

// ─── Open Helper ─────────────────────────────────────────────────────────────

/**
 * Opens the "Moje předměty" dialog.
 * Pass the caller's `ViewContainerRef` so the dialog inherits the
 * component-scoped `CharacterSheetStore` from the tab shell.
 */
export function openPlayerItemsDialog(
  dialog: MatDialog,
  vcr: ViewContainerRef,
): Observable<void> {
  return dialog
    .open(PlayerItemsDialogComponent, {
      viewContainerRef: vcr,
      width: '92vw',
      maxWidth: '1240px',
      maxHeight: '92vh',
      panelClass: 'dnd-dialog',
    })
    .afterClosed();
}

