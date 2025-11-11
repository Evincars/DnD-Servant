import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dm-screen',
  template: `
    <img src="dm-screen/dm-screen-1.png" alt="DM Screen" class="u-w-100" />
    <img src="dm-screen/dm-screen-2.png" alt="DM Screen" class="u-w-100" />
    <img src="dm-screen/dm-screen-3.png" alt="DM Screen" class="u-w-100" />
    <img src="dm-screen/dm-screen-4.png" alt="DM Screen" class="u-w-100" />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class DmScreenComponent {}
