import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'background-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Zázemí postavy
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/zazemi-1.png" style="width: 1060px;" />
        <img src="rules/zazemi-2.png" style="width: 1060px;" />
        <img src="rules/zazemi-3.png" style="width: 1060px;" />
        <img src="rules/zazemi-4.png" style="width: 1060px;" />
        <img src="rules/zazemi-5.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Zázemí (Backgrounds)</h3>
          <p>Zázemí určuje, odkud tvá postava pochází, čím se zabývala a jaké místo zaujímá ve světě. Každé zázemí poskytuje:</p>
          <ul>
            <li><strong>Zdatnosti</strong> ve 2 dovednostech</li>
            <li><strong>Zdatnost v pomůckách nebo jazycích</strong></li>
            <li><strong>Počáteční vybavení</strong></li>
            <li><strong>Schopnost zázemí</strong> (roleplayová výhoda)</li>
          </ul>

          <h3>Přehled zázemí</h3>
          <table class="hd-table"><thead><tr><th>Zázemí</th><th>Zdatnosti (dovednosti)</th><th>Jazyky/pomůcky</th></tr></thead><tbody>
            <tr><td><strong>Akolyta</strong></td><td>Vhled, Náboženství</td><td>2 jazyky</td></tr>
            <tr><td><strong>Bavič</strong></td><td>Akrobacie, Umění</td><td>Souprava pro přestrojování, 1 hudební nástroj</td></tr>
            <tr><td><strong>Cechovní řemeslník</strong></td><td>Vhled, Přesvědčování</td><td>1 řemeslnická pomůcka</td></tr>
            <tr><td><strong>Chodec</strong></td><td>Atletika, Přežití</td><td>1 hudební nástroj</td></tr>
            <tr><td><strong>Lidový hrdina</strong></td><td>Ovládání zvířat, Přežití</td><td>1 řemeslnická pomůcka, pozemní vozidla</td></tr>
            <tr><td><strong>Mudrc</strong></td><td>Arkána, Historie</td><td>2 jazyky</td></tr>
            <tr><td><strong>Námořník</strong></td><td>Atletika, Vnímání</td><td>Navigační pomůcky, vodní vozidla</td></tr>
            <tr><td><strong>Poustevník</strong></td><td>Lékařství, Náboženství</td><td>Bylinkářská souprava</td></tr>
            <tr><td><strong>Šarlatán</strong></td><td>Klamání, Čachry</td><td>Padělatelská souprava, souprava pro přestrojování</td></tr>
            <tr><td><strong>Šlechtic</strong></td><td>Historie, Přesvědčování</td><td>1 herní souprava, 1 jazyk</td></tr>
            <tr><td><strong>Uličník</strong></td><td>Čachry, Nenápadnost</td><td>Souprava pro přestrojování, zlodějské náčiní</td></tr>
            <tr><td><strong>Voják</strong></td><td>Atletika, Zastrašování</td><td>1 herní souprava, pozemní vozidla</td></tr>
            <tr><td><strong>Zločinec</strong></td><td>Klamání, Nenápadnost</td><td>1 herní souprava, zlodějské náčiní</td></tr>
          </tbody></table>

          <h4>Přizpůsobení zázemí</h4>
          <p>S DM se můžeš domluvit na úpravě zázemí – vyměnit dovednosti, jazyky, pomůcky nebo vybavení tak, aby lépe odpovídaly tvému příběhu.</p>
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
export class BackgroundDialogComponent {
  dialogRef = inject(MatDialogRef<BackgroundDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openBackgroundDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(BackgroundDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
