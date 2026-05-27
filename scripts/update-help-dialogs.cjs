const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'libs', 'character-sheet', 'feature', 'src', 'lib', 'help-dialogs');

const configs = [
  { file: 'weapons-dialog.component.ts', cls: 'WeaponsDialogComponent', selector: 'weapons-dialog', title: 'Zbran\u011b', imgs: ['rules/zbrane-1.png', 'rules/zbrane-2.png'], fn: 'openWeaponsDialog' },
  { file: 'weapons-and-armors-dialog.component.ts', cls: 'WeaponsAndArmorsDialogComponent', selector: 'weapons-and-armors-dialog', title: 'Tabulka zbran\u00ed a zbroj\u00ed', imgs: ['rules/tabulka-zbrani-a-zbroji.png', 'rules/tabulka-zbrani-a-zbroji-2.png'], fn: 'openWeaponsAndArmorsDialog' },
  { file: 'damages-dialog.component.ts', cls: 'DamagesDialogComponent', selector: 'damages-dialog', title: 'Bojov\u00e9 a p\u0159etrvávaj\u00edc\u00ed zran\u011bn\u00ed', imgs: ['rules/bojova-zraneni.png', 'rules/bojova-zraneni-tabulka.png', 'rules/pretrvavajici-zraneni.png', 'rules/body-vydrze-1.png', 'rules/body-vydrze-2.png'], fn: 'openDamagesDialog' },
  { file: 'expertise-dialog.component.ts', cls: 'ExpertiseDialogComponent', selector: 'expertise-dialog', title: 'Odbornosti', imgs: ['rules/odbornost-1.png', 'rules/odbornost-2.png'], fn: 'openExpertiseDialog' },
  { file: 'alchemist-dialog.component.ts', cls: 'AlchemistDialogComponent', selector: 'alchemist-dialog', title: 'Alchymistick\u00e1 truhla', imgs: ['rules/alchemist-1.png', 'rules/alchemist-2.png', 'rules/alchemist-3.png'], fn: 'openAlchemistDialog' },
  { file: 'animals-dialog.component.ts', cls: 'AnimalsDialogComponent', selector: 'animals-dialog', title: 'Zv\u00ed\u0159ata a jejich nosnost', imgs: ['rules/jezdecka-zvirata-a-dopravni-prostredky-1.png', 'rules/jezdecka-zvirata-a-dopravni-prostredky-2.png'], fn: 'openAnimalsDialog' },
  { file: 'conviction-dialog.component.ts', cls: 'ConvictionDialogComponent', selector: 'conviction-dialog', title: 'P\u0159esv\u011bd\u010den\u00ed postavy', imgs: ['rules/presvedceni-1.png', 'rules/presvedceni-2.png', 'rules/presvedceni-3.png'], fn: 'openConvictionDialog' },
  { file: 'maneuvers-dialog.component.ts', cls: 'ManeuversDialogComponent', selector: 'maneuvers-dialog', title: 'Man\u00e9vry (Akce)', imgs: ['rules/manevry-0.png', 'rules/manevry-1.png', 'rules/manevry-2.png', 'rules/manevry-3.png', 'rules/manevry-4.png', 'rules/manevry-5.png'], fn: 'openManeuversDialog' },
  { file: 'spells-dialog.component.ts', cls: 'SpellsDialogComponent', selector: 'spells-dialog', title: 'Seznam kouzel', imgs: ['rules/kouzla-1.png', 'rules/kouzla-2.png', 'rules/kouzla-3.png', 'rules/kouzla-4.png'], fn: 'openSpellsDialog' },
  { file: 'tools-dialog.component.ts', cls: 'ToolsDialogComponent', selector: 'tools-dialog', title: 'Pom\u016fcky', imgs: ['rules/pomucky-1.png', 'rules/pomucky-2.png'], fn: 'openToolsDialog' },
  { file: 'background-dialog.component.ts', cls: 'BackgroundDialogComponent', selector: 'background-dialog', title: 'Z\u00e1zem\u00ed postavy', imgs: ['rules/zazemi-1.png', 'rules/zazemi-2.png', 'rules/zazemi-3.png', 'rules/zazemi-4.png', 'rules/zazemi-5.png'], fn: 'openBackgroundDialog' },
  { file: 'group-background-dialog.component.ts', cls: 'GroupBackgroundDialogComponent', selector: 'group-background-dialog', title: 'Skupinov\u00e9 z\u00e1zem\u00ed', imgs: Array.from({length:10},(_,i)=>'rules/skupinove-zazemi-'+(i+1)+'.png'), fn: 'openGroupBackgroundDialog' },
];

for (const c of configs) {
  const imgsHtml = c.imgs.map(img => `        <img src="${img}" style="width: 1060px;" />`).join('\n');
  const content = `import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: '${c.selector}',
  template: \`
    <div class="dialog-title" mat-dialog-title>
      ${c.title}
      <button (click)="showImages.set(!showImages())" matIconButton style="margin-left:auto;margin-right:4px">
        <mat-icon>{{ showImages() ? 'article' : 'image' }}</mat-icon>
      </button>
      <button (click)="onClose()" matIconButton color="primary">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content class="dialog-content">
      @if (showImages()) {
${imgsHtml}
      } @else {
        <div class="hd-text">
          <p style="text-align:center;color:rgba(200,160,60,.4);padding:40px 20px;font-style:italic">Textov\u00e1 verze bude brzy k dispozici.<br>P\u0159epni na obr\u00e1zky pomoc\u00ed tla\u010d\u00edtka v\u00fd\u0161e.</p>
        </div>
      }
    </mat-dialog-content>
  \`,
  styles: \`
    .hd-text { padding: 16px 24px 24px; color: #d4c9a0; font-family: sans-serif; font-size: 13px; line-height: 1.6; }
  \`,
  imports: [MatDialogContent, MatDialogTitle, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${c.cls} {
  dialogRef = inject(MatDialogRef<${c.cls}>);
  showImages = signal(true);

  onClose() {
    this.dialogRef.close();
  }
}

export function ${c.fn}(dialog: MatDialog): Observable<void> {
  return dialog.open(${c.cls}, { minWidth: '1100px', maxWidth: '1100px' }).afterClosed();
}
`;
  fs.writeFileSync(path.join(dir, c.file), content, 'utf8');
  console.log('Written: ' + c.file);
}
console.log('Done!');

