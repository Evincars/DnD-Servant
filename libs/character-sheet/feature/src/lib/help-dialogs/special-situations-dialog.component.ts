import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'special-situations-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Speciální situace
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/specialni-situace.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialSituationsDialogComponent {
  dialogRef = inject(MatDialogRef<SpecialSituationsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openSpecialSituationsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(SpecialSituationsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
