import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'horse-sheet',
  template: `
    <img src="horse-sheet-v1.png" alt="Character Sheet" height="1817" width="1293" />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class HorseSheetComponent {}
