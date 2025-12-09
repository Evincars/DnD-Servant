import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'tools-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>Nosnost</div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/nosnost.png" style="width: 1060px;" />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button (click)="onClose()" matButton="tonal">Zavřít</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogActions, MatDialogContent, MatDialogTitle, MatButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarriageDialogComponent {
  dialogRef = inject(MatDialogRef<CarriageDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openCarriageDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(CarriageDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
