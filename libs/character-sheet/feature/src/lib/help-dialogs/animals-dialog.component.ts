import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'animals-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zvířata a jejich nosnost
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/kun-nosnost.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalsDialogComponent {
  dialogRef = inject(MatDialogRef<AnimalsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openAnimalsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(AnimalsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
