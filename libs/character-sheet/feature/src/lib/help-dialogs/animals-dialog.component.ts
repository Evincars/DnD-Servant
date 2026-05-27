import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'animals-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zvířata a jejich nosnost
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/jezdecka-zvirata-a-dopravni-prostredky-1.png" style="width: 600px;" />
        <img src="rules/jezdecka-zvirata-a-dopravni-prostredky-2.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Jezdecká zvířata</h3>
          <table class="hd-table"><thead><tr><th>Zvíře</th><th>Cena</th><th>Rychlost</th><th>Nosnost</th></tr></thead><tbody>
            <tr><td>Osel / Mula</td><td>8 zl</td><td>8 sáhů</td><td>420 lb</td></tr>
            <tr><td>Velbloud</td><td>50 zl</td><td>10 sáhů</td><td>480 lb</td></tr>
            <tr><td>Poník</td><td>30 zl</td><td>8 sáhů</td><td>225 lb</td></tr>
            <tr><td>Jezdecký kůň</td><td>75 zl</td><td>12 sáhů</td><td>480 lb</td></tr>
            <tr><td>Tažný kůň</td><td>50 zl</td><td>8 sáhů</td><td>540 lb</td></tr>
            <tr><td>Válečný kůň</td><td>400 zl</td><td>12 sáhů</td><td>540 lb</td></tr>
            <tr><td>Mastif</td><td>25 zl</td><td>8 sáhů</td><td>195 lb</td></tr>
            <tr><td>Slon</td><td>200 zl</td><td>8 sáhů</td><td>1 320 lb</td></tr>
          </tbody></table>

          <h3>Dopravní prostředky – vodní</h3>
          <table class="hd-table"><thead><tr><th>Plavidlo</th><th>Cena</th><th>Rychlost</th></tr></thead><tbody>
            <tr><td>Kánoe / Veslice</td><td>50 zl</td><td>1,5 míle/h</td></tr>
            <tr><td>Plachetnice</td><td>10 000 zl</td><td>2 míle/h</td></tr>
            <tr><td>Veslovací loď</td><td>50 zl</td><td>1,5 míle/h</td></tr>
            <tr><td>Válečná loď</td><td>25 000 zl</td><td>2,5 míle/h</td></tr>
            <tr><td>Galeona</td><td>30 000 zl</td><td>4 míle/h</td></tr>
          </tbody></table>

          <h3>Dopravní prostředky – pozemní</h3>
          <table class="hd-table"><thead><tr><th>Vůz / vozidlo</th><th>Cena</th><th>Váha</th></tr></thead><tbody>
            <tr><td>Káry (ruční)</td><td>1 zl</td><td>—</td></tr>
            <tr><td>Saně</td><td>20 zl</td><td>300 lb</td></tr>
            <tr><td>Vůz (dvoukolák)</td><td>15 zl</td><td>200 lb</td></tr>
            <tr><td>Povoz (čtyřkolový)</td><td>100 zl</td><td>600 lb</td></tr>
          </tbody></table>

          <h4>Pravidla pro jezdectví</h4>
          <ul>
            <li><strong>Nasednutí/sesednutí</strong> – stojí polovinu tvé rychlosti pohybu.</li>
            <li><strong>Ovládání jezdeckého zvířete</strong> – zvíře se pohybuje dle tvých pokynů (tvá akce volná).</li>
            <li><strong>Nezávislé zvíře</strong> – Inteligentní zvířata (např. drak) jednají sama.</li>
            <li><strong>Vystrašené jezdecké zvíře</strong> – hod na OBR (Akrobacie) SO 10, jinak spadneš.</li>
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
export class AnimalsDialogComponent {
  dialogRef = inject(MatDialogRef<AnimalsDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openAnimalsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(AnimalsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
