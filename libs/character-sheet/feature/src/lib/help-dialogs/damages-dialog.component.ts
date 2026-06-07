import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'damages-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Bojové a přetrvávající zranění
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/bojova-zraneni.png" style="width: 1060px;" />
        <img src="rules/bojova-zraneni-tabulka.png" style="width: 1060px;" />
        <img src="rules/pretrvavajici-zraneni.png" style="width: 1060px;" />
        <hr />
        <img src="rules/body-vydrze-1.png" style="width: 1060px;" />
        <img src="rules/body-vydrze-2.png" style="width: 600px;" />
      } @else {
        <div class="hd-text">
          <h3>Typy zranění</h3>
          <table class="hd-table"><thead><tr><th>Typ</th><th>Popis</th></tr></thead><tbody>
            <tr><td><strong>Bodné</strong></td><td>Propíchnutí (rapír, šíp, kousnutí)</td></tr>
            <tr><td><strong>Drtivé</strong></td><td>Tlaková síla (palcát, pád, sevření)</td></tr>
            <tr><td><strong>Sečné</strong></td><td>Řez ostří (meč, sekera, drápy)</td></tr>
            <tr><td><strong>Bleskové</strong></td><td>Elektřina (lightning bolt)</td></tr>
            <tr><td><strong>Hromové</strong></td><td>Zvuková vlna (shatter)</td></tr>
            <tr><td><strong>Chladné</strong></td><td>Mráz (cone of cold)</td></tr>
            <tr><td><strong>Jedové</strong></td><td>Toxiny a jedy</td></tr>
            <tr><td><strong>Kyselinové</strong></td><td>Korozivní látky</td></tr>
            <tr><td><strong>Nekrotické</strong></td><td>Energie smrti (necrotic shroud)</td></tr>
            <tr><td><strong>Ohnivé</strong></td><td>Plameny (fireball)</td></tr>
            <tr><td><strong>Psychické</strong></td><td>Mentální útok (psychic damage)</td></tr>
            <tr><td><strong>Silové</strong></td><td>Čistá magická energie (magic missile)</td></tr>
            <tr><td><strong>Zářivé</strong></td><td>Božská / svatá energie (guiding bolt)</td></tr>
          </tbody></table>

          <h3>Odolnosti a zranitelnosti</h3>
          <ul>
            <li><strong>Odolnost</strong> — zranění se sníží na polovinu</li>
            <li><strong>Zranitelnost</strong> — zranění se zdvojnásobí</li>
            <li><strong>Imunita</strong> — žádné zranění daného typu</li>
          </ul>

          <h3>Přetrvávající zranění (volitelné pravidlo)</h3>
          <p>Když tvor utrpí kritický zásah, padne na 0 životů nebo neuspěje v záchranném hodu o 5+, DM může hodit na tabulku přetrvávajících zranění:</p>
          <table class="hd-table"><thead><tr><th>k20</th><th>Zranění</th></tr></thead><tbody>
            <tr><td>1</td><td>Ztráta oka — nevýhoda k Vnímání (zrak) a útokům na dálku</td></tr>
            <tr><td>2</td><td>Ztráta ruky/paže — nelze držet dvouruční zbraně, max 1 předmět</td></tr>
            <tr><td>3</td><td>Ztráta nohy — rychlost na polovinu, nevýhoda k Akrobacii</td></tr>
            <tr><td>4–5</td><td>Kulhání — rychlost snížena o 1 sáh</td></tr>
            <tr><td>6–7</td><td>Vnitřní zranění — nevýhoda k záchr. hodům na Odolnost</td></tr>
            <tr><td>8–10</td><td>Zlomená kost — nevýhoda k ověření Síly a Obratnosti, 1 min. léčení</td></tr>
            <tr><td>11–13</td><td>Ošklivá jizva — nevýhoda/výhoda k sociálním hodům (dle situace)</td></tr>
            <tr><td>14–16</td><td>Menší jizva — žádný mechanický efekt, jen kosmetika</td></tr>
            <tr><td>17–20</td><td>Bolest — žádný trvalý efekt</td></tr>
          </tbody></table>

          <h3>Body výdrže (Hit Points)</h3>
          <ul>
            <li><strong>Maximum HP</strong> = kostka povolání + oprava Odolnosti (za každou úroveň)</li>
            <li><strong>0 HP</strong> = bezvědomí, hody na smrt (3 úspěchy = stabilizace, 3 neúspěchy = smrt)</li>
            <li><strong>Dočasné HP</strong> — nekumulují se, nelze léčit; absorbují zranění první</li>
            <li><strong>Masivní zranění</strong> — zbývající zranění ≥ max HP = okamžitá smrt</li>
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
export class DamagesDialogComponent {
  dialogRef = inject(MatDialogRef<DamagesDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openDamagesDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(DamagesDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
