import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'maneuvers-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Manévry (Akce)
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/manevry-0.png" style="width: 1060px;" />
        <img src="rules/manevry-1.png" style="width: 1060px;" />
        <img src="rules/manevry-2.png" style="width: 1060px;" />
        <img src="rules/manevry-3.png" style="width: 1060px;" />
        <img src="rules/manevry-4.png" style="width: 1060px;" />
        <img src="rules/manevry-5.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Akce v boji – přehled</h3>
          <p>Každý tah máš k dispozici jednu <strong>akci</strong>, jednu <strong>bonusovou akci</strong> (pokud máš schopnost) a <strong>pohyb</strong>.</p>

          <table class="hd-table"><thead><tr><th>Akce</th><th>Typ</th><th>Automatický efekt</th><th>Hod</th><th>SO</th><th>Při úspěchu</th></tr></thead><tbody>
            <tr><td><strong>Útok</strong></td><td>Akce</td><td></td><td>Útok zbraní</td><td>OČ</td><td>Zásah</td></tr>
            <tr><td><strong>Uhýbání</strong></td><td>Zákl.</td><td>Nevýhoda k Útokům, Výhoda k ZH na OBR</td><td></td><td></td><td></td></tr>
            <tr><td><strong>Odpoutání</strong></td><td>Zákl.</td><td>Ruší Příležitostné útoky</td><td></td><td></td><td></td></tr>
            <tr><td><strong>Odtržení</strong></td><td>Plný</td><td>Ruší Příležitostné útoky</td><td>Útok Improv. zbraní</td><td>P At/Ak/Vn</td><td>Akce Běh zdarma.</td></tr>
            <tr><td><strong>Rozhozen</strong></td><td>Plný</td><td>Výhoda k 1. dalšímu Útoku</td><td>Útok Improv. zbraní</td><td>P At/Ak/Vn</td><td>+2 rozsah kritu 1. dalšího Útoku.</td></tr>
            <tr><td><strong>Vylákání</strong></td><td>Plný</td><td>Když tě protivník 1× mine, Výhoda k 1. dalšímu Útoku</td><td>CHA (Klamání)</td><td>P Vnímání</td><td>+2 rozsah kritu 1. dalšího Útoku.</td></tr>
            <tr><td><strong>Chycení</strong></td><td>Útočný</td><td></td><td>SIL (Atletika)</td><td>P At/Ak</td><td>Cíl je Chycený. Únik: At/Ak proti P Atletice.</td></tr>
            <tr><td><strong>Hození</strong></td><td>Útočný</td><td>Odhodíš o ½ R + Sražení</td><td>Cíl ZH OBR</td><td>P Atletika</td><td>Možný Zásah za 1k4+SIL BV.</td></tr>
            <tr><td><strong>Odstrčení</strong></td><td>Útočný</td><td></td><td>SIL (Atletika)</td><td>P At/Ak</td><td>Posun Cíle o 1 sáh.</td></tr>
            <tr><td><strong>Sražení</strong></td><td>Útočný</td><td></td><td>SIL (Atletika)</td><td>P At/Ak</td><td>Cíl se stane Ležícím.</td></tr>
            <tr><td><strong>Odzbrojení</strong></td><td>Útočný</td><td></td><td>Útok s N</td><td>P At/Ak (+5 dvouruč)</td><td>Předmět spadne. Pokud Cíl Drží, předmět převezmeš.</td></tr>
            <tr><td><strong>Prorážení</strong></td><td>Útočný</td><td></td><td>SIL (Atletika)</td><td>P Atletika</td><td>Projdeš, ruší Příl. útoky.</td></tr>
            <tr><td><strong>Prosmýknutí</strong></td><td>Útočný</td><td></td><td>OBR (Akrobacie)</td><td>P Akrobacie</td><td>Projdeš, ruší Příl. útoky.</td></tr>
            <tr><td><strong>Lezení na tvor</strong></td><td>Plný</td><td></td><td>SIL (At) / OBR (Ak)</td><td>P Akrobacie</td><td>Vylezeš na tvora.</td></tr>
            <tr><td><strong>Seslání kouzla</strong></td><td>Akce</td><td>Seslání kouzla</td><td></td><td></td><td>Viz popis kouzla.</td></tr>
            <tr><td><strong>Běh (Sprint)</strong></td><td>Akce</td><td>Pohyb + Rychlost</td><td></td><td></td><td>Efekty ovlivňující Rychlost ovlivní i + Rychlost u Běhu.</td></tr>
            <tr><td><strong>Schování se</strong></td><td>Akce</td><td></td><td>OBR (Nenápadnost)</td><td>P Vnímání</td><td>Jsi skrytý — útočíš s výhodou.</td></tr>
            <tr><td><strong>Pomoc</strong></td><td>Akce</td><td>Cíl získá Výhodu</td><td></td><td></td><td>Cíl do 1 sáhu získá Výhodu k dalšímu Útoku.</td></tr>
            <tr><td><strong>Použití předmětu</strong></td><td>Akce</td><td>Použití předmětu</td><td></td><td></td><td>Jedna jednoduchá interakce s jedním předmětem v Tahu je zdarma.</td></tr>
            <tr><td><strong>Hledání</strong></td><td>Akce</td><td></td><td>MDR (Vnímání) / INT (Pátrání)</td><td></td><td></td></tr>
            <tr><td><strong>První pomoc</strong></td><td>Akce</td><td></td><td>MDR (Lékařství)</td><td>10</td><td>Stabilizace Cíle</td></tr>
            <tr><td><strong>Odložení / Příprava</strong></td><td>Akce</td><td></td><td></td><td></td><td>Jmenuj spouštěč → Reakcí provedeš Akci. Odložení kouzla vyžaduje Soustředění a stojí Pozici.</td></tr>
            <tr><td><strong>Improvizovaná akce</strong></td><td>Akce</td><td></td><td></td><td></td><td>Vyhodnoť rovnocenně s běžnými Akcemi. Podporuj kreativitu!</td></tr>
          </tbody></table>

          <h3>Bonusová akce</h3>
          <ul>
            <li><strong>Útok druhou zbraní</strong> – při boji dvěma lehkými zbraněmi (bez opravy vlastnosti k zranění)</li>
            <li><strong>Kouzla</strong> – některá mají dobu vyvolávání „bonusová akce"</li>
            <li><strong>Schopnosti povolání</strong> – např. Šibalův Mazaný tah, Mnichovy Ki body</li>
          </ul>

          <h3>Reakce</h3>
          <ul>
            <li><strong>Příležitostný útok</strong> – když tvor opouští tvůj dosah (1 útok na blízko)</li>
            <li><strong>Připravená akce</strong> – viz Odložení / Příprava výše</li>
            <li><strong>Některá kouzla</strong> – např. Shield, Counterspell</li>
          </ul>

          <h3>Typy manévrů</h3>
          <table class="hd-table"><thead><tr><th>Typ</th><th>Popis</th></tr></thead><tbody>
            <tr><td><strong>Základní (Zákl.)</strong></td><td>Nevyžaduje hod — automatický efekt.</td></tr>
            <tr><td><strong>Plný (manévr)</strong></td><td>Nahrazuje celou Akci Útoku (všechny útoky). Pokud uspěješ, získáš automatický efekt + bonus z úspěchu.</td></tr>
            <tr><td><strong>Útočný (manévr)</strong></td><td>Nahrazuje jeden Útok v rámci Akce Útoku. Neúspěch = žádný efekt, Útok se spotřebuje.</td></tr>
          </tbody></table>

          <h3>Pohyb v boji</h3>
          <ul>
            <li><strong>Pohyb:</strong> Můžeš rozdělit okolo útoků a akcí v libovolném pořadí.</li>
            <li><strong>Těžký terén:</strong> Každý metr stojí 2 m pohybu.</li>
            <li><strong>Plazení / lezení:</strong> Každý metr stojí 2 m pohybu.</li>
            <li><strong>Pád:</strong> 1k6 drtivého za každé 3 m (max 20k6).</li>
          </ul>

          <h3>Krytí</h3>
          <table class="hd-table"><thead><tr><th>Typ krytí</th><th>Bonus OČ</th><th>Bonus k ZH na OBR</th></tr></thead><tbody>
            <tr><td><strong>Poloviční</strong> (½)</td><td>+2</td><td>+2</td></tr>
            <tr><td><strong>Tříčtvrtinové</strong> (¾)</td><td>+5</td><td>+5</td></tr>
            <tr><td><strong>Úplné</strong></td><td colspan="2">Cíl nelze přímo zasáhnout</td></tr>
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
export class ManeuversDialogComponent {
  dialogRef = inject(MatDialogRef<ManeuversDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openManeuversDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ManeuversDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
