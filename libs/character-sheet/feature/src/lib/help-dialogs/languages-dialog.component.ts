import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'languages-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Jazyky
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/jazyky.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Jazyky</h3>
          <table class="hd-table">
            <thead><tr><th>Jazyk</th><th>Typičtí mluvčí</th><th>Písmo</th></tr></thead>
            <tbody>
              <tr><td><strong>Obecná řeč</strong></td><td>Lidé, většina ras</td><td>Obecné</td></tr>
              <tr><td><strong>Elfština</strong></td><td>Elfové</td><td>Elfské</td></tr>
              <tr><td><strong>Trpasličtina</strong></td><td>Trpaslíci</td><td>Trpasličí</td></tr>
              <tr><td><strong>Gnómština</strong></td><td>Gnómové</td><td>Trpasličí</td></tr>
              <tr><td><strong>Hobití</strong></td><td>Hobiti (Půlčíci)</td><td>Obecné</td></tr>
              <tr><td><strong>Orkština</strong></td><td>Orkové</td><td>Trpasličí</td></tr>
              <tr><td><strong>Drakonština</strong></td><td>Draci, Drakorození</td><td>Drakonské</td></tr>
              <tr><td><strong>Goblinština</strong></td><td>Goblini, Skřeti, Bugbear</td><td>Trpasličí</td></tr>
            </tbody>
          </table>

          <h4>Exotické jazyky</h4>
          <table class="hd-table">
            <thead><tr><th>Jazyk</th><th>Typičtí mluvčí</th><th>Písmo</th></tr></thead>
            <tbody>
              <tr><td><strong>Ďábelština</strong></td><td>Ďáblové</td><td>Pekelné</td></tr>
              <tr><td><strong>Démonština</strong></td><td>Démoni</td><td>Pekelné</td></tr>
              <tr><td><strong>Hlubinná řeč</strong></td><td>Mozkožrouti, Beholdeři</td><td>—</td></tr>
              <tr><td><strong>Nebeština</strong></td><td>Andělé, Nebeští</td><td>Nebeské</td></tr>
              <tr><td><strong>Prvotština</strong></td><td>Elementálové</td><td>Trpasličí</td></tr>
              <tr><td><strong>Sylvánština</strong></td><td>Vílí tvorové</td><td>Elfské</td></tr>
              <tr><td><strong>Temnobecná</strong></td><td>Drowové, tvorové Temných říší</td><td>Elfské</td></tr>
              <tr><td><strong>Gigantština</strong></td><td>Obři, Zlobři</td><td>Trpasličí</td></tr>
            </tbody>
          </table>
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
    .hd-table { width: 100%; border-collapse: collapse; margin: 6px 0 14px; font-size: 12px; }
    .hd-table thead tr th { background: rgba(200,160,60,.1); color: rgba(200,160,60,.8); text-align: left; padding: 5px 8px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1px solid rgba(200,160,60,.25); }
    .hd-table tbody tr td { padding: 4px 8px; color: #c8b896; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: top; }
    .hd-table tbody tr:last-child td { border-bottom: none; }
  `,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagesDialogComponent {
  dialogRef = inject(MatDialogRef<LanguagesDialogComponent>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function openLanguagesDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(LanguagesDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
