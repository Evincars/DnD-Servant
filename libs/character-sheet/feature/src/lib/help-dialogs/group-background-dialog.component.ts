import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'group-background-dialog',
  template: `
    <div class="dialog-title" mat-dialog-title>
      Skupinové zázemí
      <span class="hd-toggle" (click)="showImages.set(!showImages())">
        <span class="hd-toggle__label">{{ showImages() ? 'IMG' : 'TXT' }}</span>
        <span class="hd-toggle__track" [class.active]="!showImages()"><span class="hd-toggle__thumb"></span></span>
      </span>
      <button (click)="onClose()" matIconButton color="primary"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
        <img src="rules/skupinove-zazemi-1.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-2.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-3.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-4.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-5.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-6.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-7.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-8.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-9.png" style="width: 1060px;" />
        <img src="rules/skupinove-zazemi-10.png" style="width: 1060px;" />
      } @else {
        <div class="hd-text">
          <h3>Skupinové zázemí</h3>
          <p>Skupinové zázemí definuje, jak se družina postav dala dohromady a co je spojuje. Poskytuje sdílené výhody celé skupině.</p>

          <h4>Jak to funguje</h4>
          <ul>
            <li>Skupina si na začátku kampaně vybere jedno společné zázemí</li>
            <li>Každý člen získá schopnosti individuálního zázemí + skupinový bonus</li>
            <li>Skupinové zázemí dává kontext: proč jste spolu a kam míříte</li>
          </ul>

          <h3>Příklady skupinových zázemí</h3>

          <h4>Žoldnéři</h4>
          <p>Družina najímá své služby za zlato. Výhoda: kontakty v podsvětí, přístup k zakázkám a nájemným desky.</p>

          <h4>Průzkumníci</h4>
          <p>Procházíte nezmapované teritorium. Výhoda: bonus k přežití v divočině, snazší orientace.</p>

          <h4>Obchodníci</h4>
          <p>Provozujete karavanu nebo obchod. Výhoda: snadnější přístup ke zboží, kontakty mezi kupci.</p>

          <h4>Strážci řádu</h4>
          <p>Sloužíte určité organizaci nebo božstvu. Výhoda: podpora od organizace, přístup k informacím.</p>

          <h4>Psanci</h4>
          <p>Jste na útěku nebo mimo zákon. Výhoda: úkryty, kontakty v podsvětí, schopnost se skrýt.</p>

          <h4>Šlechtická družina</h4>
          <p>Sloužíte šlechtici nebo sami pocházíte z nobility. Výhoda: finanční zdroje, politické kontakty.</p>

          <h3>Vytvoření vlastního skupinového zázemí</h3>
          <ul>
            <li><strong>Koncept:</strong> Co skupinu spojuje?</li>
            <li><strong>Sdílená zdatnost:</strong> 1 pomůcka nebo jazyk pro všechny</li>
            <li><strong>Schopnost:</strong> 1 roleplayová výhoda</li>
            <li><strong>Vybavení:</strong> Sdílené zásoby nebo prostředek (vůz, loď, základna)</li>
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
export class GroupBackgroundDialogComponent {
  dialogRef = inject(MatDialogRef<GroupBackgroundDialogComponent>);
  showImages = signal(true);
  onClose() { this.dialogRef.close(); }
}

export function openGroupBackgroundDialog(dialog: MatDialog): Observable<void> {
  return dialog.open(GroupBackgroundDialogComponent, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
