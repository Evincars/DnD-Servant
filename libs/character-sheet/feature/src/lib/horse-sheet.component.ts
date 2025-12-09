import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'horse-sheet',
  template: `
    <img src="horse-sheet-v1.png" alt="Character Sheet" height="2853" width="1293" />

    <form></form>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class HorseSheetComponent {}
