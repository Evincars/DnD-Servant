import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'character-sheet',
  template: `
    <img src="./assets/character-sheet.png" alt="Character Sheet" />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class CharacterSheetComponent {}
