import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'character-sheet',
  template: `
    <img src="character-sheet.png" alt="Character Sheet" height="1817" width="1293" />

    <input class="field" style="top:5.1%; left:4.5%; width:14%;" placeholder="Rasa" />
    <input class="field" style="top:5.1%; left:19.5%; width:14%;" placeholder="Povolání" />

    <input class="field" style="top:8.7%; left:4.5%; width:14%;" placeholder="Zázemí" />
    <input class="field" style="top:8.7%; left:19.5%; width:14%;" placeholder="Přesvědčení" />

    <input class="field" style="top:8%; left:42%; width:15%; text-align: center; font-weight: bold" placeholder="Jméno postavy" />

    <input class="field" style="top:5.1%; left:65.5%; width:14%;" placeholder="Úroveň" />
    <input class="field" style="top:5.1%; left:80.3%; width:14%;" placeholder="Zkušenost" />

    <input class="field" style="top:8.7%; left:65.5%; width:14%;" placeholder="Hráč" />

    <input class="field" style="top:15.1%; left:14.0%; width:3.4%; text-align: center" placeholder="ZB" />
    <input class="field" style="top:15.1%; left:34.0%; width:3.4%; text-align: center" placeholder="*" />
    <input class="field" style="top:15.1%; left:47.9%; width:3.4%; text-align: center" placeholder="In." />

    <input class="field" style="top:17%; left:63.3%; width:8.4%;" placeholder="Lehké" />
    <input class="field" style="top:17%; left:72.7%; width:8.4%;" placeholder="Střední" />
    <input class="field" style="top:17%; left:81.9%; width:8.4%;" placeholder="Střední" />

    <input class="field" style="top:23.1%; left:67.2%; width:13.9%;" placeholder="Použití kostek" />
    <input class="field" style="top:25%; left:67.2%; width:13.9%;" placeholder="Max" />

    <!--    Hearts for Dead saving -->
    <input type="checkbox" class="field checkbox" style="top:23.5%; left:83.5%;" />
    <input type="checkbox" class="field checkbox" style="top:23.5%; left:85.9%;" />
    <input type="checkbox" class="field checkbox" style="top:23.5%; left:88.3%;" />

    <!--    Skulls for Death saving -->
    <input type="checkbox" class="field checkbox" style="top:25.2%; left:83.5%;" />
    <input type="checkbox" class="field checkbox" style="top:25.2%; left:85.9%;" />
    <input type="checkbox" class="field checkbox" style="top:25.2%; left:88.2%;" />

    <textarea class="field textarea" style="top:30%; left:63.7%; width:26.7%; height:432px;" placeholder="Poznámky..."></textarea>

    <input class="field" style="top:22.9%; left:36.5%; width:4.7%; text-align: center;" placeholder="Zbroj" />
    <input class="field" style="top:22.9%; left:44.5%; width:4.7%; text-align: center;" placeholder="Bez" />
    <input class="field" style="top:22.9%; left:52.9%; width:4.7%; text-align: center;" placeholder="Jiné" />

    <!--    Proficiency with armors -->
    <input type="checkbox" class="field checkbox" style="top:26.5%; left:34.3%;" />
    <input type="checkbox" class="field checkbox" style="top:26.5%; left:41.3%;" />
    <input type="checkbox" class="field checkbox" style="top:26.5%; left:49.2%;" />
    <input type="checkbox" class="field checkbox" style="top:26.5%; left:56.1%;" />

    <!--    Saving throws -->
    <input type="checkbox" class="field checkbox" style="top:31.5%; left:33.8%;" />
    <input class="field" style="top:30.8%; left:42.3%; width:4.7%; text-align: center;" placeholder="SIL" />
    <input type="checkbox" class="field checkbox" style="top:33%; left:33.8%;" />
    <input class="field" style="top:32.4%; left:42.3%; width:4.7%; text-align: center;" placeholder="OBR" />
    <input type="checkbox" class="field checkbox" style="top:34.6%; left:33.8%;" />
    <input class="field" style="top:34%; left:42.3%; width:4.7%; text-align: center;" placeholder="ODL" />
    <input type="checkbox" class="field checkbox" style="top:36.2%; left:33.8%;" />
    <input class="field" style="top:35.6%; left:42.3%; width:4.7%; text-align: center;" placeholder="INT" />
    <input type="checkbox" class="field checkbox" style="top:37.7%; left:33.8%;" />
    <input class="field" style="top:37.2%; left:42.3%; width:4.7%; text-align: center;" placeholder="MDR" />
    <input type="checkbox" class="field checkbox" style="top:39.3%; left:33.8%;" />
    <input class="field" style="top:38.7%; left:42.3%; width:4.7%; text-align: center;" placeholder="CHA" />

    <!--    passive skills -->
    <input type="checkbox" class="field checkbox" style="top:31.5%; left:48.1%;" />
    <input class="field" style="top:30.8%; left:56.7%; width:4.7%; text-align: center;" placeholder="ATL" />
    <input type="checkbox" class="field checkbox" style="top:33%; left:48.1%;" />
    <input class="field" style="top:32.4%; left:56.7%; width:4.7%; text-align: center;" placeholder="AKR" />
    <input type="checkbox" class="field checkbox" style="top:34.6%; left:48.1%;" />
    <input class="field" style="top:34%; left:56.7%; width:4.7%; text-align: center;" placeholder="NEN" />
    <input type="checkbox" class="field checkbox" style="top:36.2%; left:48.1%;" />
    <input class="field" style="top:35.6%; left:56.7%; width:4.7%; text-align: center;" placeholder="VHL" />
    <input type="checkbox" class="field checkbox" style="top:37.7%; left:48.1%;" />
    <input class="field" style="top:37.2%; left:56.7%; width:4.7%; text-align: center;" placeholder="VNI" />
    <!--    <input type="checkbox" class="field checkbox" style="top:39.3%; left:48.1%;" />-->
    <!--    <input class="field" style="top:38.7%; left:56.7%; width:4.7%; text-align: center;" placeholder="-" />-->

    <input class="field" style="top:44.2%; left:33.8%; width:11%;" placeholder="Vlastnost" />
    <input class="field" style="top:44.2%; left:46.1%; width:7.2%;" placeholder="Út bonus" />
    <input class="field" style="top:44.2%; left:54.1%; width:7.2%;" placeholder="SO záchr." />

    <!--    main 6 skills-->
    <input class="field" style="top:18.6%; left:6.0%; width:3.8%; text-align: center" placeholder="SIL" />
    <input class="field" style="top:20.8%; left:6.0%; width:3.8%; text-align: center" placeholder="SIL" />
    <input class="field" style="top:27.8%; left:6.0%; width:3.8%; text-align: center" placeholder="OBR" />
    <input class="field" style="top:30.0%; left:6.0%; width:3.8%; text-align: center" placeholder="OBR" />
    <input class="field" style="top:37.4%; left:6.0%; width:3.8%; text-align: center" placeholder="ODL" />
    <input class="field" style="top:39.6%; left:6.0%; width:3.8%; text-align: center" placeholder="ODL" />
    <input class="field" style="top:47%; left:6.0%; width:3.8%; text-align: center" placeholder="INT" />
    <input class="field" style="top:49.1%; left:6.0%; width:3.8%; text-align: center" placeholder="INT" />
    <input class="field" style="top:56.3%; left:6.0%; width:3.8%; text-align: center" placeholder="MDR" />
    <input class="field" style="top:58.4%; left:6.0%; width:3.8%; text-align: center" placeholder="MDR" />
    <input class="field" style="top:65.8%; left:6.0%; width:3.8%; text-align: center" placeholder="CHA" />
    <input class="field" style="top:68%; left:6.0%; width:3.8%; text-align: center" placeholder="CHA" />

    <!--    =============================================-->
    <!--    detailed skills-->
    <input id="atletikaZdatnost" type="checkbox" class="field checkbox" style="top:22.8%; left:13.9%;" />
    <input id="atletika" class="field" style="top:22.2%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="akrobacieZdatnost" type="checkbox" class="field checkbox" style="top:26%; left:13.9%;" />
    <input id="akrobacie" class="field" style="top:25.4%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="cachryZdatnost" type="checkbox" class="field checkbox" style="top:27.5%; left:13.9%;" />
    <input id="cachry" class="field" style="top:27%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="nenapadnostZdatnost" type="checkbox" class="field checkbox" style="top:29.1%; left:13.9%;" />
    <input id="nenapadnost" class="field" style="top:28.6%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />

    <input id="historieZdatnost" type="checkbox" class="field checkbox" style="top:32.6%; left:13.9%;" />
    <input id="historie" class="field" style="top:32%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="mystikaZdatnost" type="checkbox" class="field checkbox" style="top:34.1%; left:13.9%;" />
    <input id="mystika" class="field" style="top:33.6%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="nabozenstviZdatnost" type="checkbox" class="field checkbox" style="top:35.7%; left:13.9%;" />
    <input id="nabozenstvi" class="field" style="top:35.2%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="patraniZdatnost" type="checkbox" class="field checkbox" style="top:37.3%; left:13.9%;" />
    <input id="patrani" class="field" style="top:36.7%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="prirodaZdatnost" type="checkbox" class="field checkbox" style="top:38.8%; left:13.9%;" />
    <input id="priroda" class="field" style="top:38.3%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />

    <input id="lekarstviZdatnost" type="checkbox" class="field checkbox" style="top:42.3%; left:13.9%;" />
    <input id="lekarstvi" class="field" style="top:41.7%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="ovladaniZviratZdatnost" type="checkbox" class="field checkbox" style="top:43.8%; left:13.9%;" />
    <input id="ovladaniZvirat" class="field" style="top:43.3%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="prezitiZdatnost" type="checkbox" class="field checkbox" style="top:45.4%; left:13.9%;" />
    <input id="preziti" class="field" style="top:44.8%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="vhledZdatnost" type="checkbox" class="field checkbox" style="top:46.9%; left:13.9%;" />
    <input id="vhled" class="field" style="top:46.4%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="vnimaniZdatnost" type="checkbox" class="field checkbox" style="top:48.5%; left:13.9%;" />
    <input id="vnimani" class="field" style="top:48%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />

    <input id="klamaniZdatnost" type="checkbox" class="field checkbox" style="top:52%; left:13.9%;" />
    <input id="klamani" class="field" style="top:51.4%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="presvedcovaniZdatnost" type="checkbox" class="field checkbox" style="top:53.5%; left:13.9%;" />
    <input id="presvedcovani" class="field" style="top:53%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="vystupovaniZdatnost" type="checkbox" class="field checkbox" style="top:55.1%; left:13.9%;" />
    <input id="vystupovani" class="field" style="top:54.6%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <input id="zastrasovaniZdatnost" type="checkbox" class="field checkbox" style="top:56.7%; left:13.9%;" />
    <input id="zastrasovani" class="field" style="top:56.1%; left:26.6%; width:5.4%; text-align: center" placeholder="*" />
    <!--    =============================================-->

    <textarea class="field textarea" style="top:62%; left:13.9%; width:18.1%; height:167px;" placeholder="Pomůcky..."></textarea>
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
      border-radius: var(--border-radius-1);
      padding: 4px 6px;
      font-size: clamp(16px, 4vw, 16px);
      font-weight: bold;
      color: black;
      outline: none;
    }
    .field:focus {
      box-shadow:0 0 0 3px rgba(63,131,255,0.18);
      border-color: #3f83ff;
    }
    .checkbox {
      width: 15px;
      height: 15px;
      /*accent-color: #3f83ff; !* Optional: matches focus color *!*/
      background: transparent;
      border-radius: var(--border-radius-1);
      border: 1px solid rgba(0,0,0,0.12);
      box-sizing: border-box;
      outline: none;
    }
    .checkbox:focus {
      box-shadow: 0 0 0 3px rgba(63,131,255,0.18);
      border-color: #3f83ff;
    }
    .textarea {
      resize: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class CharacterSheetComponent {}
