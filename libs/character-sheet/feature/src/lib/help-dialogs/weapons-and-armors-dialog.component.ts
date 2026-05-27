import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'weapons-and-armors-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Tabulka zbraní a zbrojí
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/tabulka-zbrani-a-zbroji.png" style="width: 1060px;" />
        <img src="rules/tabulka-zbrani-a-zbroji-2.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Zbroje</h3>
          <table class="hd-table"><thead><tr><th>Zbroj</th><th>Cena</th><th>OČ</th><th>Síla</th><th>Nenápadnost</th><th>Váha</th></tr></thead><tbody>
            <tr><td colspan="6" style="color:#e8c96a;font-weight:bold;padding-top:10px">Lehká zbroj</td></tr>
            <tr><td>Vycpaná</td><td>5 zl</td><td>11 + OBR</td><td>—</td><td>Nevýhoda</td><td>8 lb</td></tr>
            <tr><td>Kožená</td><td>10 zl</td><td>11 + OBR</td><td>—</td><td>—</td><td>10 lb</td></tr>
            <tr><td>Okovaná kůže</td><td>45 zl</td><td>12 + OBR</td><td>—</td><td>—</td><td>13 lb</td></tr>
            <tr><td colspan="6" style="color:#e8c96a;font-weight:bold;padding-top:10px">Střední zbroj</td></tr>
            <tr><td>Kožešinová</td><td>10 zl</td><td>12 + OBR (max 2)</td><td>—</td><td>—</td><td>12 lb</td></tr>
            <tr><td>Kroužková košile</td><td>50 zl</td><td>13 + OBR (max 2)</td><td>—</td><td>—</td><td>20 lb</td></tr>
            <tr><td>Šupinová</td><td>50 zl</td><td>14 + OBR (max 2)</td><td>—</td><td>Nevýhoda</td><td>45 lb</td></tr>
            <tr><td>Kyrys</td><td>400 zl</td><td>14 + OBR (max 2)</td><td>—</td><td>—</td><td>20 lb</td></tr>
            <tr><td>Poloplátová</td><td>750 zl</td><td>15 + OBR (max 2)</td><td>—</td><td>Nevýhoda</td><td>40 lb</td></tr>
            <tr><td colspan="6" style="color:#e8c96a;font-weight:bold;padding-top:10px">Těžká zbroj</td></tr>
            <tr><td>Kroužková</td><td>30 zl</td><td>14</td><td>—</td><td>Nevýhoda</td><td>40 lb</td></tr>
            <tr><td>Drátěná</td><td>75 zl</td><td>16</td><td>Síla 13</td><td>Nevýhoda</td><td>55 lb</td></tr>
            <tr><td>Lamelová</td><td>200 zl</td><td>17</td><td>Síla 15</td><td>Nevýhoda</td><td>60 lb</td></tr>
            <tr><td>Plátová</td><td>1 500 zl</td><td>18</td><td>Síla 15</td><td>Nevýhoda</td><td>65 lb</td></tr>
            <tr><td colspan="6" style="color:#e8c96a;font-weight:bold;padding-top:10px">Štít</td></tr>
            <tr><td>Štít</td><td>10 zl</td><td>+2</td><td>—</td><td>—</td><td>6 lb</td></tr>
          </tbody></table>

          <h3>Zdatnost ve zbroji</h3>
          <ul>
            <li>Bez zdatnosti: nevýhoda k útokům, záchranám na SÍL/OBR, nelze sesílat kouzla</li>
            <li><strong>Lehká</strong> — všechna povolání kromě Kouzelníka a Čaroděje</li>
            <li><strong>Střední</strong> — Bojovník, Paladin, Klerik, Druid, Hraničář, Barbar</li>
            <li><strong>Těžká</strong> — Bojovník, Paladin, některé domény Klerika</li>
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
    .hd-text p { margin: 6px 0; color: #c8b896; }
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
export class WeaponsAndArmorsDialogComponent {
  dialogRef = inject(MatDialogRef<WeaponsAndArmorsDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openWeaponsAndArmorsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(WeaponsAndArmorsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
