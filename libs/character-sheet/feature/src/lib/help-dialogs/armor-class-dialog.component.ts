import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'armor-class-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zbroje a obranné číslo
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/armor-class-1.png" style="width: 600px;" />
      <img src="rules/armor-class-2.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmorClassDialogComponent {
  dialogRef = inject(MatDialogRef<ArmorClassDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openArmorClassDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ArmorClassDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
