import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'conviction-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Přesvědčení postavy
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/presvedceni-1.png" style="width: 1060px;" />
        <img src="rules/presvedceni-2.png" style="width: 1060px;" />
        <img src="rules/presvedceni-3.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Přesvědčení (Alignment)</h3>
          <p>Přesvědčení je obecný popis morálního a etického postoje postavy. Skládá se ze dvou složek:</p>
          <ul>
            <li><strong>Zákon vs. Chaos</strong> — přístup k řádu a pravidlům</li>
            <li><strong>Dobro vs. Zlo</strong> — přístup k ostatním tvorům</li>
          </ul>

          <h3>Tabulka přesvědčení</h3>
          <table class="hd-table"><thead><tr><th></th><th>Zákonné</th><th>Neutrální</th><th>Chaotické</th></tr></thead><tbody>
            <tr><td><strong>Dobré</strong></td><td>Zákonně dobré (ZD)</td><td>Neutrálně dobré (ND)</td><td>Chaoticky dobré (ChD)</td></tr>
            <tr><td><strong>Neutrální</strong></td><td>Zákonně neutrální (ZN)</td><td>Neutrální (N)</td><td>Chaoticky neutrální (ChN)</td></tr>
            <tr><td><strong>Zlé</strong></td><td>Zákonně zlé (ZZ)</td><td>Neutrálně zlé (NZ)</td><td>Chaoticky zlé (ChZ)</td></tr>
          </tbody></table>

          <h4>Zákonně dobré (ZD)</h4>
          <p>Postava dělá to, co se očekává od dobrého člena společnosti. Kombinace soucitu a smyslu pro povinnost. Příklad: rytíř, paladin.</p>

          <h4>Neutrálně dobré (ND)</h4>
          <p>Dělá nejlepší, co může, aby pomáhala ostatním, bez ohledu na to, zda dodržuje zákony. Příklad: léčitel, dobrodruh s dobrým srdcem.</p>

          <h4>Chaoticky dobré (ChD)</h4>
          <p>Jedná dle svého svědomí, bez ohledu na očekávání ostatních. Svoboda a dobro jdou ruku v ruce. Příklad: Robin Hood.</p>

          <h4>Zákonně neutrální (ZN)</h4>
          <p>Jedná v souladu se zákonem, tradicí nebo osobním kodexem. Řád je prvořadý. Příklad: soudce, mnich.</p>

          <h4>Neutrální (N)</h4>
          <p>Nenaklání se žádným směrem — jedná dle situace, nebo zastává rovnováhu. Příklad: druid, vesničan.</p>

          <h4>Chaoticky neutrální (ChN)</h4>
          <p>Následuje vlastní rozmary. Individualista a nepředvídatelný. Příklad: bard, tulák.</p>

          <h4>Zákonně zlé (ZZ)</h4>
          <p>Bere si, co chce, v rámci tradice nebo kodexu. Využívá systém k vlastnímu prospěchu. Příklad: tyran, zkorumpovaný šlechtic.</p>

          <h4>Neutrálně zlé (NZ)</h4>
          <p>Dělá, co mu projde, bez soucitu a výčitek. Příklad: nájemný vrah.</p>

          <h4>Chaoticky zlé (ChZ)</h4>
          <p>Jedná s naprostou svévolí, chamtivostí a krutostí. Příklad: démon, šílený tyran.</p>
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
export class ConvictionDialogComponent {
  dialogRef = inject(MatDialogRef<ConvictionDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openConvictionDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ConvictionDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
