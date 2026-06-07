import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'armor-class-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zbroje a obranné číslo
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/armor-class-1.png" style="width: 600px;" />
        <img src="rules/armor-class-2.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Zbroje a obranné číslo (OČ)</h3>
          <p><strong>Bez zbroje:</strong> OČ = 10 + oprava Obratnosti</p>
          <h4>Lehké zbroje</h4>
          <table class="hd-table"><thead><tr><th>Zbroj</th><th>OČ</th><th>Nenápadnost</th><th>Váha</th><th>Cena</th></tr></thead><tbody>
            <tr><td>Vycpávaná</td><td>11 + Obr</td><td>Nevýhoda</td><td>8 lb</td><td>5 zl</td></tr>
            <tr><td>Kožená</td><td>11 + Obr</td><td>—</td><td>10 lb</td><td>10 zl</td></tr>
            <tr><td>Okovaná kožená</td><td>12 + Obr</td><td>—</td><td>13 lb</td><td>45 zl</td></tr>
          </tbody></table>
          <h4>Střední zbroje</h4>
          <table class="hd-table"><thead><tr><th>Zbroj</th><th>OČ</th><th>Nenápadnost</th><th>Váha</th><th>Cena</th></tr></thead><tbody>
            <tr><td>Kožešinová</td><td>12 + Obr (max +2)</td><td>—</td><td>12 lb</td><td>10 zl</td></tr>
            <tr><td>Drátěná košile</td><td>13 + Obr (max +2)</td><td>—</td><td>20 lb</td><td>50 zl</td></tr>
            <tr><td>Šupinová</td><td>14 + Obr (max +2)</td><td>Nevýhoda</td><td>45 lb</td><td>50 zl</td></tr>
            <tr><td>Kyrys</td><td>14 + Obr (max +2)</td><td>—</td><td>20 lb</td><td>400 zl</td></tr>
            <tr><td>Půlplátová</td><td>15 + Obr (max +2)</td><td>Nevýhoda</td><td>40 lb</td><td>750 zl</td></tr>
          </tbody></table>
          <h4>Těžké zbroje</h4>
          <table class="hd-table"><thead><tr><th>Zbroj</th><th>OČ</th><th>Síla</th><th>Nenápadnost</th><th>Váha</th><th>Cena</th></tr></thead><tbody>
            <tr><td>Kroužková</td><td>14</td><td>—</td><td>Nevýhoda</td><td>40 lb</td><td>30 zl</td></tr>
            <tr><td>Šálová</td><td>16</td><td>Síla 13</td><td>Nevýhoda</td><td>55 lb</td><td>75 zl</td></tr>
            <tr><td>Drštičková</td><td>17</td><td>Síla 15</td><td>Nevýhoda</td><td>60 lb</td><td>200 zl</td></tr>
            <tr><td>Plátová</td><td>18</td><td>Síla 15</td><td>Nevýhoda</td><td>65 lb</td><td>1500 zl</td></tr>
          </tbody></table>
          <h4>Štíty</h4>
          <p><strong>Štít:</strong> +2 k OČ, 6 lb, 10 zl</p>
          <h4>Oblékání a svlékání</h4>
          <table class="hd-table"><thead><tr><th>Kategorie</th><th>Oblečení</th><th>Svlečení</th></tr></thead><tbody>
            <tr><td>Lehká</td><td>1 minuta</td><td>1 minuta</td></tr>
            <tr><td>Střední</td><td>5 minut</td><td>1 minuta</td></tr>
            <tr><td>Těžká</td><td>10 minut</td><td>5 minut</td></tr>
            <tr><td>Štít</td><td>1 akce</td><td>1 akce</td></tr>
          </tbody></table>
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
    .hd-table { width: 100%; border-collapse: collapse; margin: 6px 0 14px; font-size: 12px; }
    .hd-table thead tr th { background: rgba(200,160,60,.1); color: rgba(200,160,60,.8); text-align: left; padding: 5px 8px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1px solid rgba(200,160,60,.25); }
    .hd-table tbody tr td { padding: 4px 8px; color: #c8b896; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: top; }
    .hd-table tbody tr:last-child td { border-bottom: none; }
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmorClassDialogComponent {
  dialogRef = inject(MatDialogRef<ArmorClassDialogComponent>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function openArmorClassDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ArmorClassDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
