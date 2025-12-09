import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'damages-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Bojové a přetrvávající zranění
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/bojova-zraneni.png" style="width: 1060px;" />
      <img src="rules/bojova-zraneni-tabulka.png" style="width: 1060px;" />
      <img src="rules/pretrvavajici-zraneni.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DamagesDialogComponent {
  dialogRef = inject(MatDialogRef<DamagesDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openDamagesDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(DamagesDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
