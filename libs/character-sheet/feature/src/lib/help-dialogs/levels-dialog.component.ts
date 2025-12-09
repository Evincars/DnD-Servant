import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'levels-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Úroveň postavy
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/nova-uroven.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelsDialogComponent {
  dialogRef = inject(MatDialogRef<LevelsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openLevelsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(LevelsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
