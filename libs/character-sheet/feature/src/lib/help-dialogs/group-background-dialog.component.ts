import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'group-background-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Skupinové zázemí
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/skupinove-zazemi-1.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-2.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-3.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-4.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-5.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-6.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-7.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-8.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-9.png" style="width: 1060px;" />
      <img src="rules/skupinove-zazemi-10.png" style="width: 1060px;" />
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupBackgroundDialogComponent {
  dialogRef = inject(MatDialogRef<GroupBackgroundDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openGroupBackgroundDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(GroupBackgroundDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
