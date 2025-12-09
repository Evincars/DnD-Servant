import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'spells-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Seznam kouzel
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/kouzla-1.png" style="width: 1060px;" />
      <img src="rules/kouzla-2.png" style="width: 1060px;" />
      <img src="rules/kouzla-3.png" style="width: 1060px;" />
      <img src="rules/kouzla-4.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellsDialogComponent {
  dialogRef = inject(MatDialogRef<SpellsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openSpellsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(SpellsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
