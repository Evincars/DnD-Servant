import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'weapons-and-armors-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>Tabulka zbraní a zbrojí</div>

    <mat-dialog-content class="dialog-content">
      <img src="rules/tabulka-zbrani-a-zbroji.png" style="width: 1060px;" />
      <img src="rules/tabulka-zbrani-a-zbroji-2.png" style="width: 1060px;" />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button (click)="onClose()" matButton="tonal">Zavřít</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogActions, MatDialogContent, MatDialogTitle, MatButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponsAndArmorsDialogComponent {
  dialogRef = inject(MatDialogRef<WeaponsAndArmorsDialogComponent>);

  onClose() {
    this.dialogRef.close();
  }
}

export function openWeaponsAndArmorsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(WeaponsAndArmorsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
