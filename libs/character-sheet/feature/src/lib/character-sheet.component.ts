import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
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
  Main6SkillsForm,
  AbilitiesForm,
  WeaponsForm,
  LanguagesForm,
  InventoryForm,
} from '@dn-d-servant/character-sheet-util';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { CharacterSheetFormModelMappers } from './character-sheet-form-model-mappers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

@Component({
  selector: 'character-sheet',
  template: `
    <img src="character-sheet-1-copy.png" alt="Character Sheet" height="1817" width="1293" />

    <form [formGroup]="form">
      <input
        [formControl]="topInfoControls.rasa"
        class="field"
        style="top:92.21px; left:58.95px; width:183.4px"
        placeholder="Rasa"
      />
      <input
        [formControl]="topInfoControls.povolani"
        class="field"
        style="top:92.21px; left:255.45px; width:183.4px;"
        placeholder="Povolání"
      />

      <input
        [formControl]="topInfoControls.zazemi"
        class="field"
        style="top: 158.08px; left: 58.95px; width: 183.4px;"
        placeholder="Zázemí"
      />
      <input
        [formControl]="topInfoControls.presvedceni"
        class="field"
        style="top:158.08px; left:255.45px; width:183.4px;"
        placeholder="Přesvědčení"
      />

      <input
        [formControl]="topInfoControls.jmenoPostavy"
        class="field"
        style="top:145.36px; left:550.2px; width:196.5px; text-align: center; font-weight: bold"
        placeholder="Jméno postavy"
      />

      <input
        [formControl]="topInfoControls.uroven"
        class="field"
        style="top:92.67px; left:858.05px; width:183.4px;"
        placeholder="Úroveň"
      />
      <input
        [formControl]="topInfoControls.zkusenosti"
        class="field"
        style="top:92.67px; left:1051.93px; width:183.4px;"
        placeholder="Zkušenost"
      />

      <input
        [formControl]="topInfoControls.hrac"
        class="field"
        style="top:158.08px; left:858.05px; width:183.4px;"
        placeholder="Hráč"
      />

      <input
        [formControl]="abilityBonusControls.zdatnostniBonus"
        class="field"
        style="top:274.37px; left:183.4px; width:44.54px; text-align: center"
        placeholder="ZB"
      />
      <input
        [formControl]="abilityBonusControls.inspirace"
        class="field"
        style="top:274.37px; left:445.4px; width:44.54px; text-align: center"
        placeholder="*"
      />
      <input
        [formControl]="abilityBonusControls.iniciativa"
        class="field"
        style="top:274.37px; left:627.49px; width:44.54px; text-align: center"
        placeholder="In."
      />

      <input
        [formControl]="speedAndHealingDicesControls.lehke"
        class="field"
        style="top:308.89px; left:829.23px; width:110.04px;"
        placeholder="Lehké"
      />
      <input
        [formControl]="speedAndHealingDicesControls.stredni"
        class="field"
        style="top:308.89px; left:952.37px; width:110.04px;"
        placeholder="Střední"
      />
      <input
        [formControl]="speedAndHealingDicesControls.tezke"
        class="field"
        style="top:308.89px; left:1073.89px; width:110.04px;"
        placeholder="Těžké"
      />

      <input
        [formControl]="speedAndHealingDicesControls.maxBoduVydrze"
        class="field"
        style="top:287.09px; left:1193.41px; width:68.12px; text-align: center;"
        placeholder="Max. BV"
      />

      <input
        [formControl]="speedAndHealingDicesControls.pouzitiKostek"
        class="field"
        style="top:420.74px; left:880.32px; width:182.09px;"
        placeholder="Použití kostek"
      />
      <input
        [formControl]="speedAndHealingDicesControls.maxPouzitiKostek"
        class="field"
        style="top:454.25px; left:880.32px; width:182.09px;"
        placeholder="Max"
      />

      <!--    Hearts for Dead saving -->
      <input
        [formControl]="speedAndHealingDicesControls.smrtUspech1"
        type="checkbox"
        class="field checkbox dead-throw-success"
        style="top:427px; left:1093.85px;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtUspech2"
        type="checkbox"
        class="field checkbox dead-throw-success"
        style="top:427px; left:1125.29px;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtUspech3"
        type="checkbox"
        class="field checkbox dead-throw-success"
        style="top:427px; left:1156.73px;"
      />

      <!--    Skulls for Death saving -->
      <input
        [formControl]="speedAndHealingDicesControls.smrtNeuspech1"
        type="checkbox"
        class="field checkbox dead-throw-fail"
        style="top:457.88px; left:1093.85px;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtNeuspech2"
        type="checkbox"
        class="field checkbox dead-throw-fail"
        style="top:457.88px; left:1125.29px;"
      />
      <input
        [formControl]="speedAndHealingDicesControls.smrtNeuspech3"
        type="checkbox"
        class="field checkbox dead-throw-fail"
        style="top:457.88px; left:1155.42px;"
      />

      <textarea
        [formControl]="form.controls['infoAboutCharacter']"
        class="field textarea"
        style="top:545.1px; left:834.47px; width:349.77px; height:432px;"
        placeholder="Poznámky..."
      ></textarea>

      <input
        [formControl]="armorClassControls.zbroj"
        class="field"
        style="top:416.09px; left:478.15px; width:61.57px; text-align: center;"
        placeholder="Zbroj"
      />
      <input
        [formControl]="armorClassControls.bezeZbroje"
        class="field"
        style="top:416.09px; left:582.95px; width:61.57px; text-align: center;"
        placeholder="Bez"
      />
      <input
        [formControl]="armorClassControls.jine"
        class="field"
        style="top:416.09px; left:692.99px; width:61.57px; text-align: center;"
        placeholder="Jiné"
      />

      <!--    Proficiency with armors -->
      <input
        [formControl]="armorClassControls.zdatnostLehke"
        type="checkbox"
        class="field checkbox"
        style="top:481.51px; left:449.33px;"
      />
      <input
        [formControl]="armorClassControls.zdatnostStredni"
        type="checkbox"
        class="field checkbox"
        style="top:481.51px; left:541.03px;"
      />
      <input
        [formControl]="armorClassControls.zdatnostTezke"
        type="checkbox"
        class="field checkbox"
        style="top:481.51px; left:644.52px;"
      />
      <input
        [formControl]="armorClassControls.zdatnostStity"
        type="checkbox"
        class="field checkbox"
        style="top:481.51px; left:734.91px;"
      />

      <!--    Saving throws -->
      <input
        [formControl]="savingThrowsControls.silaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:572.36px; left:442.78px;"
      />
      <input
        [formControl]="savingThrowsControls.sila"
        class="field"
        style="top:559.64px; left:554.13px; width:61.57px; text-align: right;"
        placeholder="SIL"
      />
      <input
        [formControl]="savingThrowsControls.obratnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:599.61px; left:442.78px;"
      />
      <input
        [formControl]="savingThrowsControls.obratnost"
        class="field"
        style="top:588.71px; left:554.13px; width:61.57px; text-align: right;"
        placeholder="OBR"
      />
      <input
        [formControl]="savingThrowsControls.odolnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:628.68px; left:442.78px;"
      />
      <input
        [formControl]="savingThrowsControls.odolnost"
        class="field"
        style="top:617.78px; left:554.13px; width:61.57px; text-align: right;"
        placeholder="ODL"
      />
      <input
        [formControl]="savingThrowsControls.inteligenceZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:657.75px; left:442.78px;"
      />
      <input
        [formControl]="savingThrowsControls.inteligence"
        class="field"
        style="top:646.85px; left:554.13px; width:61.57px; text-align: right;"
        placeholder="INT"
      />
      <input
        [formControl]="savingThrowsControls.moudrostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:685.01px; left:442.78px;"
      />
      <input
        [formControl]="savingThrowsControls.moudrost"
        class="field"
        style="top:675.92px; left:554.13px; width:61.57px; text-align: right;"
        placeholder="MDR"
      />
      <input
        [formControl]="savingThrowsControls.charismaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:714.08px; left:442.78px;"
      />
      <input
        [formControl]="savingThrowsControls.charisma"
        class="field"
        style="top:703.18px; left:554.13px; width:61.57px; text-align: right;"
        placeholder="CHA"
      />

      <!--    passive skills -->
      <input
        [formControl]="passiveSkillsControls.atletikaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:572.36px; left:630.11px;"
      />
      <input
        [formControl]="passiveSkillsControls.atletika"
        class="field"
        style="top:559.64px; left:743.77px; width:61.57px; text-align: right;"
        placeholder="ATL"
      />
      <input
        [formControl]="passiveSkillsControls.akrobacieZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:599.61px; left:630.11px;"
      />
      <input
        [formControl]="passiveSkillsControls.akrobacie"
        class="field"
        style="top:588.71px; left:743.77px; width:61.57px; text-align: right;"
        placeholder="AKR"
      />
      <input
        [formControl]="passiveSkillsControls.nenapadnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:628.68px; left:630.11px;"
      />
      <input
        [formControl]="passiveSkillsControls.nenapadnost"
        class="field"
        style="top:617.78px; left:743.77px; width:61.57px; text-align: right;"
        placeholder="NEN"
      />
      <input
        [formControl]="passiveSkillsControls.vhledZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:657.75px; left:630.11px;"
      />
      <input
        [formControl]="passiveSkillsControls.vhled"
        class="field"
        style="top:646.85px; left:743.77px; width:61.57px; text-align: right;"
        placeholder="VHL"
      />
      <input
        [formControl]="passiveSkillsControls.vnimaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:685.01px; left:630.11px;"
      />
      <input
        [formControl]="passiveSkillsControls.vnimani"
        class="field"
        style="top:675.92px; left:743.77px; width:61.57px; text-align: right;"
        placeholder="VNI"
      />
      <input
        [formControl]="passiveSkillsControls.jineZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:714.08px; left:630.11px;"
      />
      <input
        [formControl]="passiveSkillsControls.jineNazev"
        class="field"
        style="top:703.18px; left:655px; width:82.53px; text-align: left;"
        placeholder="-"
      />
      <input
        [formControl]="passiveSkillsControls.jine"
        class="field"
        style="top:703.18px; left:743.77px; width:61.57px; text-align: right;"
        placeholder="-"
      />

      <input
        [formControl]="spellsAndAlchemistChestControls.vlastnost"
        class="field"
        style="top:803.11px; left:442.78px; width:144.1px;"
        placeholder="Vlastnost"
      />
      <input
        [formControl]="spellsAndAlchemistChestControls.utBonus"
        class="field"
        style="top:803.11px; left:603.91px; width:94.32px;"
        placeholder="Út bonus"
      />
      <input
        [formControl]="spellsAndAlchemistChestControls.soZachrany"
        class="field"
        style="top:803.11px; left:708.71px; width:94.32px;"
        placeholder="SO záchr."
      />

      <!--      Spells slots / Alchemist chest-->

      <!--    main 6 skills-->
      <input
        [formControl]="main6SkillsControls.silaOprava"
        class="field main-skill"
        style="top:332.51px; left:78.60px; width:49.78px; text-align: center;"
        placeholder="SIL"
      />
      <input
        [formControl]="main6SkillsControls.sila"
        class="field"
        style="top:378.94px; left:78.60px; width:49.78px; text-align: center"
        placeholder="SIL"
      />
      <input
        [formControl]="main6SkillsControls.obratnostOprava"
        class="field main-skill"
        style="top:497.86px; left:78.60px; width:49.78px; text-align: center"
        placeholder="OBR"
      />
      <input
        [formControl]="main6SkillsControls.obratnost"
        class="field"
        style="top:545.10px; left:78.60px; width:49.78px; text-align: center"
        placeholder="OBR"
      />
      <input
        [formControl]="main6SkillsControls.odolnostOprava"
        class="field main-skill"
        style="top:672.29px; left:78.60px; width:49.78px; text-align: center"
        placeholder="ODL"
      />
      <input
        [formControl]="main6SkillsControls.odolnost"
        class="field"
        style="top:720.53px; left:78.60px; width:49.78px; text-align: center"
        placeholder="ODL"
      />
      <input
        [formControl]="main6SkillsControls.inteligenceOprava"
        class="field main-skill"
        style="top:847.72px; left:78.60px; width:49.78px; text-align: center"
        placeholder="INT"
      />
      <input
        [formControl]="main6SkillsControls.inteligence"
        class="field"
        style="top:894.15px; left:78.60px; width:49.78px; text-align: center"
        placeholder="INT"
      />
      <input
        [formControl]="main6SkillsControls.moudrostOprava"
        class="field main-skill"
        style="top:1015.30px; left:78.60px; width:49.78px; text-align: center"
        placeholder="MDR"
      />
      <input
        [formControl]="main6SkillsControls.moudrost"
        class="field"
        style="top:1061.73px; left:78.60px; width:49.78px; text-align: center"
        placeholder="MDR"
      />
      <input
        [formControl]="main6SkillsControls.charismaOprava"
        class="field main-skill"
        style="top:1189.92px; left:78.60px; width:49.78px; text-align: center"
        placeholder="CHA"
      />
      <input
        [formControl]="main6SkillsControls.charisma"
        class="field"
        style="top:1236.36px; left:78.60px; width:49.78px; text-align: center"
        placeholder="CHA"
      />

      <!--    =============================================-->
      <!--    detailed skills-->
      <input
        [formControl]="abilitiesControls.atletikaZdatnost"
        id="atletikaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:414.28px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.atletika"
        id="atletika"
        class="field"
        style="top:403.38px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.akrobacieZdatnost"
        id="akrobacieZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:472.42px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.akrobacie"
        id="akrobacie"
        class="field"
        style="top:461.52px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.cachryZdatnost"
        id="cachryZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:499.68px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.cachry"
        id="cachry"
        class="field"
        style="top:490.59px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.nenapadnostZdatnost"
        id="nenapadnostZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:528.75px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.nenapadnost"
        id="nenapadnost"
        class="field"
        style="top:519.66px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />

      <input
        [formControl]="abilitiesControls.historieZdatnost"
        id="historieZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:592.34px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.historie"
        id="historie"
        class="field"
        style="top:581.44px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.mystikaZdatnost"
        id="mystikaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:619.61px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.mystika"
        id="mystika"
        class="field"
        style="top:610.51px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.nabozenstviZdatnost"
        id="nabozenstviZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:648.69px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.nabozenstvi"
        id="nabozenstvi"
        class="field"
        style="top:639.59px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.patraniZdatnost"
        id="patraniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:677.74px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.patrani"
        id="patrani"
        class="field"
        style="top:666.84px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.prirodaZdatnost"
        id="prirodaZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:704.99px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.priroda"
        id="priroda"
        class="field"
        style="top:695.89px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />

      <input
        [formControl]="abilitiesControls.lekarstviZdatnost"
        id="lekarstviZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:768.59px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.lekarstvi"
        id="lekarstvi"
        class="field"
        style="top:757.69px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.ovladaniZviratZdatnost"
        id="ovladaniZviratZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:796.85px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.ovladaniZvirat"
        id="ovladaniZvirat"
        class="field"
        style="top:787.76px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.prezitiZdatnost"
        id="prezitiZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:825.32px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.preziti"
        id="preziti"
        class="field"
        style="top:814.42px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.vhledZdatnost"
        id="vhledZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:853.58px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.vhled"
        id="vhled"
        class="field"
        style="top:844.49px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.vnimaniZdatnost"
        id="vnimaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:880.25px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.vnimani"
        id="vnimani"
        class="field"
        style="top:871.16px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />

      <input
        [formControl]="abilitiesControls.klamaniZdatnost"
        id="klamaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:944.84px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.klamani"
        id="klamani"
        class="field"
        style="top:934.75px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.presvedcovaniZdatnost"
        id="presvedcovaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:972.10px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.presvedcovani"
        id="presvedcovani"
        class="field"
        style="top:963.01px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.vystupovaniZdatnost"
        id="vystupovaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:1001.57px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.vystupovani"
        id="vystupovani"
        class="field"
        style="top:992.48px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />
      <input
        [formControl]="abilitiesControls.zastrasovaniZdatnost"
        id="zastrasovaniZdatnost"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:1030.60px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.zastrasovani"
        id="zastrasovani"
        class="field"
        style="top:1019.80px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />

      <!--    =============================================-->

      <textarea
        [formControl]="form.controls.pomucky"
        class="field textarea"
        style="top:1126.54px; left:182.09px; width:237.11px; height:167px;"
        placeholder="Pomůcky..."
      ></textarea>

      <!--    Weapons / attacks 1st row -->
      <input
        [formControl]="weaponsControls.zbran1"
        id="weapon1"
        class="field"
        style="top:1067.38px; left:444.09px; width:266.93px"
        placeholder="Zbraň / útok"
      />
      <input
        [formControl]="weaponsControls.zbran1Bonus"
        id="weapon1_bonus"
        class="field"
        style="top:1067.38px; left:714.95px; width:78.6px"
        placeholder="Bonus"
      />
      <input
        [formControl]="weaponsControls.zbran1Zasah"
        id="weapon1_hit"
        class="field"
        style="top:1067.38px; left:797.79px; width:78.6px"
        placeholder="Zásah"
      />
      <input
        [formControl]="weaponsControls.zbran1Typ"
        id="weapon1_type"
        class="field"
        style="top:1067.38px; left:883.94px; width:95.63px"
        placeholder="Typ"
      />
      <input
        [formControl]="weaponsControls.zbran1Dosah"
        id="weapon1_distance"
        class="field"
        style="top:1067.38px; left:983.81px; width:95.63px"
        placeholder="Dosah"
      />
      <input
        [formControl]="weaponsControls.zbran1Oc"
        id="weapon1_armorClass"
        class="field"
        style="top:1067.38px; left:1086.99px; width:95.63px"
        placeholder="Dosah"
      />

      <!--    Weapons / attacks 2nd row -->
      <input
        [formControl]="weaponsControls.zbran2"
        id="weapon2"
        class="field"
        style="top:1101.10px; left:444.09px; width:266.93px"
        placeholder="Zbraň / útok"
      />
      <input
        [formControl]="weaponsControls.zbran2Bonus"
        id="weapon2_bonus"
        class="field"
        style="top:1101.10px; left:714.95px; width:78.6px"
        placeholder="Bonus"
      />
      <input
        [formControl]="weaponsControls.zbran2Zasah"
        id="weapon2_hit"
        class="field"
        style="top:1101.10px; left:797.79px; width:78.6px"
        placeholder="Zásah"
      />
      <input
        [formControl]="weaponsControls.zbran2Typ"
        id="weapon2_type"
        class="field"
        style="top:1101.10px; left:883.94px; width:95.63px"
        placeholder="Typ"
      />
      <input
        [formControl]="weaponsControls.zbran2Dosah"
        id="weapon2_distance"
        class="field"
        style="top:1101.10px; left:983.81px; width:95.63px"
        placeholder="Dosah"
      />
      <input
        [formControl]="weaponsControls.zbran2Oc"
        id="weapon2_armorClass"
        class="field"
        style="top:1101.10px; left:1086.99px; width:95.63px"
        placeholder="Dosah"
      />

      <!--    Weapons / attacks 3rd row -->
      <input
        [formControl]="weaponsControls.zbran3"
        id="weapon3"
        class="field"
        style="top:1135.63px; left:444.09px; width:266.93px"
        placeholder="Zbraň / útok"
      />
      <input
        [formControl]="weaponsControls.zbran3Bonus"
        id="weapon3_bonus"
        class="field"
        style="top:1135.63px; left:714.95px; width:78.6px"
        placeholder="Bonus"
      />
      <input
        [formControl]="weaponsControls.zbran3Zasah"
        id="weapon3_hit"
        class="field"
        style="top:1135.63px; left:797.79px; width:78.6px"
        placeholder="Zásah"
      />
      <input
        [formControl]="weaponsControls.zbran3Typ"
        id="weapon3_type"
        class="field"
        style="top:1135.63px; left:883.94px; width:95.63px"
        placeholder="Typ"
      />
      <input
        [formControl]="weaponsControls.zbran3Dosah"
        id="weapon3_distance"
        class="field"
        style="top:1135.63px; left:983.81px; width:95.63px"
        placeholder="Dosah"
      />
      <input
        [formControl]="weaponsControls.zbran3Oc"
        id="weapon3_armorClass"
        class="field"
        style="top:1135.63px; left:1086.99px; width:95.63px"
        placeholder="Dosah"
      />

      <!--    Weapons / attacks 4th row -->
      <input
        [formControl]="weaponsControls.zbran4"
        id="weapon4"
        class="field"
        style="top:1170.15px; left:444.09px; width:266.93px"
        placeholder="Zbraň / útok"
      />
      <input
        [formControl]="weaponsControls.zbran4Bonus"
        id="weapon4_bonus"
        class="field"
        style="top:1170.15px; left:714.95px; width:78.6px"
        placeholder="Bonus"
      />
      <input
        [formControl]="weaponsControls.zbran4Zasah"
        id="weapon4_hit"
        class="field"
        style="top:1170.15px; left:797.79px; width:78.6px"
        placeholder="Zásah"
      />
      <input
        [formControl]="weaponsControls.zbran4Typ"
        id="weapon4_type"
        class="field"
        style="top:1170.15px; left:883.94px; width:95.63px"
        placeholder="Typ"
      />
      <input
        [formControl]="weaponsControls.zbran4Dosah"
        id="weapon4_distance"
        class="field"
        style="top:1170.15px; left:983.81px; width:95.63px"
        placeholder="Dosah"
      />
      <input
        [formControl]="weaponsControls.zbran4Oc"
        id="weapon4_armorClass"
        class="field"
        style="top:1170.15px; left:1086.99px; width:95.63px"
        placeholder="Dosah"
      />

      <!--    Weapons / attacks 5th row -->
      <input
        [formControl]="weaponsControls.zbran5"
        id="weapon5"
        class="field"
        style="top:1205.67px; left:444.09px; width:266.93px"
        placeholder="Zbraň / útok"
      />
      <input
        [formControl]="weaponsControls.zbran5Bonus"
        id="weapon5_bonus"
        class="field"
        style="top:1205.67px; left:714.95px; width:78.6px"
        placeholder="Bonus"
      />
      <input
        [formControl]="weaponsControls.zbran5Zasah"
        id="weapon5_hit"
        class="field"
        style="top:1205.67px; left:797.79px; width:78.6px"
        placeholder="Zásah"
      />
      <input
        [formControl]="weaponsControls.zbran5Typ"
        id="weapon5_type"
        class="field"
        style="top:1205.67px; left:883.94px; width:95.63px"
        placeholder="Typ"
      />
      <input
        [formControl]="weaponsControls.zbran5Dosah"
        id="weapon5_distance"
        class="field"
        style="top:1205.67px; left:983.81px; width:95.63px"
        placeholder="Dosah"
      />
      <input
        [formControl]="weaponsControls.zbran5Oc"
        id="weapon5_armorClass"
        class="field"
        style="top:1205.67px; left:1086.99px; width:95.63px"
        placeholder="Dosah"
      />

      <input
        [formControl]="weaponsControls.zdatnostJednoduche"
        id="zdatnostSJednoduchymaZbranema"
        type="checkbox"
        class="field checkbox"
        style="top:1252px; left:442.78px;"
      />
      <input
        [formControl]="weaponsControls.zdatnostValecne"
        id="zdatnostSValecnymaZbranema"
        type="checkbox"
        class="field checkbox"
        style="top:1252px; left:568.54px;"
      />
      <input
        [formControl]="weaponsControls.dalsiZdatnosti"
        id="dalsiZdatnostSeZbrani"
        class="field"
        style="top:1248px; left:666.79px; width:514.83px"
        placeholder="Další zdatnosti..."
      />

      <input
        [formControl]="languagesControls.jazyky"
        id="jazyky"
        class="field"
        style="top:1347.40px; left:687.75px; width:492.56px"
        placeholder="Jazyky..."
      />
      <textarea
        [formControl]="languagesControls.schopnosti"
        class="field textarea"
        style="top:1379.10px; left:634.04px; width:550.20px; height:381px;"
        placeholder="Schopnosti..."
      ></textarea>

      <!--    Inventory - column 1 -->
      <input
        [formControl]="inventoryControls.penize"
        id="penize"
        class="field"
        style="top:1350px; left:111.35px; width:495.18px"
        placeholder="Peníze"
      />
      <input
        [formControl]="inventoryControls.radek1"
        [ngClass]="inventoryClasses()[0]"
        id="inventoryItemRow1"
        class="field inventory-item"
        style="top:1390.19px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek2"
        [ngClass]="inventoryClasses()[1]"
        id="inventoryItemRow2"
        class="field inventory-item"
        style="top:1427.53px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek3"
        [ngClass]="inventoryClasses()[2]"
        id="inventoryItemRow3"
        class="field inventory-item"
        style="top:1465.69px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek4"
        [ngClass]="inventoryClasses()[3]"
        id="inventoryItemRow4"
        class="field inventory-item"
        style="top:1503.85px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek5"
        [ngClass]="inventoryClasses()[4]"
        id="inventoryItemRow5"
        class="field inventory-item"
        style="top:1542.01px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek6"
        [ngClass]="inventoryClasses()[5]"
        id="inventoryItemRow6"
        class="field inventory-item"
        style="top:1580.17px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek7"
        [ngClass]="inventoryClasses()[6]"
        id="inventoryItemRow7"
        class="field inventory-item"
        style="top:1618.33px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek8"
        [ngClass]="inventoryClasses()[7]"
        id="inventoryItemRow8"
        class="field inventory-item"
        style="top:1656.49px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek9"
        [ngClass]="inventoryClasses()[8]"
        id="inventoryItemRow9"
        class="field inventory-item"
        style="top:1694.65px; left:68.12px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek10"
        [ngClass]="inventoryClasses()[9]"
        id="inventoryItemRow10"
        class="field inventory-item"
        style="top:1732.81px; left:68.12px; width:254.14px"
        placeholder="*"
      />

      <!--    Inventory - column 2 -->
      <input
        [formControl]="inventoryControls.radek11"
        [ngClass]="inventoryClasses()[10]"
        id="inventoryItemRow11"
        class="field inventory-item"
        style="top:1390.19px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek12"
        [ngClass]="inventoryClasses()[11]"
        id="inventoryItemRow12"
        class="field inventory-item"
        style="top:1427.53px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek13"
        [ngClass]="inventoryClasses()[12]"
        id="inventoryItemRow13"
        class="field inventory-item"
        style="top:1465.69px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek14"
        [ngClass]="inventoryClasses()[13]"
        id="inventoryItemRow14"
        class="field inventory-item"
        style="top:1503.85px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek15"
        [ngClass]="inventoryClasses()[14]"
        id="inventoryItemRow15"
        class="field inventory-item"
        style="top:1542.01px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek16"
        [ngClass]="inventoryClasses()[15]"
        id="inventoryItemRow16"
        class="field inventory-item"
        style="top:1580.17px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek17"
        [ngClass]="inventoryClasses()[16]"
        id="inventoryItemRow17"
        class="field inventory-item"
        style="top:1618.33px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek18"
        [ngClass]="inventoryClasses()[17]"
        id="inventoryItemRow18"
        class="field inventory-item"
        style="top:1656.49px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek19"
        [ngClass]="inventoryClasses()[18]"
        id="inventoryItemRow19"
        class="field inventory-item"
        style="top:1694.65px; left:352.39px; width:254.14px"
        placeholder="*"
      />
      <input
        [formControl]="inventoryControls.radek20"
        [ngClass]="inventoryClasses()[19]"
        id="inventoryItemRow20"
        class="field inventory-item"
        style="top:1732.81px; left:352.39px; width:254.14px"
        placeholder="*"
      />

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
    <img src="character-sheet-2.png" alt="Character Sheet" height="1817" width="1293" />
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

    .main-skill {
      font-family: 'Mikadan', sans-serif;
      color: rgba(4, 61, 230, 0.78);
      font-size: 22px;
    }

    .dead-throw-success {
      accent-color: green;
    }

    .dead-throw-fail {
      accent-color: red;
    }

    .inventory-item {
      font-size: 13px;
    }

    .soft-weight {
      background: rgba(180, 255, 180, 0.62);
    }

    .medium-weight {
      background: rgba(237, 194, 108, 0.38);
    }

    .heavy-weight {
      background: rgba(236, 159, 159, 0.47);
    }
  `,
  providers: [CharacterSheetStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgClass],
})
export class CharacterSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  inventoryClasses = signal(Array(20).fill(''));
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
    main6SkillsForm: this.fb.group<Main6SkillsForm>({
      silaOprava: this.fb.control(''),
      sila: this.fb.control(''),
      obratnostOprava: this.fb.control(''),
      obratnost: this.fb.control(''),
      odolnostOprava: this.fb.control(''),
      odolnost: this.fb.control(''),
      inteligenceOprava: this.fb.control(''),
      inteligence: this.fb.control(''),
      moudrostOprava: this.fb.control(''),
      moudrost: this.fb.control(''),
      charismaOprava: this.fb.control(''),
      charisma: this.fb.control(''),
    }),
    abilitiesForm: this.fb.group<AbilitiesForm>({
      // Sila
      atletikaZdatnost: this.fb.control(''),
      atletika: this.fb.control(''),

      // Obratnost
      akrobacieZdatnost: this.fb.control(''),
      akrobacie: this.fb.control(''),
      cachryZdatnost: this.fb.control(''),
      cachry: this.fb.control(''),
      nenapadnostZdatnost: this.fb.control(''),
      nenapadnost: this.fb.control(''),

      // Inteligence
      historieZdatnost: this.fb.control(''),
      historie: this.fb.control(''),
      mystikaZdatnost: this.fb.control(''),
      mystika: this.fb.control(''),
      nabozenstviZdatnost: this.fb.control(''),
      nabozenstvi: this.fb.control(''),
      patraniZdatnost: this.fb.control(''),
      patrani: this.fb.control(''),
      prirodaZdatnost: this.fb.control(''),
      priroda: this.fb.control(''),

      // Moudrost
      lekarstviZdatnost: this.fb.control(''),
      lekarstvi: this.fb.control(''),
      ovladaniZviratZdatnost: this.fb.control(''),
      ovladaniZvirat: this.fb.control(''),
      prezitiZdatnost: this.fb.control(''),
      preziti: this.fb.control(''),
      vhledZdatnost: this.fb.control(''),
      vhled: this.fb.control(''),
      vnimaniZdatnost: this.fb.control(''),
      vnimani: this.fb.control(''),

      // Charisma
      klamaniZdatnost: this.fb.control(''),
      klamani: this.fb.control(''),
      presvedcovaniZdatnost: this.fb.control(''),
      presvedcovani: this.fb.control(''),
      vystupovaniZdatnost: this.fb.control(''),
      vystupovani: this.fb.control(''),
      zastrasovaniZdatnost: this.fb.control(''),
      zastrasovani: this.fb.control(''),
    }),
    pomucky: this.fb.control(''),
    weaponsForm: this.fb.group<WeaponsForm>({
      zbran1: this.fb.control(''),
      zbran1Bonus: this.fb.control(''),
      zbran1Zasah: this.fb.control(''),
      zbran1Typ: this.fb.control(''),
      zbran1Dosah: this.fb.control(''),
      zbran1Oc: this.fb.control(''),

      zbran2: this.fb.control(''),
      zbran2Bonus: this.fb.control(''),
      zbran2Zasah: this.fb.control(''),
      zbran2Typ: this.fb.control(''),
      zbran2Dosah: this.fb.control(''),
      zbran2Oc: this.fb.control(''),

      zbran3: this.fb.control(''),
      zbran3Bonus: this.fb.control(''),
      zbran3Zasah: this.fb.control(''),
      zbran3Typ: this.fb.control(''),
      zbran3Dosah: this.fb.control(''),
      zbran3Oc: this.fb.control(''),

      zbran4: this.fb.control(''),
      zbran4Bonus: this.fb.control(''),
      zbran4Zasah: this.fb.control(''),
      zbran4Typ: this.fb.control(''),
      zbran4Dosah: this.fb.control(''),
      zbran4Oc: this.fb.control(''),

      zbran5: this.fb.control(''),
      zbran5Bonus: this.fb.control(''),
      zbran5Zasah: this.fb.control(''),
      zbran5Typ: this.fb.control(''),
      zbran5Dosah: this.fb.control(''),
      zbran5Oc: this.fb.control(''),

      zdatnostJednoduche: this.fb.control(''),
      zdatnostValecne: this.fb.control(''),
      dalsiZdatnosti: this.fb.control(''),
    }),
    languagesForm: this.fb.group<LanguagesForm>({
      jazyky: this.fb.control(''),
      schopnosti: this.fb.control(''),
    }),
    inventoryForm: this.fb.group<InventoryForm>({
      penize: this.fb.control(''),
      radek1: this.fb.control(''),
      radek2: this.fb.control(''),
      radek3: this.fb.control(''),
      radek4: this.fb.control(''),
      radek5: this.fb.control(''),
      radek6: this.fb.control(''),
      radek7: this.fb.control(''),
      radek8: this.fb.control(''),
      radek9: this.fb.control(''),
      radek10: this.fb.control(''),
      radek11: this.fb.control(''),
      radek12: this.fb.control(''),
      radek13: this.fb.control(''),
      radek14: this.fb.control(''),
      radek15: this.fb.control(''),
      radek16: this.fb.control(''),
      radek17: this.fb.control(''),
      radek18: this.fb.control(''),
      radek19: this.fb.control(''),
      radek20: this.fb.control(''),
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

  get main6SkillsControls() {
    return this.form.controls.main6SkillsForm.controls;
  }

  get abilitiesControls() {
    return this.form.controls.abilitiesForm.controls;
  }

  get weaponsControls() {
    return this.form.controls.weaponsForm.controls;
  }

  get languagesControls() {
    return this.form.controls.languagesForm.controls;
  }

  get inventoryControls() {
    return this.form.controls.inventoryForm.controls;
  }

  constructor() {
    this.main6SkillsControls.silaOprava.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(strength => {
      this._setInventoryClasses(strength ?? '0');
    });

    const checkForUsername = effect(() => {
      const username = this.authService.currentUser()?.username;

      untracked(() => {
        if (username) {
          this.characterSheetStore.getCharacterSheetByUsername(username);
        }
      });
    });

    const fetchedCharacterSheet = effect(() => {
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

  _setInventoryClasses(strength: string) {
    let strengthFix = parseInt(strength?.replace(/[^\d\-+]/g, '') ?? '0');
    if (isNaN(strengthFix)) {
      strengthFix = 0;
    }
    const softWeight = 5 + strengthFix;
    const mediumWeight = softWeight + 5;
    const heavyWeight = mediumWeight + 5;
    const inventoryClassesArray = [...this.inventoryClasses()];

    inventoryClassesArray.forEach((x, i) => {
      if (i < softWeight) {
        inventoryClassesArray[i] = 'soft-weight';
      } else if (i < mediumWeight) {
        inventoryClassesArray[i] = 'medium-weight';
      } else if (i < heavyWeight) {
        inventoryClassesArray[i] = 'heavy-weight';
      } else {
        inventoryClassesArray[i] = '';
      }
    });
    this.inventoryClasses.set(inventoryClassesArray);
  }
}
