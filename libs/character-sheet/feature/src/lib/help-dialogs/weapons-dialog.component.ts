import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'weapons-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zbraně
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/zbrane-1.png" style="width: 1060px;" />
        <img src="rules/zbrane-2.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Jednoduché zbraně na blízko</h3>
          <table class="hd-table"><thead><tr><th>Zbraň</th><th>Cena</th><th>Zásah</th><th>Váha</th><th>Vlastnosti</th></tr></thead><tbody>
            <tr><td>Dýka</td><td>2 zl</td><td>1k4 bodné</td><td>1 lb</td><td>Lehká, vytříbená, vrhací (dostřel 6/18)</td></tr>
            <tr><td>Hůl</td><td>2 st</td><td>1k6 drtivé</td><td>4 lb</td><td>Obouruční</td></tr>
            <tr><td>Kyj</td><td>1 st</td><td>1k4 drtivé</td><td>2 lb</td><td>Lehká</td></tr>
            <tr><td>Lehké kladivo</td><td>2 zl</td><td>1k4 drtivé</td><td>2 lb</td><td>Lehká, vrhací (dostřel 6/18)</td></tr>
            <tr><td>Oštěp</td><td>5 st</td><td>1k6 bodné</td><td>2 lb</td><td>Vrhací (dostřel 9/36)</td></tr>
            <tr><td>Palcát</td><td>5 zl</td><td>1k6 drtivé</td><td>4 lb</td><td>—</td></tr>
            <tr><td>Sekera</td><td>5 zl</td><td>1k6 sečné</td><td>2 lb</td><td>Lehká, vrhací (dostřel 6/18)</td></tr>
            <tr><td>Srp</td><td>1 zl</td><td>1k4 sečné</td><td>2 lb</td><td>Lehká</td></tr>
            <tr><td>Kopí</td><td>1 zl</td><td>1k6 bodné</td><td>3 lb</td><td>Vrhací (dostřel 6/18), obouruční (1k8)</td></tr>
            <tr><td>Velkýkyj</td><td>2 st</td><td>1k8 drtivé</td><td>10 lb</td><td>Obouruční</td></tr>
          </tbody></table>

          <h3>Jednoduché zbraně na dálku</h3>
          <table class="hd-table"><thead><tr><th>Zbraň</th><th>Cena</th><th>Zásah</th><th>Váha</th><th>Vlastnosti</th></tr></thead><tbody>
            <tr><td>Krátký luk</td><td>25 zl</td><td>1k6 bodné</td><td>2 lb</td><td>Střelná (dostřel 24/96), obouruční</td></tr>
            <tr><td>Lehká kuše</td><td>25 zl</td><td>1k8 bodné</td><td>5 lb</td><td>Střelná (dostřel 24/96), nabíjecí, obouruční</td></tr>
            <tr><td>Prak</td><td>1 st</td><td>1k4 drtivé</td><td>—</td><td>Střelná (dostřel 9/36)</td></tr>
            <tr><td>Šipka</td><td>5 md</td><td>1k4 bodné</td><td>¼ lb</td><td>Vytříbená, vrhací (dostřel 6/18)</td></tr>
          </tbody></table>

          <h3>Válečné zbraně na blízko</h3>
          <table class="hd-table"><thead><tr><th>Zbraň</th><th>Cena</th><th>Zásah</th><th>Váha</th><th>Vlastnosti</th></tr></thead><tbody>
            <tr><td>Bojová sekera</td><td>10 zl</td><td>1k8 sečné</td><td>4 lb</td><td>Obouruční (1k10)</td></tr>
            <tr><td>Cep</td><td>10 zl</td><td>1k8 drtivé</td><td>2 lb</td><td>—</td></tr>
            <tr><td>Dlouhý meč</td><td>15 zl</td><td>1k8 sečné</td><td>3 lb</td><td>Obouruční (1k10)</td></tr>
            <tr><td>Halapartna</td><td>20 zl</td><td>1k10 sečné</td><td>6 lb</td><td>Těžká, dosah, obouruční</td></tr>
            <tr><td>Kopí (válečné)</td><td>10 zl</td><td>1k12 bodné</td><td>6 lb</td><td>Dosah, obouruční</td></tr>
            <tr><td>Krátký meč</td><td>10 zl</td><td>1k6 bodné</td><td>2 lb</td><td>Vytříbená, lehká</td></tr>
            <tr><td>Obouruční meč</td><td>50 zl</td><td>2k6 sečné</td><td>6 lb</td><td>Těžká, obouruční</td></tr>
            <tr><td>Rapír</td><td>25 zl</td><td>1k8 bodné</td><td>2 lb</td><td>Vytříbená</td></tr>
            <tr><td>Trojzubec</td><td>5 zl</td><td>1k6 bodné</td><td>4 lb</td><td>Vrhací (dostřel 6/18), obouruční (1k8)</td></tr>
            <tr><td>Válečné kladivo</td><td>15 zl</td><td>1k8 drtivé</td><td>2 lb</td><td>Obouruční (1k10)</td></tr>
            <tr><td>Válečná sekera</td><td>30 zl</td><td>1k12 sečné</td><td>7 lb</td><td>Těžká, obouruční</td></tr>
            <tr><td>Bič</td><td>2 zl</td><td>1k4 sečné</td><td>3 lb</td><td>Vytříbená, dosah</td></tr>
          </tbody></table>

          <h3>Válečné zbraně na dálku</h3>
          <table class="hd-table"><thead><tr><th>Zbraň</th><th>Cena</th><th>Zásah</th><th>Váha</th><th>Vlastnosti</th></tr></thead><tbody>
            <tr><td>Dlouhý luk</td><td>50 zl</td><td>1k8 bodné</td><td>2 lb</td><td>Střelná (dostřel 45/180), těžká, obouruční</td></tr>
            <tr><td>Ruční kuše</td><td>75 zl</td><td>1k6 bodné</td><td>3 lb</td><td>Střelná (dostřel 9/36), lehká, nabíjecí</td></tr>
            <tr><td>Těžká kuše</td><td>50 zl</td><td>1k10 bodné</td><td>18 lb</td><td>Střelná (dostřel 30/120), těžká, nabíjecí, obouruční</td></tr>
          </tbody></table>

          <h4>Vlastnosti zbraní</h4>
          <ul>
            <li><strong>Lehká</strong> — vhodná pro boj dvěma zbraněmi</li>
            <li><strong>Těžká</strong> — malí tvorové mají nevýhodu k útoku</li>
            <li><strong>Vytříbená</strong> — použij Sílu NEBO Obratnost</li>
            <li><strong>Obouruční</strong> — vyžaduje dvě ruce (hodnota v závorce = zásah dvouruč)</li>
            <li><strong>Dosah</strong> — útok na blízko na 2 sáhy místo 1</li>
            <li><strong>Vrhací</strong> — lze hodit; použij Sílu (nebo Obr pokud vytříbená)</li>
            <li><strong>Střelná</strong> — vyžaduje střelivo; použij Obratnost</li>
            <li><strong>Nabíjecí</strong> — max 1 útok za akci (i s Extra útokem)</li>
          </ul>
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
export class WeaponsDialogComponent {
  dialogRef = inject(MatDialogRef<WeaponsDialogComponent>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function openWeaponsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(WeaponsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
