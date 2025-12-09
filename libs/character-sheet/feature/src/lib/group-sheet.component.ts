import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'group-sheet',
  template: `
    <img src="group-sheet-1.png" alt="Group Sheet" height="1817" width="1293" />
    <img src="group-sheet-2.png" alt="Group Sheet" height="1817" width="1293" />

    <form></form>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class GroupSheetComponent {}
