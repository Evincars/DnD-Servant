import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'group-sheet',
  template: `
    <img src="group-sheet-1.png" alt="Group Sheet" height="1817" width="1293" />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class GroupSheetComponent {}
