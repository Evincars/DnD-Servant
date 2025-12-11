import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'conviction-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zbraně
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/zbrane-1.png" style="width: 1060px;" />
      <img src="rules/zbrane-2.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponsDialogComponent {
  dialogRef = inject(MatDialogRef<WeaponsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openWeaponsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(WeaponsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
