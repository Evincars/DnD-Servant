import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'carriage-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Nosnost
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/nosnost.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Nosnost postavy</h3>
          <table class="hd-table">
            <thead><tr><th>Pravidlo</th><th>Vzorec</th><th>Efekt</th></tr></thead>
            <tbody>
              <tr><td><strong>Nosnost</strong></td><td>Síla × 15</td><td>Maximální váha, kterou postava unese (v librách)</td></tr>
              <tr><td><strong>Zvednutí / tlačení / tažení</strong></td><td>Síla × 30</td><td>Max. váha pro krátkou manipulaci (rychlost = 1,5 m)</td></tr>
            </tbody>
          </table>
          <h4>Variantní pravidlo: Zatížení</h4>
          <table class="hd-table">
            <thead><tr><th>Zatížení</th><th>Hmotnost</th><th>Penalizace</th></tr></thead>
            <tbody>
              <tr><td><strong>Nezatížený</strong></td><td>do Síla × 5 lb</td><td>Žádná</td></tr>
              <tr><td><strong>Zatížený</strong></td><td>Síla × 5 – Síla × 10 lb</td><td>Rychlost −10 stop (−3 m)</td></tr>
              <tr><td><strong>Silně zatížený</strong></td><td>Síla × 10 – Síla × 15 lb</td><td>Rychlost −20 stop (−6 m), nevýhoda k hodům na vlastnosti, útokům a ZH (Síla, Obr, Odol)</td></tr>
            </tbody>
          </table>
          <h4>Velikost a nosnost</h4>
          <table class="hd-table">
            <thead><tr><th>Velikost</th><th>Násobič nosnosti</th></tr></thead>
            <tbody>
              <tr><td>Drobná</td><td>× ½</td></tr>
              <tr><td>Malá / Střední</td><td>× 1</td></tr>
              <tr><td>Velká</td><td>× 2</td></tr>
              <tr><td>Obrovská</td><td>× 4</td></tr>
              <tr><td>Gigantická</td><td>× 8</td></tr>
            </tbody>
          </table>
        </div>
      }
    </mat-dialog-content>
  `,
  styles: `
    .hd-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; margin-left: auto; margin-right: 8px; user-select: none; }
    .hd-toggle__label { font-size: 9px; letter-spacing: .08em; color: rgba(200,160,60,.5); font-family: sans-serif; }
    .hd-toggle__track { width: 28px; height: 14px; border-radius: 7px; background: rgba(200,160,60,.15); border: 1px solid rgba(200,160,60,.3); position: relative; transition: background .2s, border-color .2s; }
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
export class CarriageDialogComponent {
  dialogRef = inject(MatDialogRef<CarriageDialogComponent>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function openCarriageDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(CarriageDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
