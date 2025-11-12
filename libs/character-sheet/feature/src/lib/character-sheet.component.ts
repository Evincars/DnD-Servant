import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  CharacterSheetForm,
  TopInfoForm,
  AbilityBonusForm,
  SpeedAndHealingDicesForm,
  ArmorClassForm,
  SavingThrowsForm,
  PassiveSkillsForm,
  SpellsAndAlchemistChestForm,
} from '@dn-d-servant/character-sheet-util';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { CharacterSheetFormModelMappers } from './character-sheet-form-model-mappers';

@Component({
  selector: 'character-sheet',
  template: `
    <img src="character-sheet.png" alt="Character Sheet" height="1817" width="1293" />

    <form [formGroup]="form">
      <input [formControl]="topInfoControls.rasa" class="field" style="top:5.1%; left:4.5%; width:14%;" placeholder="Rasa" />
      <input
        [formControl]="topInfoControls.povolani"
        class="field"
        style="top:5.1%; left:19.5%; width:14%;"
        placeholder="Povolání"
      />

      <input [formControl]="topInfoControls.zazemi" class="field" style="top:8.7%; left:4.5%; width:14%;" placeholder="Zázemí" />
      <input
        [formControl]="topInfoControls.presvedceni"
        class="field"
        style="top:8.7%; left:19.5%; width:14%;"
        placeholder="Přesvědčení"
      />

      <input
        [formControl]="topInfoControls.jmenoPostavy"
        class="field"
        style="top:8%; left:42%; width:15%; text-align: center; font-weight: bold"
        placeholder="Jméno postavy"
      />

      <input [formControl]="topInfoControls.uroven" class="field" style="top:5.1%; left:65.5%; width:14%;" placeholder="Úroveň" />
      <input
        [formControl]="topInfoControls.zkusenosti"
        class="field"
        style="top:5.1%; left:80.3%; width:14%;"
        placeholder="Zkušenost"
      />

      <input [formControl]="topInfoControls.hrac" class="field" style="top:8.7%; left:65.5%; width:14%;" placeholder="Hráč" />

      <input
        [formControl]="abilityBonusControls.zdatnostniBonus"
        class="field"
        style="top:15.1%; left:14.0%; width:3.4%; text-align: center"
        placeholder="ZB"
      />
      <input
        [formControl]="abilityBonusControls.inspirace"
        class="field"
        style="top:15.1%; left:34.0%; width:3.4%; text-align: center"
        placeholder="*"
      />
      <input
        [formControl]="abilityBonusControls.iniciativa"
        class="field"
        style="top:15.1%; left:47.9%; width:3.4%; text-align: center"
        placeholder="In."
      />

      <input
        [formControl]="speedAndHealingDicesControls.lehke"
        class="field"
        style="top:17%; left:63.3%; width:8.4%;"
        placeholder="Lehké"
      />
      <input
        [formControl]="speedAndHealingDicesControls.stredni"
        class="field"
        style="top:17%; left:72.7%; width:8.4%;"
        placeholder="Střední"
      />
      <input
        [formControl]="speedAndHealingDicesControls.tezke"
        class="field"
        style="top:17%; left:81.9%; width:8.4%;"
        placeholder="Těžké"
      />

      <input
        [formControl]="speedAndHealingDicesControls.maxBoduVydrze"
        class="field"
        style="top:15.8%; left:91.1%; width:5.2%;"
        placeholder="Max. BV"
      />

      <input
        [formControl]="speedAndHealingDicesControls.pouzitiKostek"
        class="field"
        style="top:23.1%; left:67.2%; width:13.9%;"
        placeholder="Použití kostek"
      />
      <input
        [formControl]="speedAndHealingDicesControls.maxPouzitiKostek"
        class="field"
        style="top:25%; left:67.2%; width:13.9%;"
        placeholder="Max"
      />

      <!--    Hearts for Dead saving -->
      <input
        [formControl]="speedAndHealingDicesControls.smrtUspech1"
        type="checkbox"
        class="field checkbox"
        style="top:23.5%; left:83.5%;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtUspech2"
        type="checkbox"
        class="field checkbox"
        style="top:23.5%; left:85.9%;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtUspech3"
        type="checkbox"
        class="field checkbox"
        style="top:23.5%; left:88.3%;"
      />

      <!--    Skulls for Death saving -->
      <input
        [formControl]="speedAndHealingDicesControls.smrtNeuspech1"
        type="checkbox"
        class="field checkbox"
        style="top:25.2%; left:83.5%;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtNeuspech2"
        type="checkbox"
        class="field checkbox"
        style="top:25.2%; left:85.9%;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtNeuspech3"
        type="checkbox"
        class="field checkbox"
        style="top:25.2%; left:88.2%;"
      />

      <textarea
        [formControl]="form.controls['infoAboutCharacter']"
        class="field textarea"
        style="top:30%; left:63.7%; width:26.7%; height:432px;"
        placeholder="Poznámky..."
      ></textarea>

      <input
        [formControl]="armorClassControls.zbroj"
        class="field"
        style="top:22.9%; left:36.5%; width:4.7%; text-align: center;"
        placeholder="Zbroj"
      />
      <input
        [formControl]="armorClassControls.bezeZbroje"
        class="field"
        style="top:22.9%; left:44.5%; width:4.7%; text-align: center;"
        placeholder="Bez"
      />
      <input
        [formControl]="armorClassControls.jine"
        class="field"
        style="top:22.9%; left:52.9%; width:4.7%; text-align: center;"
        placeholder="Jiné"
      />

      <!--    Proficiency with armors -->
      <input
        [formControl]="armorClassControls.zdatnostLehke"
        type="checkbox"
        class="field checkbox"
        style="top:26.5%; left:34.3%;"
      />
      <input
        [formControl]="armorClassControls.zdatnostStredni"
        type="checkbox"
        class="field checkbox"
        style="top:26.5%; left:41.3%;"
      />
      <input
        [formControl]="armorClassControls.zdatnostTezke"
        type="checkbox"
        class="field checkbox"
        style="top:26.5%; left:49.2%;"
      />
      <input
        [formControl]="armorClassControls.zdatnostStity"
        type="checkbox"
        class="field checkbox"
        style="top:26.5%; left:56.1%;"
      />

      <!--    Saving throws -->
      <input
        [formControl]="savingThrowsControls.silaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:31.5%; left:33.8%;"
      />
      <input
        [formControl]="savingThrowsControls.sila"
        class="field"
        style="top:30.8%; left:42.3%; width:4.7%; text-align: right;"
        placeholder="SIL"
      />
      <input
        [formControl]="savingThrowsControls.obratnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:33%; left:33.8%;"
      />
      <input
        [formControl]="savingThrowsControls.obratnost"
        class="field"
        style="top:32.4%; left:42.3%; width:4.7%; text-align: right;"
        placeholder="OBR"
      />
      <input
        [formControl]="savingThrowsControls.odolnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:34.6%; left:33.8%;"
      />
      <input
        [formControl]="savingThrowsControls.odolnost"
        class="field"
        style="top:34%; left:42.3%; width:4.7%; text-align: right;"
        placeholder="ODL"
      />
      <input
        [formControl]="savingThrowsControls.inteligenceZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:36.2%; left:33.8%;"
      />
      <input
        [formControl]="savingThrowsControls.inteligence"
        class="field"
        style="top:35.6%; left:42.3%; width:4.7%; text-align: right;"
        placeholder="INT"
      />
      <input
        [formControl]="savingThrowsControls.moudrostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:37.7%; left:33.8%;"
      />
      <input
        [formControl]="savingThrowsControls.moudrost"
        class="field"
        style="top:37.2%; left:42.3%; width:4.7%; text-align: right;"
        placeholder="MDR"
      />
      <input
        [formControl]="savingThrowsControls.charismaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:39.3%; left:33.8%;"
      />
      <input
        [formControl]="savingThrowsControls.charisma"
        class="field"
        style="top:38.7%; left:42.3%; width:4.7%; text-align: right;"
        placeholder="CHA"
      />

      <!--    passive skills -->
      <input
        [formControl]="passiveSkillsControls.atletikaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:31.5%; left:48.1%;"
      />
      <input
        [formControl]="passiveSkillsControls.atletika"
        class="field"
        style="top:30.8%; left:56.7%; width:4.7%; text-align: right;"
        placeholder="ATL"
      />
      <input
        [formControl]="passiveSkillsControls.akrobacieZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:33%; left:48.1%;"
      />
      <input
        [formControl]="passiveSkillsControls.akrobacie"
        class="field"
        style="top:32.4%; left:56.7%; width:4.7%; text-align: right;"
        placeholder="AKR"
      />
      <input
        [formControl]="passiveSkillsControls.nenapadnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:34.6%; left:48.1%;"
      />
      <input
        [formControl]="passiveSkillsControls.nenapadnost"
        class="field"
        style="top:34%; left:56.7%; width:4.7%; text-align: right;"
        placeholder="NEN"
      />
      <input
        [formControl]="passiveSkillsControls.vhledZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:36.2%; left:48.1%;"
      />
      <input
        [formControl]="passiveSkillsControls.vhled"
        class="field"
        style="top:35.6%; left:56.7%; width:4.7%; text-align: right;"
        placeholder="VHL"
      />
      <input
        [formControl]="passiveSkillsControls.vnimaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:37.7%; left:48.1%;"
      />
      <input
        [formControl]="passiveSkillsControls.vnimani"
        class="field"
        style="top:37.2%; left:56.7%; width:4.7%; text-align: right;"
        placeholder="VNI"
      />
      <input
        [formControl]="passiveSkillsControls.jineZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:39.3%; left:48.1%;"
      />
      <input
        [formControl]="passiveSkillsControls.jineNazev"
        class="field"
        style="top:38.7%; left:50%; width:6.3%; text-align: left;"
        placeholder="-"
      />
      <input
        [formControl]="passiveSkillsControls.jine"
        class="field"
        style="top:38.7%; left:56.7%; width:4.7%; text-align: right;"
        placeholder="-"
      />

      <input
        [formControl]="spellsAndAlchemistChestControls.vlastnost"
        class="field"
        style="top:44.2%; left:33.8%; width:11%;"
        placeholder="Vlastnost"
      />
      <input
        [formControl]="spellsAndAlchemistChestControls.utBonus"
        class="field"
        style="top:44.2%; left:46.1%; width:7.2%;"
        placeholder="Út bonus"
      />
      <input
        [formControl]="spellsAndAlchemistChestControls.soZachrany"
        class="field"
        style="top:44.2%; left:54.1%; width:7.2%;"
        placeholder="SO záchr."
      />

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
      <input id="atletikaZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:22.8%; left:13.9%;" />
      <input id="atletika" class="field" style="top:22.2%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="akrobacieZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:26%; left:13.9%;" />
      <input id="akrobacie" class="field" style="top:25.4%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="cachryZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:27.5%; left:13.9%;" />
      <input id="cachry" class="field" style="top:27%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="nenapadnostZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:29.1%; left:13.9%;" />
      <input id="nenapadnost" class="field" style="top:28.6%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />

      <input id="historieZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:32.6%; left:13.9%;" />
      <input id="historie" class="field" style="top:32%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="mystikaZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:34.1%; left:13.9%;" />
      <input id="mystika" class="field" style="top:33.6%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="nabozenstviZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:35.7%; left:13.9%;" />
      <input id="nabozenstvi" class="field" style="top:35.2%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="patraniZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:37.3%; left:13.9%;" />
      <input id="patrani" class="field" style="top:36.7%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="prirodaZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:38.8%; left:13.9%;" />
      <input id="priroda" class="field" style="top:38.3%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />

      <input id="lekarstviZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:42.3%; left:13.9%;" />
      <input id="lekarstvi" class="field" style="top:41.7%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="ovladaniZviratZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:43.8%; left:13.9%;" />
      <input id="ovladaniZvirat" class="field" style="top:43.3%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="prezitiZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:45.4%; left:13.9%;" />
      <input id="preziti" class="field" style="top:44.8%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="vhledZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:46.9%; left:13.9%;" />
      <input id="vhled" class="field" style="top:46.4%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="vnimaniZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:48.5%; left:13.9%;" />
      <input id="vnimani" class="field" style="top:48%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />

      <input id="klamaniZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:52%; left:13.9%;" />
      <input id="klamani" class="field" style="top:51.4%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="presvedcovaniZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:53.5%; left:13.9%;" />
      <input id="presvedcovani" class="field" style="top:53%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="vystupovaniZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:55.1%; left:13.9%;" />
      <input id="vystupovani" class="field" style="top:54.6%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <input id="zastrasovaniZdatnost" type="checkbox" class="field checkbox red-checkbox" style="top:56.7%; left:13.9%;" />
      <input id="zastrasovani" class="field" style="top:56.1%; left:26.6%; width:5.4%; text-align: right" placeholder="*" />
      <!--    =============================================-->

      <textarea
        class="field textarea"
        style="top:62%; left:13.9%; width:18.1%; height:167px;"
        placeholder="Pomůcky..."
      ></textarea>

      <!--    Weapons / attacks 1st row -->
      <input id="weapon1" class="field" style="top:58.7%; left:33.9%; width:20.3%" placeholder="Zbraň / útok" />
      <input id="weapon1_bonus" class="field" style="top:58.7%; left:54.5%; width:6%" placeholder="Bonus" />
      <input id="weapon1_hit" class="field" style="top:58.7%; left:60.9%; width:6%" placeholder="Zásah" />
      <input id="weapon1_type" class="field" style="top:58.7%; left:67.4%; width:7.3%" placeholder="Typ" />
      <input id="weapon1_distance" class="field" style="top:58.7%; left:75.1%; width:7.3%" placeholder="Dosah" />
      <input id="weapon1_armorClass" class="field" style="top:58.7%; left:82.9%; width:7.3%" placeholder="Dosah" />

      <!--    Weapons / attacks 2nd row -->
      <input id="weapon2" class="field" style="top:60.6%; left:33.9%; width:20.3%" placeholder="Zbraň / útok" />
      <input id="weapon2_bonus" class="field" style="top:60.6%; left:54.5%; width:6%" placeholder="Bonus" />
      <input id="weapon2_hit" class="field" style="top:60.6%; left:60.9%; width:6%" placeholder="Zásah" />
      <input id="weapon2_type" class="field" style="top:60.6%; left:67.4%; width:7.3%" placeholder="Typ" />
      <input id="weapon2_distance" class="field" style="top:60.6%; left:75.1%; width:7.3%" placeholder="Dosah" />
      <input id="weapon2_armorClass" class="field" style="top:60.6%; left:82.9%; width:7.3%" placeholder="Dosah" />

      <!--    Weapons / attacks 3rd row -->
      <input id="weapon3" class="field" style="top:62.5%; left:33.9%; width:20.3%" placeholder="Zbraň / útok" />
      <input id="weapon3_bonus" class="field" style="top:62.5%; left:54.5%; width:6%" placeholder="Bonus" />
      <input id="weapon3_hit" class="field" style="top:62.5%; left:60.9%; width:6%" placeholder="Zásah" />
      <input id="weapon3_type" class="field" style="top:62.5%; left:67.4%; width:7.3%" placeholder="Typ" />
      <input id="weapon3_distance" class="field" style="top:62.5%; left:75.1%; width:7.3%" placeholder="Dosah" />
      <input id="weapon3_armorClass" class="field" style="top:62.5%; left:82.9%; width:7.3%" placeholder="Dosah" />

      <!--    Weapons / attacks 4th row -->
      <input id="weapon4" class="field" style="top:64.4%; left:33.9%; width:20.3%" placeholder="Zbraň / útok" />
      <input id="weapon4_bonus" class="field" style="top:64.4%; left:54.5%; width:6%" placeholder="Bonus" />
      <input id="weapon4_hit" class="field" style="top:64.4%; left:60.9%; width:6%" placeholder="Zásah" />
      <input id="weapon4_type" class="field" style="top:64.4%; left:67.4%; width:7.3%" placeholder="Typ" />
      <input id="weapon4_distance" class="field" style="top:64.4%; left:75.1%; width:7.3%" placeholder="Dosah" />
      <input id="weapon4_armorClass" class="field" style="top:64.4%; left:82.9%; width:7.3%" placeholder="Dosah" />

      <!--    Weapons / attacks 5th row -->
      <input id="weapon5" class="field" style="top:66.3%; left:33.9%; width:20.3%" placeholder="Zbraň / útok" />
      <input id="weapon5_bonus" class="field" style="top:66.3%; left:54.5%; width:6%" placeholder="Bonus" />
      <input id="weapon5_hit" class="field" style="top:66.3%; left:60.9%; width:6%" placeholder="Zásah" />
      <input id="weapon5_type" class="field" style="top:66.3%; left:67.4%; width:7.3%" placeholder="Typ" />
      <input id="weapon5_distance" class="field" style="top:66.3%; left:75.1%; width:7.3%" placeholder="Dosah" />
      <input id="weapon5_armorClass" class="field" style="top:66.3%; left:82.9%; width:7.3%" placeholder="Dosah" />

      <input id="zdatnostSJednoduchymaZbranema" type="checkbox" class="field checkbox" style="top:68.8%; left:33.8%;" />
      <input id="zdatnostSValecnymaZbranema" type="checkbox" class="field checkbox" style="top:68.8%; left:43.4%;" />
      <input
        id="dalsiZdatnostSeZbrani"
        class="field"
        style="top:68.6%; left:50.9%; width:39.3%"
        placeholder="Další zdatnosti..."
      />

      <input id="jazyky" class="field" style="top:74.1%; left:52.5%; width:37.6%" placeholder="Jazyky..." />
      <textarea
        class="field textarea"
        style="top:75.9%; left:48.4%; width:42%; height:381px;"
        placeholder="Schopnosti..."
      ></textarea>

      <!--    Inventory - column 1 -->
      <input id="penize" class="field" style="top:74.2%; left:8.5%; width:37.8%" placeholder="Peníze" />
      <input id="inventoryItemRow1" class="field" style="top:76.4%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow2" class="field" style="top:78.4%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow3" class="field" style="top:80.5%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow4" class="field" style="top:82.6%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow5" class="field" style="top:84.7%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow6" class="field" style="top:86.8%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow7" class="field" style="top:88.9%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow8" class="field" style="top:91.0%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow9" class="field" style="top:93.1%; left:5.2%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow10" class="field" style="top:95.2%; left:5.2%; width:19.4%" placeholder="*" />

      <!--    Inventory - column 2 -->
      <input id="inventoryItemRow11" class="field" style="top:76.4%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow12" class="field" style="top:78.4%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow13" class="field" style="top:80.5%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow14" class="field" style="top:82.6%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow15" class="field" style="top:84.7%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow16" class="field" style="top:86.8%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow17" class="field" style="top:88.9%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow18" class="field" style="top:91.0%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow19" class="field" style="top:93.1%; left:26.9%; width:19.4%" placeholder="*" />
      <input id="inventoryItemRow20" class="field" style="top:95.2%; left:26.9%; width:19.4%" placeholder="*" />

      <button (click)="onSaveClick()" class="field button" style="top:0.5%; left:77%; width:19.4%">
        Uložit character sheet [enter]
      </button>
      <p id="inventoryItemRow20" class="field" style="top:-0.5%; left:38.7%; width:22.4%">
        @if (characterSheetStore.characterSheetSaved()) { Uložení bylo úspěšné. } @else if
        (characterSheetStore.characterSheetError()) {
        {{ characterSheetStore.characterSheetError() }}
        } @else if(infoMessage()) {
        {{ infoMessage() }}
        }
      </p>
    </form>
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
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: var(--border-radius-1);
      padding: 4px 6px;
      font-size: clamp(16px, 4vw, 16px);
      font-weight: bold;
      color: black;
      outline: none;
    }

    .button {
      background: rgba(17, 70, 209, 0.78);
      color: white;
      cursor: pointer;
      text-decoration: underline;
      &:hover {
        text-decoration: none;
      }
    }

    .field:focus {
      box-shadow: 0 0 0 3px rgba(63, 131, 255, 0.18);
      border-color: #3f83ff;
    }

    .checkbox {
      width: 15px;
      height: 15px;
      /*accent-color: #3f83ff; !* Optional: matches focus color *!*/
      background: transparent;
      border-radius: var(--border-radius-1);
      border: 1px solid rgba(0, 0, 0, 0.12);
      box-sizing: border-box;
      outline: none;
    }

    .red-checkbox {
      accent-color: #c81313;
    }

    .checkbox:focus {
      box-shadow: 0 0 0 3px rgba(63, 131, 255, 0.18);
      border-color: #3f83ff;
    }

    .textarea {
      resize: none;
    }
  `,
  providers: [CharacterSheetStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class CharacterSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);

  infoMessage = signal('');
  fb = new FormBuilder().nonNullable;
  form = this.fb.group<CharacterSheetForm>({
    topInfo: this.fb.group<TopInfoForm>({
      rasa: this.fb.control(''),
      povolani: this.fb.control(''),
      zazemi: this.fb.control(''),
      presvedceni: this.fb.control(''),
      jmenoPostavy: this.fb.control(''),
      uroven: this.fb.control(''),
      zkusenosti: this.fb.control(''),
      hrac: this.fb.control(''),
    }),
    abilityBonus: this.fb.group<AbilityBonusForm>({
      zdatnostniBonus: this.fb.control(''),
      inspirace: this.fb.control(''),
      iniciativa: this.fb.control(''),
    }),
    speedAndHealingDices: this.fb.group<SpeedAndHealingDicesForm>({
      lehke: this.fb.control(''),
      stredni: this.fb.control(''),
      tezke: this.fb.control(''),
      pouzitiKostek: this.fb.control(''),
      maxPouzitiKostek: this.fb.control(''),
      smrtUspech1: this.fb.control(''),
      smrtUspech2: this.fb.control(''),
      smrtUspech3: this.fb.control(''),
      smrtNeuspech1: this.fb.control(''),
      smrtNeuspech2: this.fb.control(''),
      smrtNeuspech3: this.fb.control(''),
      maxBoduVydrze: this.fb.control(''),
    }),
    armorClass: this.fb.group<ArmorClassForm>({
      zbroj: this.fb.control(''),
      bezeZbroje: this.fb.control(''),
      jine: this.fb.control(''),
      zdatnostLehke: this.fb.control(''),
      zdatnostStredni: this.fb.control(''),
      zdatnostTezke: this.fb.control(''),
      zdatnostStity: this.fb.control(''),
    }),
    infoAboutCharacter: this.fb.control(''),
    savingThrowsForm: this.fb.group<SavingThrowsForm>({
      silaZdatnost: this.fb.control(''),
      sila: this.fb.control(''),
      obratnostZdatnost: this.fb.control(''),
      obratnost: this.fb.control(''),
      odolnostZdatnost: this.fb.control(''),
      odolnost: this.fb.control(''),
      inteligenceZdatnost: this.fb.control(''),
      inteligence: this.fb.control(''),
      moudrostZdatnost: this.fb.control(''),
      moudrost: this.fb.control(''),
      charismaZdatnost: this.fb.control(''),
      charisma: this.fb.control(''),
    }),
    passiveSkillsForm: this.fb.group<PassiveSkillsForm>({
      atletikaZdatnost: this.fb.control(''),
      atletika: this.fb.control(''),
      akrobacieZdatnost: this.fb.control(''),
      akrobacie: this.fb.control(''),
      nenapadnostZdatnost: this.fb.control(''),
      nenapadnost: this.fb.control(''),
      vhledZdatnost: this.fb.control(''),
      vhled: this.fb.control(''),
      vnimaniZdatnost: this.fb.control(''),
      vnimani: this.fb.control(''),
      jineZdatnost: this.fb.control(''),
      jineNazev: this.fb.control(''),
      jine: this.fb.control(''),
    }),
    spellsAndAlchemistChestForm: this.fb.group<SpellsAndAlchemistChestForm>({
      vlastnost: this.fb.control(''),
      utBonus: this.fb.control(''),
      soZachrany: this.fb.control(''),
    }),
  });

  get topInfoControls() {
    return this.form.controls.topInfo.controls;
  }

  get abilityBonusControls() {
    return this.form.controls.abilityBonus.controls;
  }

  get speedAndHealingDicesControls() {
    return this.form.controls.speedAndHealingDices.controls;
  }

  get armorClassControls() {
    return this.form.controls.armorClass.controls;
  }

  get savingThrowsControls() {
    return this.form.controls.savingThrowsForm.controls;
  }

  get passiveSkillsControls() {
    return this.form.controls.passiveSkillsForm.controls;
  }

  get spellsAndAlchemistChestControls() {
    return this.form.controls.spellsAndAlchemistChestForm.controls;
  }

  constructor() {
    const checkForUsername = effect(() => {
      const username = this.authService.currentUser()?.username;

      untracked(() => {
        if (username) {
          this.characterSheetStore.getCharacterSheetByUsername(username);
        }
      });
    });

    const checkForCharacterSheet = effect(() => {
      const characterSheet = this.characterSheetStore.characterSheet();

      untracked(() => {
        if (characterSheet) {
          const formValue = FormUtil.convertModelToForm(
            characterSheet,
            CharacterSheetFormModelMappers.characterSheetFormToApiMapper,
          );
          this.form.patchValue(formValue);
        }
      });
    });
  }

  onSaveClick() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      const request = FormUtil.convertFormToModel(
        this.form.getRawValue(),
        CharacterSheetFormModelMappers.characterSheetFormToApiMapper,
      );
      request.username = username;

      this.characterSheetStore.saveCharacterSheet(request);
    } else {
      this.infoMessage.set('Pro uložení postavy se musíte přihlásit.');
    }
  }
}
