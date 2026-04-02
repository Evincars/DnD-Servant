import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Observable } from 'rxjs';
import { ConditionsTrackerComponent } from '../conditions/conditions-tracker.component';

@Component({
  selector: 'conditions-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConditionsTrackerComponent, MatIcon, MatIconButton, MatDialogContent, MatDialogTitle],
  styles: `
    ::ng-deep conditions-tracker {
      height: auto !important;
    }
    .dialog-title-spacer {
      width: 34px;
      flex-shrink: 0;
    }
    .dialog-title-text {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  `,
  template: `
    <div class="dialog-title" mat-dialog-title>
      <span class="dialog-title-spacer"></span>
      <span class="dialog-title-text">
        <mat-icon style="font-size:20px;width:20px;height:20px;color:#a060c0;flex-shrink:0">health_and_safety</mat-icon>
        Stavy &amp; Podmínky
      </span>
      <button (click)="close()" matIconButton>
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content style="padding: 0 !important; overflow-y: auto;">
      <conditions-tracker />
    </mat-dialog-content>
  `,
})
export class ConditionsDialogComponent {
  private readonly ref = inject(MatDialogRef<ConditionsDialogComponent>);

  close(): void {
    this.ref.close();
  }
}

export function openConditionsDialog(dialog: MatDialog): Observable<unknown> {
  return dialog.open(ConditionsDialogComponent, {
    width: '860px',
    maxWidth: '96vw',
    maxHeight: '88vh',
  }).afterClosed();
}

