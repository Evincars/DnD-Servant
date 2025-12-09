import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'expertise-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Odbornosti
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/odbornost-1.png" style="width: 1060px;" />
      <img src="rules/odbornost-2.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertiseDialogComponent {
  dialogRef = inject(MatDialogRef<ExpertiseDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openExpertiseDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ExpertiseDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
