import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'background-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zázemí postavy
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/zazemi-1.png" style="width: 1060px;" />
      <img src="rules/zazemi-2.png" style="width: 1060px;" />
      <img src="rules/zazemi-3.png" style="width: 1060px;" />
      <img src="rules/zazemi-4.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundDialogComponent {
  dialogRef = inject(MatDialogRef<BackgroundDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openBackgroundDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(BackgroundDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
