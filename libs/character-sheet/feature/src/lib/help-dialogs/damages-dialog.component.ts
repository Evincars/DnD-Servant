import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'weapons-and-armors-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>Bojové a přetrvávající zranění</div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/bojova-zraneni.png" style="width: 1060px;" />
      <img src="rules/bojova-zraneni-tabulka.png" style="width: 1060px;" />
      <img src="rules/pretrvavajici-zraneni.png" style="width: 1060px;" />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button (click)="onClose()" matButton="tonal">Zavřít</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogActions, MatDialogContent, MatDialogTitle, MatButton],
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
