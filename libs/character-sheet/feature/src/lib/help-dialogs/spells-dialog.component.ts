import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'spells-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Seznam kouzel
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/kouzla-1.png" style="width: 1060px;" />
        <img src="rules/kouzla-2.png" style="width: 1060px;" />
        <img src="rules/kouzla-3.png" style="width: 1060px;" />
        <img src="rules/kouzla-4.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Pravidla sesílání kouzel</h3>

          <h4>Pozice kouzel (Spell Slots)</h4>
          <p>Každé kouzlo 1. nebo vyšší úrovně spotřebuje pozici kouzla. Pozice se obnoví při dlouhém odpočinku. Triky (0. úroveň) nespotřebovávají pozice.</p>

          <h4>Sesílací vlastnost</h4>
          <table class="hd-table"><thead><tr><th>Povolání</th><th>Vlastnost</th></tr></thead><tbody>
            <tr><td>Bard, Čaroděj, Paladin, Černokněžník</td><td>Charisma</td></tr>
            <tr><td>Klerik, Druid, Hraničář</td><td>Moudrost</td></tr>
            <tr><td>Kouzelník</td><td>Inteligence</td></tr>
          </tbody></table>

          <h4>SO záchrany kouzla</h4>
          <p><strong>SO = 8 + bonus zdatnosti + oprava sesílací vlastnosti</strong></p>

          <h4>Útočný bonus kouzla</h4>
          <p><strong>Bonus = bonus zdatnosti + oprava sesílací vlastnosti</strong></p>

          <h4>Úrovně kouzel</h4>
          <table class="hd-table"><thead><tr><th>Úroveň kouzla</th><th>Popis</th></tr></thead><tbody>
            <tr><td>Trik (0.)</td><td>Zdarma, kdykoliv, bez pozice</td></tr>
            <tr><td>1.–9.</td><td>Vyžaduje pozici dané úrovně nebo vyšší</td></tr>
          </tbody></table>

          <h4>Soustředění (Concentration)</h4>
          <ul>
            <li>Max 1 kouzlo vyžadující soustředění najednou</li>
            <li>Seslání dalšího soustřeďovacího kouzla ukončí předchozí</li>
            <li>Při obdržení zranění: záchranný hod ODL, SO = 10 nebo polovina zranění (co je víc)</li>
            <li>Narušení: bezvědomí, smrt, DM efekty</li>
          </ul>

          <h4>Rituální sesílání</h4>
          <p>Kouzla označená jako rituál lze seslat bez spotřeby pozice — doba sesílání se prodlouží o 10 minut.</p>

          <h4>Složky kouzla</h4>
          <ul>
            <li><strong>V (verbální)</strong> — nutné mluvit (zášeplí formule)</li>
            <li><strong>P (pohybová)</strong> — nutná volná ruka</li>
            <li><strong>M (materiální)</strong> — nutná surovina / ohniskový předmět / brašnička</li>
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
export class SpellsDialogComponent {
  dialogRef = inject(MatDialogRef<SpellsDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openSpellsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(SpellsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
