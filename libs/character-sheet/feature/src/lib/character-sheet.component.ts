import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'character-sheet',
  template: `
    <img src="character-sheet.png" alt="Character Sheet" height="1817" width="1293" />

    <input id="name" class="field" style="top:5.1%; left:4.5%; width:14%;" placeholder="Rasa" />
    <input id="name" class="field" style="top:5.1%; left:19.5%; width:14%;" placeholder="Povolání" />

    <input id="name" class="field" style="top:8.7%; left:4.5%; width:14%;" placeholder="Zázemí" />
    <input id="name" class="field" style="top:8.7%; left:19.5%; width:14%;" placeholder="Přesvědčení" />

    <input id="name" class="field" style="top:8%; left:42%; width:15%; text-align: center" placeholder="Jméno postavy" />

    <input id="name" class="field" style="top:5.1%; left:65.5%; width:14%;" placeholder="Úroveň" />
    <input id="name" class="field" style="top:5.1%; left:80.3%; width:14%;" placeholder="Zkušenost" />

    <input id="name" class="field" style="top:8.7%; left:65.5%; width:14%;" placeholder="Hráč" />
  `,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    .field {
      position: absolute;
      box-sizing: border-box;
      pointer-events: auto;
      background: transparent;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius:4px;
      padding:4px 6px;
      font-size: clamp(10px, 1vw, 14px);
      color: black;
      outline:none;
    }
    .field:focus {
      box-shadow:0 0 0 3px rgba(63,131,255,0.18);
      border-color: #3f83ff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class CharacterSheetComponent {}
