import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'maneuvers-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Manévry (Akce)
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/manevry-0.png" style="width: 1060px;" />
      <img src="rules/manevry-1.png" style="width: 1060px;" />
      <img src="rules/manevry-2.png" style="width: 1060px;" />
      <img src="rules/manevry-3.png" style="width: 1060px;" />
      <img src="rules/manevry-4.png" style="width: 1060px;" />
      <img src="rules/manevry-5.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManeuversDialogComponent {
  dialogRef = inject(MatDialogRef<ManeuversDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openManeuversDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ManeuversDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
