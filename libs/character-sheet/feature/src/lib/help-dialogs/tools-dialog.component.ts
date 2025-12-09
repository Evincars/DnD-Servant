import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'tools-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Pomůcky
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/pomucky-1.png" style="width: 1060px;" />
      <img src="rules/pomucky-2.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsDialogComponent {
  dialogRef = inject(MatDialogRef<ToolsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openToolsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ToolsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
