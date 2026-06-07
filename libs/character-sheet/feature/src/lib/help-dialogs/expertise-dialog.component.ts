import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'expertise-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Odbornosti
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/odbornost-1.png" style="width: 1060px;" />
        <img src="rules/odbornost-2.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Zdatnost a odbornost (Proficiency & Expertise)</h3>

          <h4>Zdatnost (Proficiency)</h4>
          <p>Když máš zdatnost v dovednosti, nástroji nebo záchranném hodu, přidáš svůj <strong>bonus zdatnosti</strong> k hodu k20.</p>
          <table class="hd-table"><thead><tr><th>Úroveň</th><th>Bonus zdatnosti</th></tr></thead><tbody>
            <tr><td>1–4</td><td>+2</td></tr>
            <tr><td>5–8</td><td>+3</td></tr>
            <tr><td>9–12</td><td>+4</td></tr>
            <tr><td>13–16</td><td>+5</td></tr>
            <tr><td>17–20</td><td>+6</td></tr>
          </tbody></table>

          <h4>Odbornost (Expertise)</h4>
          <p>Některá povolání (Tulák, Bard) získají odbornost — bonus zdatnosti se <strong>zdvojnásobí</strong> pro vybrané dovednosti nebo pomůcky.</p>
          <ul>
            <li><strong>Tulák (1. úroveň):</strong> Vyber 2 dovednosti, ve kterých máš zdatnost → zdvojnásob bonus.</li>
            <li><strong>Tulák (6. úroveň):</strong> Vyber další 2 dovednosti.</li>
            <li><strong>Bard (3. úroveň):</strong> Vyber 2 dovednosti → zdvojnásob bonus.</li>
            <li><strong>Bard (10. úroveň):</strong> Vyber další 2 dovednosti.</li>
          </ul>

          <h4>Pasivní ověření</h4>
          <p>Pasivní hodnota = <strong>10 + všechny opravy</strong>, které se normálně uplatní (zdatnost, oprava vlastnosti). Výhoda přičítá +5, nevýhoda odečítá −5.</p>

          <h4>Spolupráce (skupinové ověření)</h4>
          <p>Pokud více postav provádí totéž, uspěje skupina, pokud uspěje alespoň polovina členů.</p>
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
export class ExpertiseDialogComponent {
  dialogRef = inject(MatDialogRef<ExpertiseDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openExpertiseDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(ExpertiseDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
