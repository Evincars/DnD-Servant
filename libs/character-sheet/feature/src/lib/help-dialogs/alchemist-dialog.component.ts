import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'alchemist-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Alchymistická truhla
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/alchemist-1.png" style="width: 1060px;" />
        <img src="rules/alchemist-2.png" style="width: 1060px;" />
        <img src="rules/alchemist-3.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Alchymistická truhla – obsah</h3>
          <p>Alchymistická truhla obsahuje vybavení potřebné k míchání lektvarů, jedů a dalších alchymistických směsí.</p>

          <h4>Obsah soupravy</h4>
          <table class="hd-table"><thead><tr><th>Předmět</th><th>Poznámka</th></tr></thead><tbody>
            <tr><td>2× skleněné lahvičky</td><td>Na uchovávání lektvarů</td></tr>
            <tr><td>Kovový rám s držákem</td><td>Na zahřívání baněk</td></tr>
            <tr><td>Skleněná míchací tyčinka</td><td>Na míchání roztoků</td></tr>
            <tr><td>Hmoždíř s paličkou</td><td>Na drcení ingrediencí</td></tr>
            <tr><td>Sáček chemikálií</td><td>Základní součásti</td></tr>
          </tbody></table>

          <h4>Pravidla použití</h4>
          <ul>
            <li><strong>Zdatnost:</strong> Přidej bonus zdatnosti k ověřením vlastností při alchymistické práci.</li>
            <li><strong>Arkána:</strong> Zdatnost ti dává přehled o alchymistických ingrediencích a sloučeninách.</li>
            <li><strong>Pátrání:</strong> Rozpoznáš chemické stopy a zbytky na místě činu.</li>
            <li><strong>Výroba lektvaru:</strong> Můžeš vyrábět lektvary (viz pravidla pro výrobu v mezidobí).</li>
          </ul>

          <h4>Alchymistický oheň</h4>
          <p>Jako akci můžeš vrhnout lahvičku alchymistického ohně na cíl do 6 sáhů. Proveď útok na dálku (lahvička = improvizovaná zbraň). Při zásahu cíl utrpí <strong>1k4 ohnivého zranění</strong> na začátku každého tahu. Tvor může použít akci k hodu na záchranu OBR (SO 10) a uhasit plameny.</p>

          <h4>Kyselina</h4>
          <p>Jako akci můžeš vychrstnout obsah lahvičky na tvora do 1 sáhu nebo vrhnout do 6 sáhů. Útok na dálku (improvizovaná zbraň), při zásahu: <strong>2k6 kyselinového zranění</strong>.</p>

          <h4>Protijed</h4>
          <p>Jako akci můžeš vypít lahvičku protijedu. Na 1 hodinu máš výhodu k záchranným hodům proti jedu a jsi odolný vůči jedovému zranění.</p>
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
export class AlchemistDialogComponent {
  dialogRef = inject(MatDialogRef<AlchemistDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openAlchemistDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(AlchemistDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
