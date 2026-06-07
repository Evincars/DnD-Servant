import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'special-situations-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Speciální situace
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/specialni-situace.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Speciální situace v boji</h3>

          <h4>Boj ve vodě (pod vodou)</h4>
          <ul>
            <li>Tvor s rychlostí plavání nebo bez — útok na blízko má <strong>nevýhodu</strong>, pokud zbraň není dýka, oštěp, krátký meč, kopí nebo trojzubec.</li>
            <li>Útoky na dálku automaticky míjí za normální dostřel. V rámci normálního dostřelu mají <strong>nevýhodu</strong> (kromě kuší, sítě a zbraní typu oštěp).</li>
          </ul>

          <h4>Boj na koni (na jezdeckém zvířeti)</h4>
          <ul>
            <li>Nasednutí/sesednutí stojí polovinu pohybu.</li>
            <li>Pokud je jezdecké zvíře zasaženo nebo vystrašeno, záchranný hod na Obratnost SO 10, jinak jezdec spadne (ležící).</li>
            <li>Zvíře může buď Uhýbat, Odpoutat se nebo Běžet (Sprint).</li>
            <li>Pokud je zvíře ovládané, pohybuje se v tahu jezdce.</li>
          </ul>

          <h4>Překvapení</h4>
          <ul>
            <li>PH porovná OBR (Nenápadnost) útočníků vs. MDR (Vnímání) obětí.</li>
            <li>Překvapený tvor <strong>nemůže v prvním kole boje provést akci, bonusovou akci ani reakci</strong>.</li>
            <li>Po skončení prvního tahu překvapení končí.</li>
          </ul>

          <h4>Pád do propasti / pád z výšky</h4>
          <ul>
            <li><strong>1k6 drtivého za každé 3 m pádu</strong> (max 20k6 = 60 m).</li>
            <li>Tvor při dopadu spadne na zem (ležící), pokud se pádu neměl šanci vyhnout.</li>
          </ul>

          <h4>Zadržení dechu</h4>
          <ul>
            <li>Vydrží zadržet dech: <strong>1 + oprava Odolnosti</strong> minut (min. 30 sekund).</li>
            <li>Po vypršení: na začátku následujícího tahu padne na 0 životů a umírá.</li>
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
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialSituationsDialogComponent {
  dialogRef = inject(MatDialogRef<SpecialSituationsDialogComponent>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function openSpecialSituationsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(SpecialSituationsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
