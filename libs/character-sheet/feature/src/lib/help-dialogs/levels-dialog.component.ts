import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'levels-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Úroveň postavy
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/nova-uroven.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Postup na novou úroveň</h3>
          <table class="hd-table">
            <thead><tr><th>Úroveň</th><th>Zkušenosti (XP)</th><th>Zdatnostní bonus</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>0</td><td>+2</td></tr>
              <tr><td>2</td><td>300</td><td>+2</td></tr>
              <tr><td>3</td><td>900</td><td>+2</td></tr>
              <tr><td>4</td><td>2 700</td><td>+2</td></tr>
              <tr><td>5</td><td>6 500</td><td>+3</td></tr>
              <tr><td>6</td><td>14 000</td><td>+3</td></tr>
              <tr><td>7</td><td>23 000</td><td>+3</td></tr>
              <tr><td>8</td><td>34 000</td><td>+3</td></tr>
              <tr><td>9</td><td>48 000</td><td>+4</td></tr>
              <tr><td>10</td><td>64 000</td><td>+4</td></tr>
              <tr><td>11</td><td>85 000</td><td>+4</td></tr>
              <tr><td>12</td><td>100 000</td><td>+4</td></tr>
              <tr><td>13</td><td>120 000</td><td>+5</td></tr>
              <tr><td>14</td><td>140 000</td><td>+5</td></tr>
              <tr><td>15</td><td>165 000</td><td>+5</td></tr>
              <tr><td>16</td><td>195 000</td><td>+5</td></tr>
              <tr><td>17</td><td>225 000</td><td>+6</td></tr>
              <tr><td>18</td><td>265 000</td><td>+6</td></tr>
              <tr><td>19</td><td>305 000</td><td>+6</td></tr>
              <tr><td>20</td><td>355 000</td><td>+6</td></tr>
            </tbody>
          </table>
          <h4>Při postupu na novou úroveň</h4>
          <ul>
            <li>Zvýšení Kostek životů (hoď nebo použij průměr + oprava Odolnosti)</li>
            <li>Nové schopnosti povolání</li>
            <li>Na 4., 8., 12., 16. a 19. úrovni: <strong>Zvýšení hodnot vlastností</strong> (+2 k jedné nebo +1 ke dvěma, max 20)</li>
          </ul>
        </div>
      }
    </mat-dialog-content>
  `,
  styles: `
    .hd-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; margin-left: auto; margin-right: 8px; user-select: none; }
    .hd-toggle__label { font-size: 9px; letter-spacing: .08em; color: rgba(200,160,60,.5); font-family: sans-serif; }
    .hd-toggle__track { width: 28px; height: 14px; border-radius: 7px; background: rgba(200,160,60,.15); border: 1px solid rgba(200,160,60,.3); position: relative; transition: background .2s; }
    .hd-toggle__track.active { background: rgba(200,160,60,.3); border-color: rgba(200,160,60,.6); }
    .hd-toggle__thumb { position: absolute; top: 1px; left: 1px; width: 10px; height: 10px; border-radius: 50%; background: #c8a03c; transition: left .2s; }
    .hd-toggle__track.active .hd-toggle__thumb { left: 15px; }
    .hd-text { padding: 16px 24px 24px; color: #d4c9a0; font-family: sans-serif; font-size: 13px; line-height: 1.6; }
    .hd-text h3 { font-size: 15px; color: #e8c96a; margin: 18px 0 8px; border-bottom: 1px solid rgba(200,160,60,.2); padding-bottom: 6px; }
    .hd-text h3:first-child { margin-top: 0; }
    .hd-text h4 { font-size: 13px; color: #d4c9a0; margin: 16px 0 8px; }
    .hd-text strong { color: #e0cfa0; }
    .hd-text ul { margin: 6px 0; padding-left: 20px; }
    .hd-text li { margin-bottom: 4px; color: #c8b896; }
    .hd-table { width: 100%; border-collapse: collapse; margin: 6px 0 14px; font-size: 12px; }
    .hd-table thead tr th { background: rgba(200,160,60,.1); color: rgba(200,160,60,.8); text-align: left; padding: 5px 8px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1px solid rgba(200,160,60,.25); }
    .hd-table tbody tr td { padding: 4px 8px; color: #c8b896; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: top; }
    .hd-table tbody tr:last-child td { border-bottom: none; }
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelsDialogComponent {
  dialogRef = inject(MatDialogRef<LevelsDialogComponent>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function openLevelsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(LevelsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
