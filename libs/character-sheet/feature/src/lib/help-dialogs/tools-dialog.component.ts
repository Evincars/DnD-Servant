import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'tools-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Pomůcky
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/pomucky-1.png" style="width: 1060px;" />
        <img src="rules/pomucky-2.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Řemeslnické pomůcky</h3>
          <table class="hd-table"><thead><tr><th>Pomůcka</th><th>Cena</th><th>Váha</th></tr></thead><tbody>
            <tr><td>Alchymistická souprava</td><td>50 zl</td><td>8 lb</td></tr>
            <tr><td>Kovářské nářadí</td><td>20 zl</td><td>8 lb</td></tr>
            <tr><td>Pivovarské suroviny</td><td>20 zl</td><td>9 lb</td></tr>
            <tr><td>Kaligrafické potřeby</td><td>10 zl</td><td>5 lb</td></tr>
            <tr><td>Tesařské nářadí</td><td>8 zl</td><td>6 lb</td></tr>
            <tr><td>Kartografické nástroje</td><td>15 zl</td><td>6 lb</td></tr>
            <tr><td>Ševcovské nářadí</td><td>5 zl</td><td>5 lb</td></tr>
            <tr><td>Kuchařské náčiní</td><td>1 zl</td><td>8 lb</td></tr>
            <tr><td>Sklářské nářadí</td><td>30 zl</td><td>5 lb</td></tr>
            <tr><td>Klenotnický nástroj</td><td>25 zl</td><td>2 lb</td></tr>
            <tr><td>Koželužské nářadí</td><td>5 zl</td><td>5 lb</td></tr>
            <tr><td>Zednické nářadí</td><td>10 zl</td><td>8 lb</td></tr>
            <tr><td>Malířské potřeby</td><td>10 zl</td><td>5 lb</td></tr>
            <tr><td>Hrnčířské nářadí</td><td>10 zl</td><td>3 lb</td></tr>
            <tr><td>Tkalcovské nářadí</td><td>1 zl</td><td>5 lb</td></tr>
            <tr><td>Řezbářské nářadí</td><td>1 zl</td><td>5 lb</td></tr>
            <tr><td>Cínářské nářadí</td><td>50 zl</td><td>10 lb</td></tr>
          </tbody></table>

          <h3>Ostatní pomůcky</h3>
          <table class="hd-table"><thead><tr><th>Pomůcka</th><th>Cena</th><th>Váha</th></tr></thead><tbody>
            <tr><td>Souprava pro přestrojování</td><td>25 zl</td><td>3 lb</td></tr>
            <tr><td>Padělatelská souprava</td><td>15 zl</td><td>5 lb</td></tr>
            <tr><td>Herní souprava (kostky)</td><td>1 st</td><td>—</td></tr>
            <tr><td>Herní souprava (karty)</td><td>5 st</td><td>—</td></tr>
            <tr><td>Herní souprava (šachy apod.)</td><td>1 zl</td><td>½ lb</td></tr>
            <tr><td>Bylinkářská souprava</td><td>5 zl</td><td>3 lb</td></tr>
            <tr><td>Navigační pomůcky</td><td>25 zl</td><td>2 lb</td></tr>
            <tr><td>Travičská souprava</td><td>50 zl</td><td>2 lb</td></tr>
            <tr><td>Zlodějské náčiní</td><td>25 zl</td><td>1 lb</td></tr>
          </tbody></table>

          <h3>Hudební nástroje</h3>
          <table class="hd-table"><thead><tr><th>Nástroj</th><th>Cena</th><th>Váha</th></tr></thead><tbody>
            <tr><td>Buben</td><td>6 zl</td><td>3 lb</td></tr>
            <tr><td>Dudy</td><td>30 zl</td><td>6 lb</td></tr>
            <tr><td>Flétna</td><td>2 zl</td><td>1 lb</td></tr>
            <tr><td>Loutna</td><td>35 zl</td><td>2 lb</td></tr>
            <tr><td>Lyra</td><td>30 zl</td><td>2 lb</td></tr>
            <tr><td>Roh</td><td>3 zl</td><td>2 lb</td></tr>
            <tr><td>Šalmaj</td><td>2 zl</td><td>1 lb</td></tr>
            <tr><td>Viola</td><td>30 zl</td><td>1 lb</td></tr>
            <tr><td>Cimbál</td><td>25 zl</td><td>10 lb</td></tr>
          </tbody></table>

          <h4>Zdatnost v pomůckách</h4>
          <p>Se zdatností v pomůcce přičteš bonus zdatnosti k ověření vlastnosti při jejím použití. Bez zdatnosti pomůcku použít nelze (u zlodějského náčiní) nebo bez bonusu.</p>
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
export class ToolsDialogComponent {
  dialogRef = inject(MatDialogRef<ToolsDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openToolsDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ToolsDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
