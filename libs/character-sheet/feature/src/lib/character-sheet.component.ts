import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  CharacterSheetForm,
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
  SpellSlotsForm,
  AlchemistChestForm,
  TopInfoForm,
} from '@dn-d-servant/character-sheet-util';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { CharacterSheetFormModelMappers } from './character-sheet-form-model-mappers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { SecondPageComponent } from './second-page.component';
import { ThirdPageComponent } from './third-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { openWeaponsAndArmorsDialog } from './help-dialogs/weapons-and-armors-dialog.component';
import { openDamagesDialog } from './help-dialogs/damages-dialog.component';
import { openToolsDialog } from './help-dialogs/tools-dialog.component';
import { openCarriageDialog } from './help-dialogs/carriage-dialog.component';
import { openBackgroundDialog } from './help-dialogs/background-dialog.component';
import { openConvictionDialog } from './help-dialogs/conviction-dialog.component';
import { openLevelsDialog } from './help-dialogs/levels-dialog.component';
import { openExpertiseDialog } from './help-dialogs/expertise-dialog.component';
import { openLanguagesDialog } from './help-dialogs/languages-dialog.component';
import { openSpellsDialog } from './help-dialogs/spells-dialog.component';
import { openAlchemistDialog } from './help-dialogs/alchemist-dialog.component';

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

      <button
        (click)="onOpenBackgroundDialog()"
        type="button"
        matTooltip="Zázemí postavy"
        style="top: 161px; left: 35px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <input
        [formControl]="topInfoControls.zazemi"
        class="field"
        style="top: 158px; left: 58px; width: 183px;"
        placeholder="Zázemí"
      />
      <button
        (click)="onOpenConvictionDialog()"
        type="button"
        matTooltip="Přesvědčení postavy"
        style="top:161px; left:442px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <input
        [formControl]="topInfoControls.presvedceni"
        class="field"
        style="top:158px; left:255px; width:183px;"
        placeholder="Přesvědčení"
      />

      <input
        [formControl]="topInfoControls.jmenoPostavy"
        class="field"
        style="top:145.36px; left:550.2px; width:196.5px; text-align: center; font-weight: bold"
        placeholder="Jméno postavy"
      />

      <button
        (click)="onOpenLevelsDialog()"
        type="button"
        matTooltip="Úroveň postavy"
        style="top:95px; left:835px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <input
        [formControl]="topInfoControls.uroven"
        class="field"
        style="top:92px; left:858px; width:183px;"
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
        style="top:283px; left:1193.41px; width:68.12px; text-align: center; font-size: 18px; color: red;"
        placeholder="Max. BV"
      />

      <button
        (click)="onOpenDamagesDialog()"
        type="button"
        matTooltip="Bojové a přetrvávající zranění"
        style="top:424px; left:842px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
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
        style="top:416.09px; left:478.15px; width:61.57px; text-align: center; font-size: 22px;"
        placeholder="Zbroj"
      />
      <input
        [formControl]="armorClassControls.bezeZbroje"
        class="field"
        style="top:416.09px; left:582.95px; width:61.57px; text-align: center; font-size: 22px;"
        placeholder="Bez"
      />
      <input
        [formControl]="armorClassControls.jine"
        class="field"
        style="top:416.09px; left:692.99px; width:61.57px; text-align: center; font-size: 22px;"
        placeholder="Jiné"
      />

      <!--    Proficiency with armors -->
      <input
        [formControl]="armorClassControls.zdatnostLehke"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:481.51px; left:449.33px;"
      />
      <input
        [formControl]="armorClassControls.zdatnostStredni"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:481.51px; left:541.03px;"
      />
      <input
        [formControl]="armorClassControls.zdatnostTezke"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:481.51px; left:644.52px;"
      />
      <input
        [formControl]="armorClassControls.zdatnostStity"
        type="checkbox"
        class="field checkbox red-checkbox"
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

      <button
        (click)="onOpenSpellsDialog()"
        type="button"
        matTooltip="Seznam kouzel"
        style="top:764px; left:452px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <button
        (click)="onOpenAlchemistDialog()"
        type="button"
        matTooltip="Aclhymistická truhla"
        style="top:764px; left:772px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <input
        [formControl]="spellsAndAlchemistChestControls.vlastnost"
        class="field"
        style="top:803px; left:442px; width:144px;"
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
      <p
        class="label"
        matTooltip="úroveň Sesilatele"
        matTooltipPosition="left"
        style="top:904px; left:629px; width:45px; font-size: 13px"
      >
        S*
      </p>
      <input
        [formControl]="spellSlotsControls.urovenSesilatele"
        matTooltip="úroveň Sesilatele"
        matTooltipPosition="left"
        class="field"
        type="number"
        style="top:913px; left:645px; width:45px; font-size: 13px;"
        placeholder="S*"
      />
      <p
        class="label"
        matTooltip="úroveň Černokněžníka"
        matTooltipPosition="left"
        style="top:929px; left:629px; width:45px; font-size: 13px"
      >
        Č*
      </p>
      <input
        [formControl]="spellSlotsControls.urovenCernokneznika"
        matTooltip="úroveň Černokněžníka"
        matTooltipPosition="left"
        class="field"
        type="number"
        style="top:938px; left:645px; width:45px; font-size: 13px;"
        placeholder="Č*"
      />
      <p
        class="label"
        matTooltip="úroveň Alchymisty"
        matTooltipPosition="left"
        style="top:954px; left:629px; width:45px; font-size: 13px"
      >
        A*
      </p>
      <input
        [formControl]="alchemistChestControls.urovenAlchymisty"
        matTooltip="úroveň Alchymisty"
        matTooltipPosition="left"
        class="field"
        type="number"
        style="top:963px; left:645px; width:45px; font-size: 13px;"
        placeholder="A*"
      />

      <input
        #level1Slot1Input
        [formControl]="spellSlotsControls.level1Slot1"
        id="level-1-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:440px;"
      />
      <input
        #level1Slot2Input
        [formControl]="spellSlotsControls.level1Slot2"
        id="level-1-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:440px;"
      />
      <input
        #level1Slot3Input
        [formControl]="spellSlotsControls.level1Slot3"
        id="level-1-slot-3"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:440px;"
      />
      <input
        #level1Slot4Input
        [formControl]="spellSlotsControls.level1Slot4"
        id="level-1-slot-4"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:953px; left:440px;"
      />

      <input
        #level2Slot1Input
        [formControl]="spellSlotsControls.level2Slot1"
        id="level-2-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:467px;"
      />
      <input
        #level2Slot2Input
        [formControl]="spellSlotsControls.level2Slot2"
        id="level-2-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:467px;"
      />
      <input
        #level2Slot3Input
        [formControl]="spellSlotsControls.level2Slot3"
        id="level-2-slot-3"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:467px;"
      />
      <input
        #level2Slot4Input
        [formControl]="spellSlotsControls.level2Slot4"
        id="level-2-slot-4"
        type="checkbox"
        class="field checkbox spell-slot-checkbox spell-slot-black-priest"
        style="top:953px; left:467px;"
      />

      <input
        #level3Slot1Input
        [formControl]="spellSlotsControls.level3Slot1"
        id="level-3-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:494px;"
      />
      <input
        #level3Slot2Input
        [formControl]="spellSlotsControls.level3Slot2"
        id="level-3-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:494px;"
      />
      <input
        #level3Slot3Input
        [formControl]="spellSlotsControls.level3Slot3"
        id="level-3-slot-3"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:494px;"
      />
      <input
        #level3Slot4Input
        [formControl]="spellSlotsControls.level3Slot4"
        id="level-3-slot-4"
        type="checkbox"
        class="field checkbox spell-slot-checkbox spell-slot-black-priest"
        style="top:953px; left:494px;"
      />

      <input
        #level4Slot1Input
        [formControl]="spellSlotsControls.level4Slot1"
        id="level-4-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:521px;"
      />
      <input
        #level4Slot2Input
        [formControl]="spellSlotsControls.level4Slot2"
        id="level-4-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:521px;"
      />
      <input
        #level4Slot3Input
        [formControl]="spellSlotsControls.level4Slot3"
        id="level-4-slot-3"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:521px;"
      />
      <input
        #level4Slot4Input
        [formControl]="spellSlotsControls.level4Slot4"
        id="level-4-slot-4"
        type="checkbox"
        class="field checkbox spell-slot-checkbox spell-slot-black-priest"
        style="top:953px; left:521px;"
      />

      <input
        #level5Slot1Input
        [formControl]="spellSlotsControls.level5Slot1"
        id="level-5-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:548px;"
      />
      <input
        #level5Slot2Input
        [formControl]="spellSlotsControls.level5Slot2"
        id="level-5-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:548px;"
      />
      <input
        #level5Slot3Input
        [formControl]="spellSlotsControls.level5Slot3"
        id="level-5-slot-3"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:548px;"
      />
      <input
        #level5Slot4Input
        [formControl]="spellSlotsControls.level5Slot4"
        id="level-5-slot-4"
        type="checkbox"
        class="field checkbox spell-slot-checkbox spell-slot-black-priest"
        style="top:953px; left:548px;"
      />

      <input
        #level6Slot1Input
        [formControl]="spellSlotsControls.level6Slot1"
        id="level-6-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:575px;"
      />
      <input
        #level6Slot2Input
        [formControl]="spellSlotsControls.level6Slot2"
        id="level-6-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:575px;"
      />

      <input
        #level7Slot1Input
        [formControl]="spellSlotsControls.level7Slot1"
        id="level-7-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:601px;"
      />
      <input
        #level7Slot2Input
        [formControl]="spellSlotsControls.level7Slot2"
        id="level-7-slot-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:601px;"
      />

      <input
        #level8Slot1Input
        [formControl]="spellSlotsControls.level8Slot1"
        id="level-8-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:628px;"
      />

      <input
        #level9Slot1Input
        [formControl]="spellSlotsControls.level9Slot1"
        id="level-9-slot-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:655px;"
      />

      <!--      Alchemist chest-->
      <input
        #chestUsage1Input
        [formControl]="alchemistChestControls.chestUsage1"
        id="chest-usage-1"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:692px;"
      />
      <input
        #chestUsage2Input
        [formControl]="alchemistChestControls.chestUsage2"
        id="chest-usage-2"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:716px;"
      />
      <input
        #chestUsage3Input
        [formControl]="alchemistChestControls.chestUsage3"
        id="chest-usage-3"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:738px;"
      />
      <input
        #chestUsage4Input
        [formControl]="alchemistChestControls.chestUsage4"
        id="chest-usage-4"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:761px;"
      />
      <input
        #chestUsage5Input
        [formControl]="alchemistChestControls.chestUsage5"
        id="chest-usage-5"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:892px; left:784px;"
      />

      <input
        #chestUsage6Input
        [formControl]="alchemistChestControls.chestUsage6"
        id="chest-usage-6"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:692px;"
      />
      <input
        #chestUsage7Input
        [formControl]="alchemistChestControls.chestUsage7"
        id="chest-usage-7"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:716px;"
      />
      <input
        #chestUsage8Input
        [formControl]="alchemistChestControls.chestUsage8"
        id="chest-usage-8"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:738px;"
      />
      <input
        #chestUsage9Input
        [formControl]="alchemistChestControls.chestUsage9"
        id="chest-usage-9"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:761px;"
      />
      <input
        #chestUsage10Input
        [formControl]="alchemistChestControls.chestUsage10"
        id="chest-usage-10"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:912px; left:784px;"
      />

      <input
        #chestUsage11Input
        [formControl]="alchemistChestControls.chestUsage11"
        id="chest-usage-11"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:692px;"
      />
      <input
        #chestUsage12Input
        [formControl]="alchemistChestControls.chestUsage12"
        id="chest-usage-12"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:716px;"
      />
      <input
        #chestUsage13Input
        [formControl]="alchemistChestControls.chestUsage13"
        id="chest-usage-13"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:738px;"
      />
      <input
        #chestUsage14Input
        [formControl]="alchemistChestControls.chestUsage14"
        id="chest-usage-14"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:761px;"
      />
      <input
        #chestUsage15Input
        [formControl]="alchemistChestControls.chestUsage15"
        id="chest-usage-15"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:933px; left:784px;"
      />

      <input
        #chestUsage16Input
        [formControl]="alchemistChestControls.chestUsage16"
        id="chest-usage-16"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:953px; left:692px;"
      />
      <input
        #chestUsage17Input
        [formControl]="alchemistChestControls.chestUsage17"
        id="chest-usage-17"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:953px; left:716px;"
      />
      <input
        #chestUsage18Input
        [formControl]="alchemistChestControls.chestUsage18"
        id="chest-usage-18"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:953px; left:738px;"
      />
      <input
        #chestUsage19Input
        [formControl]="alchemistChestControls.chestUsage19"
        id="chest-usage-19"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:953px; left:761px;"
      />
      <input
        #chestUsage20Input
        [formControl]="alchemistChestControls.chestUsage20"
        id="chest-usage-20"
        type="checkbox"
        class="field checkbox spell-slot-checkbox"
        style="top:953px; left:784px;"
      />

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
        style="top:416px; left:182.09px;"
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
        style="top:474px; left:182.09px;"
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
        style="top:502px; left:182.09px;"
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
        style="top:530px; left:182.09px;"
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
        style="top:593px; left:182.09px;"
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
        style="top:622px; left:182.09px;"
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
        style="top:651px; left:182.09px;"
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
        style="top:679px; left:182.09px;"
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
        style="top:707px; left:182.09px;"
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
        style="top:769px; left:182.09px;"
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
        style="top:798px; left:182.09px;"
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
        style="top:827px; left:182.09px;"
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
        style="top:855px; left:182.09px;"
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
        style="top:883px; left:182.09px;"
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
        style="top:946px; left:182.09px;"
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
        style="top:975px; left:182.09px;"
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
        style="top:1003px; left:182.09px;"
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
        style="top:1033px; left:182.09px;"
      />
      <input
        [formControl]="abilitiesControls.zastrasovani"
        id="zastrasovani"
        class="field"
        style="top:1019.80px; left:348.46px; width:70.74px; text-align: right"
        placeholder="*"
      />

      <!--    =============================================-->

      <button
        (click)="onOpenToolsDialog()"
        type="button"
        matTooltip="Pomůcky"
        style="top:1089px; left:346px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <textarea
        [formControl]="form.controls.pomucky"
        class="field textarea"
        style="top:1126.54px; left:182.09px; width:237.11px; height:167px;"
        placeholder="Pomůcky..."
      ></textarea>

      <!--    Weapons / attacks 1st row -->
      <button
        (click)="onOpenWeaponsAndArmorsDialog()"
        type="button"
        matTooltip="Tabulka zbraní a zbrojí"
        style="top:1002px; left:854px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
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
        class="field checkbox red-checkbox"
        style="top:1252px; left:442.78px;"
      />
      <input
        [formControl]="weaponsControls.zdatnostValecne"
        id="zdatnostSValecnymaZbranema"
        type="checkbox"
        class="field checkbox red-checkbox"
        style="top:1252px; left:568.54px;"
      />
      <input
        [formControl]="weaponsControls.dalsiZdatnosti"
        id="dalsiZdatnostSeZbrani"
        class="field"
        style="top:1248px; left:666.79px; width:514.83px"
        placeholder="Další zdatnosti..."
      />

      <button
        (click)="onOpenExpertiseDialog()"
        type="button"
        matTooltip="Odbornosti"
        style="top:1311px; left:823px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <button
        (click)="onOpenLanguagesDialog()"
        type="button"
        matTooltip="Jazyky"
        style="top:1311px; left:967px;"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
      <input
        [formControl]="languagesControls.jazyky"
        id="jazyky"
        class="field"
        style="top:1349px; left:687px; width:492px"
        placeholder="Jazyky..."
      />
      <textarea
        [formControl]="languagesControls.schopnosti"
        class="field textarea"
        style="top:1382px; left:634.04px; width:550.20px; height:381px;"
        placeholder="Schopnosti..."
      ></textarea>

      <!--    Inventory - column 1 -->
      <button
        (click)="onOpenCarriageDialog()"
        type="button"
        matTooltip="Nosnost"
        style="top:1310px; left:376px"
        class="field button small-info-button-icon"
      >
        <mat-icon class="small-info-icon">info</mat-icon>
      </button>
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

      <second-page [form]="controls.secondPageForm" />

      <third-page [form]="controls.thirdPageForm" />

      <button (click)="onSaveClick()" type="submit" class="field button" style="top:4px; left:1090px; width:150px;">
        Uložit [enter]
      </button>
      <!--      <p id="infoMessage" class="field" style="top:-11px; left:471px; width:350px;">-->
      <!--        @if (characterSheetStore.characterSheetSaved()) { Uložení bylo úspěšné. } @else if-->
      <!--        (characterSheetStore.characterSheetError()) {-->
      <!--        {{ characterSheetStore.characterSheetError() }}-->
      <!--        } @else if(infoMessage()) {-->
      <!--        {{ infoMessage() }}-->
      <!--        }-->
      <!--      </p>-->
    </form>
  `,
  styleUrl: 'character-sheet.component.scss',
  providers: [CharacterSheetStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgClass, MatTooltip, SecondPageComponent, ThirdPageComponent, MatIcon],
})
export class CharacterSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  @ViewChild('level1Slot1Input') level1Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level1Slot2Input') level1Slot2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level1Slot3Input') level1Slot3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level1Slot4Input') level1Slot4Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level2Slot1Input') level2Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level2Slot2Input') level2Slot2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level2Slot3Input') level2Slot3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level2Slot4Input') level2Slot4Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level3Slot1Input') level3Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level3Slot2Input') level3Slot2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level3Slot3Input') level3Slot3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level3Slot4Input') level3Slot4Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level4Slot1Input') level4Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level4Slot2Input') level4Slot2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level4Slot3Input') level4Slot3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level4Slot4Input') level4Slot4Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level5Slot1Input') level5Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level5Slot2Input') level5Slot2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level5Slot3Input') level5Slot3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level5Slot4Input') level5Slot4Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level6Slot1Input') level6Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level6Slot2Input') level6Slot2Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level7Slot1Input') level7Slot1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('level7Slot2Input') level7Slot2Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level8Slot1Input') level8Slot1Input!: ElementRef<HTMLInputElement>;

  @ViewChild('level9Slot1Input') level9Slot1Input!: ElementRef<HTMLInputElement>;

  @ViewChild('chestUsage1Input') chestUsage1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage2Input') chestUsage2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage3Input') chestUsage3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage4Input') chestUsage4Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage5Input') chestUsage5Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage6Input') chestUsage6Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage7Input') chestUsage7Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage8Input') chestUsage8Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage9Input') chestUsage9Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage10Input') chestUsage10Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage11Input') chestUsage11Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage12Input') chestUsage12Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage13Input') chestUsage13Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage14Input') chestUsage14Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage15Input') chestUsage15Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage16Input') chestUsage16Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage17Input') chestUsage17Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage18Input') chestUsage18Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage19Input') chestUsage19Input!: ElementRef<HTMLInputElement>;
  @ViewChild('chestUsage20Input') chestUsage20Input!: ElementRef<HTMLInputElement>;

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
    spellSlotsForm: this.fb.group<SpellSlotsForm>({
      urovenSesilatele: this.fb.control(''),
      urovenCernokneznika: this.fb.control(''),

      level1Slot1: this.fb.control(''),
      level1Slot2: this.fb.control(''),
      level1Slot3: this.fb.control(''),
      level1Slot4: this.fb.control(''),

      level2Slot1: this.fb.control(''),
      level2Slot2: this.fb.control(''),
      level2Slot3: this.fb.control(''),
      level2Slot4: this.fb.control(''),

      level3Slot1: this.fb.control(''),
      level3Slot2: this.fb.control(''),
      level3Slot3: this.fb.control(''),
      level3Slot4: this.fb.control(''),

      level4Slot1: this.fb.control(''),
      level4Slot2: this.fb.control(''),
      level4Slot3: this.fb.control(''),
      level4Slot4: this.fb.control(''),

      level5Slot1: this.fb.control(''),
      level5Slot2: this.fb.control(''),
      level5Slot3: this.fb.control(''),
      level5Slot4: this.fb.control(''),

      level6Slot1: this.fb.control(''),
      level6Slot2: this.fb.control(''),

      level7Slot1: this.fb.control(''),
      level7Slot2: this.fb.control(''),

      level8Slot1: this.fb.control(''),

      level9Slot1: this.fb.control(''),
    }),
    alchemistChestForm: this.fb.group<AlchemistChestForm>({
      urovenAlchymisty: this.fb.control(''),

      chestUsage1: this.fb.control(''),
      chestUsage2: this.fb.control(''),
      chestUsage3: this.fb.control(''),
      chestUsage4: this.fb.control(''),
      chestUsage5: this.fb.control(''),
      chestUsage6: this.fb.control(''),
      chestUsage7: this.fb.control(''),
      chestUsage8: this.fb.control(''),
      chestUsage9: this.fb.control(''),
      chestUsage10: this.fb.control(''),
      chestUsage11: this.fb.control(''),
      chestUsage12: this.fb.control(''),
      chestUsage13: this.fb.control(''),
      chestUsage14: this.fb.control(''),
      chestUsage15: this.fb.control(''),
      chestUsage16: this.fb.control(''),
      chestUsage17: this.fb.control(''),
      chestUsage18: this.fb.control(''),
      chestUsage19: this.fb.control(''),
      chestUsage20: this.fb.control(''),
    }),
    secondPageForm: SecondPageComponent.createForm(),
    thirdPageForm: ThirdPageComponent.createForm(),
  });

  get controls() {
    return this.form.controls;
  }

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

  get spellSlotsControls() {
    return this.form.controls.spellSlotsForm.controls;
  }

  get alchemistChestControls() {
    return this.form.controls.alchemistChestForm.controls;
  }

  constructor() {
    this.main6SkillsControls.silaOprava.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(strength => {
      this._setInventoryClasses(strength ?? '0');
    });

    this.spellSlotsControls.urovenSesilatele.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(level => {
      const levelNumber = parseInt(level ?? '0');

      switch (levelNumber) {
        case 1:
          this._setSpellSlotsLevel1();
          break;
        case 2:
          this._setSpellSlotsLevel2();
          break;
        case 3:
          this._setSpellSlotsLevel3();
          break;
        case 4:
          this._setSpellSlotsLevel4();
          break;
        case 5:
          this._setSpellSlotsLevel5();
          break;
        case 6:
          this._setSpellSlotsLevel6();
          break;
        case 7:
          this._setSpellSlotsLevel7();
          break;
        case 8:
          this._setSpellSlotsLevel8();
          break;
        case 9:
          this._setSpellSlotsLevel9();
          break;
        case 10:
          this._setSpellSlotsLevel10();
          break;
        case 11:
          this._setSpellSlotsLevel11();
          break;
        case 12:
          this._setSpellSlotsLevel12();
          break;
        case 13:
          this._setSpellSlotsLevel13();
          break;
        case 14:
          this._setSpellSlotsLevel14();
          break;
        case 15:
          this._setSpellSlotsLevel15();
          break;
        case 16:
          this._setSpellSlotsLevel16();
          break;
        case 17:
          this._setSpellSlotsLevel17();
          break;
        case 18:
          this._setSpellSlotsLevel18();
          break;
        case 19:
          this._setSpellSlotsLevel19();
          break;
        case 20:
          this._setSpellSlotsLevel20();
          break;
        default:
          this._enableAllSpellSlotsInputs();
      }
    });

    this.spellSlotsControls.urovenCernokneznika.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(level => {
      const levelNumber = parseInt(level ?? '0');

      switch (levelNumber) {
        case 1:
          this._setBlackPriestSpellSlotsLevel1();
          break;
        case 2:
          this._setBlackPriestSpellSlotsLevel2();
          break;
        case 3:
          this._setBlackPriestSpellSlotsLevel3();
          break;
        case 4:
          this._setBlackPriestSpellSlotsLevel3();
          break;
        case 5:
          this._setBlackPriestSpellSlotsLevel5();
          break;
        case 6:
          this._setBlackPriestSpellSlotsLevel5();
          break;
        case 7:
          this._setBlackPriestSpellSlotsLevel7();
          break;
        case 8:
          this._setBlackPriestSpellSlotsLevel7();
          break;
        case 9:
          this._setBlackPriestSpellSlotsLevel9();
          break;
        case 10:
          this._setBlackPriestSpellSlotsLevel9();
          break;
        case 11:
          this._setBlackPriestSpellSlotsLevel11();
          break;
        case 12:
          this._setBlackPriestSpellSlotsLevel11();
          break;
        case 13:
          this._setBlackPriestSpellSlotsLevel13();
          break;
        case 14:
          this._setBlackPriestSpellSlotsLevel13();
          break;
        case 15:
          this._setBlackPriestSpellSlotsLevel15();
          break;
        case 16:
          this._setBlackPriestSpellSlotsLevel15();
          break;
        case 17:
          this._setBlackPriestSpellSlotsLevel17();
          break;
        case 18:
          this._setBlackPriestSpellSlotsLevel17();
          break;
        case 19:
          this._setBlackPriestSpellSlotsLevel17();
          break;
        case 20:
          this._setBlackPriestSpellSlotsLevel17();
          break;
        default:
          this._enableAllSpellSlotsInputs();
      }
    });

    this.alchemistChestControls.urovenAlchymisty.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(level => {
      const levelNumber = parseInt(level ?? '0');

      switch (levelNumber) {
        case 1:
          this._setAlchemistChestUsagesLevel1();
          break;
        case 2:
          this._setAlchemistChestUsagesLevel2();
          break;
        case 3:
          this._setAlchemistChestUsagesLevel3();
          break;
        case 4:
          this._setAlchemistChestUsagesLevel4();
          break;
        case 5:
          this._setAlchemistChestUsagesLevel5();
          break;
        case 6:
          this._setAlchemistChestUsagesLevel6();
          break;
        case 7:
          this._setAlchemistChestUsagesLevel7();
          break;
        case 8:
          this._setAlchemistChestUsagesLevel8();
          break;
        case 9:
          this._setAlchemistChestUsagesLevel9();
          break;
        case 10:
          this._setAlchemistChestUsagesLevel10();
          break;
        case 11:
          this._setAlchemistChestUsagesLevel11();
          break;
        case 12:
          this._setAlchemistChestUsagesLevel12();
          break;
        case 13:
          this._setAlchemistChestUsagesLevel13();
          break;
        case 14:
          this._setAlchemistChestUsagesLevel14();
          break;
        case 15:
          this._setAlchemistChestUsagesLevel15();
          break;
        case 16:
          this._setAlchemistChestUsagesLevel16();
          break;
        case 17:
          this._setAlchemistChestUsagesLevel17();
          break;
        case 18:
          this._setAlchemistChestUsagesLevel18();
          break;
        case 19:
          this._setAlchemistChestUsagesLevel19();
          break;
        case 20:
          this._setAlchemistChestUsagesLevel20();
          break;
        default:
          this._enableAllChestUsagesInputs();
      }
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
      this.snackBar.open('Pro uložení postavy se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
    }
  }

  onOpenWeaponsAndArmorsDialog() {
    openWeaponsAndArmorsDialog(this.dialog);
  }

  onOpenDamagesDialog() {
    openDamagesDialog(this.dialog);
  }

  onOpenToolsDialog() {
    openToolsDialog(this.dialog);
  }

  onOpenCarriageDialog() {
    openCarriageDialog(this.dialog);
  }

  onOpenBackgroundDialog() {
    openBackgroundDialog(this.dialog);
  }

  onOpenConvictionDialog() {
    openConvictionDialog(this.dialog);
  }

  onOpenLevelsDialog() {
    openLevelsDialog(this.dialog);
  }

  onOpenExpertiseDialog() {
    openExpertiseDialog(this.dialog);
  }

  onOpenLanguagesDialog() {
    openLanguagesDialog(this.dialog);
  }

  onOpenSpellsDialog() {
    openSpellsDialog(this.dialog);
  }

  onOpenAlchemistDialog() {
    openAlchemistDialog(this.dialog);
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

  _setSpellSlotsLevel1() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel2() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel3() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel4() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel5() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel6() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
    this.level3Slot3Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel7() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
    this.level3Slot3Input.nativeElement.disabled = false;

    this.level4Slot1Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel8() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
    this.level3Slot3Input.nativeElement.disabled = false;

    this.level4Slot1Input.nativeElement.disabled = false;
    this.level4Slot2Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel9() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
    this.level3Slot3Input.nativeElement.disabled = false;

    this.level4Slot1Input.nativeElement.disabled = false;
    this.level4Slot2Input.nativeElement.disabled = false;
    this.level4Slot3Input.nativeElement.disabled = false;

    this.level5Slot1Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel10() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
    this.level3Slot3Input.nativeElement.disabled = false;

    this.level4Slot1Input.nativeElement.disabled = false;
    this.level4Slot2Input.nativeElement.disabled = false;
    this.level4Slot3Input.nativeElement.disabled = false;

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
  }

  _setSpellSlotsLevel11() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot1Input.nativeElement.disabled = true;
    this.level7Slot2Input.nativeElement.disabled = true;

    this.level8Slot1Input.nativeElement.disabled = true;
    this.level9Slot1Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel12() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot1Input.nativeElement.disabled = true;
    this.level7Slot2Input.nativeElement.disabled = true;

    this.level8Slot1Input.nativeElement.disabled = true;
    this.level9Slot1Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel13() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;

    this.level8Slot1Input.nativeElement.disabled = true;
    this.level9Slot1Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel14() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;

    this.level8Slot1Input.nativeElement.disabled = true;
    this.level9Slot1Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel15() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;

    this.level9Slot1Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel16() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel17() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel18() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel19() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot4Input.nativeElement.disabled = true;

    this.level7Slot2Input.nativeElement.disabled = true;
  }

  _setSpellSlotsLevel20() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();

    this.level5Slot4Input.nativeElement.disabled = true;
  }

  _setBlackPriestSpellSlotsLevel1() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel2() {
    this._disableAllSpellSlotsInputs();

    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel3() {
    this._disableAllSpellSlotsInputs();

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel5() {
    this._disableAllSpellSlotsInputs();

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel7() {
    this._disableAllSpellSlotsInputs();

    this.level4Slot1Input.nativeElement.disabled = false;
    this.level4Slot2Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel9() {
    this._disableAllSpellSlotsInputs();

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel11() {
    this._disableAllSpellSlotsInputs();

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
    this.level5Slot3Input.nativeElement.disabled = false;

    this.level6Slot1Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel13() {
    this._disableAllSpellSlotsInputs();

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
    this.level5Slot3Input.nativeElement.disabled = false;

    this.level6Slot1Input.nativeElement.disabled = false;

    this.level7Slot1Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel15() {
    this._disableAllSpellSlotsInputs();

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
    this.level5Slot3Input.nativeElement.disabled = false;

    this.level6Slot1Input.nativeElement.disabled = false;

    this.level7Slot1Input.nativeElement.disabled = false;

    this.level8Slot1Input.nativeElement.disabled = false;
  }

  _setBlackPriestSpellSlotsLevel17() {
    this._disableAllSpellSlotsInputs();

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
    this.level5Slot3Input.nativeElement.disabled = false;
    this.level5Slot4Input.nativeElement.disabled = false;

    this.level6Slot1Input.nativeElement.disabled = false;

    this.level7Slot1Input.nativeElement.disabled = false;

    this.level8Slot1Input.nativeElement.disabled = false;

    this.level9Slot1Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel1() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel2() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel3() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel4() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel5() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel6() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
    this.chestUsage6Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel7() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
    this.chestUsage6Input.nativeElement.disabled = false;
    this.chestUsage7Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel8() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
    this.chestUsage6Input.nativeElement.disabled = false;
    this.chestUsage7Input.nativeElement.disabled = false;
    this.chestUsage8Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel9() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
    this.chestUsage6Input.nativeElement.disabled = false;
    this.chestUsage7Input.nativeElement.disabled = false;
    this.chestUsage8Input.nativeElement.disabled = false;
    this.chestUsage9Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel10() {
    this._disableAllChestUsagesInputs();

    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
    this.chestUsage6Input.nativeElement.disabled = false;
    this.chestUsage7Input.nativeElement.disabled = false;
    this.chestUsage8Input.nativeElement.disabled = false;
    this.chestUsage9Input.nativeElement.disabled = false;
    this.chestUsage10Input.nativeElement.disabled = false;
  }

  _setAlchemistChestUsagesLevel11() {
    this._enableAllChestUsagesInputs();

    this.chestUsage12Input.nativeElement.disabled = true;
    this.chestUsage13Input.nativeElement.disabled = true;
    this.chestUsage14Input.nativeElement.disabled = true;
    this.chestUsage15Input.nativeElement.disabled = true;
    this.chestUsage16Input.nativeElement.disabled = true;
    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel12() {
    this._enableAllChestUsagesInputs();

    this.chestUsage13Input.nativeElement.disabled = true;
    this.chestUsage14Input.nativeElement.disabled = true;
    this.chestUsage15Input.nativeElement.disabled = true;
    this.chestUsage16Input.nativeElement.disabled = true;
    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel13() {
    this._enableAllChestUsagesInputs();

    this.chestUsage14Input.nativeElement.disabled = true;
    this.chestUsage15Input.nativeElement.disabled = true;
    this.chestUsage16Input.nativeElement.disabled = true;
    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel14() {
    this._enableAllChestUsagesInputs();

    this.chestUsage15Input.nativeElement.disabled = true;
    this.chestUsage16Input.nativeElement.disabled = true;
    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel15() {
    this._enableAllChestUsagesInputs();

    this.chestUsage16Input.nativeElement.disabled = true;
    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel16() {
    this._enableAllChestUsagesInputs();

    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel17() {
    this._enableAllChestUsagesInputs();

    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel18() {
    this._enableAllChestUsagesInputs();

    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel19() {
    this._enableAllChestUsagesInputs();

    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _setAlchemistChestUsagesLevel20() {
    this._enableAllChestUsagesInputs();
  }

  _disableBlackPriestSpellSlotsInputs() {
    this.level2Slot4Input.nativeElement.disabled = true;
    this.level3Slot4Input.nativeElement.disabled = true;
    this.level4Slot4Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;
  }

  _disableAllSpellSlotsInputs() {
    this.level1Slot1Input.nativeElement.disabled = true;
    this.level1Slot2Input.nativeElement.disabled = true;
    this.level1Slot3Input.nativeElement.disabled = true;
    this.level1Slot4Input.nativeElement.disabled = true;

    this.level2Slot1Input.nativeElement.disabled = true;
    this.level2Slot2Input.nativeElement.disabled = true;
    this.level2Slot3Input.nativeElement.disabled = true;
    this.level2Slot4Input.nativeElement.disabled = true;

    this.level3Slot1Input.nativeElement.disabled = true;
    this.level3Slot2Input.nativeElement.disabled = true;
    this.level3Slot3Input.nativeElement.disabled = true;
    this.level3Slot4Input.nativeElement.disabled = true;

    this.level4Slot1Input.nativeElement.disabled = true;
    this.level4Slot2Input.nativeElement.disabled = true;
    this.level4Slot3Input.nativeElement.disabled = true;
    this.level4Slot4Input.nativeElement.disabled = true;

    this.level5Slot1Input.nativeElement.disabled = true;
    this.level5Slot2Input.nativeElement.disabled = true;
    this.level5Slot3Input.nativeElement.disabled = true;
    this.level5Slot4Input.nativeElement.disabled = true;

    this.level6Slot1Input.nativeElement.disabled = true;
    this.level6Slot2Input.nativeElement.disabled = true;

    this.level7Slot1Input.nativeElement.disabled = true;
    this.level7Slot2Input.nativeElement.disabled = true;

    this.level8Slot1Input.nativeElement.disabled = true;

    this.level9Slot1Input.nativeElement.disabled = true;
  }

  _enableAllSpellSlotsInputs() {
    this.level1Slot1Input.nativeElement.disabled = false;
    this.level1Slot2Input.nativeElement.disabled = false;
    this.level1Slot3Input.nativeElement.disabled = false;
    this.level1Slot4Input.nativeElement.disabled = false;

    this.level2Slot1Input.nativeElement.disabled = false;
    this.level2Slot2Input.nativeElement.disabled = false;
    this.level2Slot3Input.nativeElement.disabled = false;
    this.level2Slot4Input.nativeElement.disabled = false;

    this.level3Slot1Input.nativeElement.disabled = false;
    this.level3Slot2Input.nativeElement.disabled = false;
    this.level3Slot3Input.nativeElement.disabled = false;
    this.level3Slot4Input.nativeElement.disabled = false;

    this.level4Slot1Input.nativeElement.disabled = false;
    this.level4Slot2Input.nativeElement.disabled = false;
    this.level4Slot3Input.nativeElement.disabled = false;
    this.level4Slot4Input.nativeElement.disabled = false;

    this.level5Slot1Input.nativeElement.disabled = false;
    this.level5Slot2Input.nativeElement.disabled = false;
    this.level5Slot3Input.nativeElement.disabled = false;
    this.level5Slot4Input.nativeElement.disabled = false;

    this.level6Slot1Input.nativeElement.disabled = false;
    this.level6Slot2Input.nativeElement.disabled = false;

    this.level7Slot1Input.nativeElement.disabled = false;
    this.level7Slot2Input.nativeElement.disabled = false;

    this.level8Slot1Input.nativeElement.disabled = false;

    this.level9Slot1Input.nativeElement.disabled = false;
  }

  _disableAllChestUsagesInputs() {
    this.chestUsage1Input.nativeElement.disabled = true;
    this.chestUsage2Input.nativeElement.disabled = true;
    this.chestUsage3Input.nativeElement.disabled = true;
    this.chestUsage4Input.nativeElement.disabled = true;
    this.chestUsage5Input.nativeElement.disabled = true;
    this.chestUsage6Input.nativeElement.disabled = true;
    this.chestUsage7Input.nativeElement.disabled = true;
    this.chestUsage8Input.nativeElement.disabled = true;
    this.chestUsage9Input.nativeElement.disabled = true;
    this.chestUsage10Input.nativeElement.disabled = true;
    this.chestUsage11Input.nativeElement.disabled = true;
    this.chestUsage12Input.nativeElement.disabled = true;
    this.chestUsage13Input.nativeElement.disabled = true;
    this.chestUsage14Input.nativeElement.disabled = true;
    this.chestUsage15Input.nativeElement.disabled = true;
    this.chestUsage16Input.nativeElement.disabled = true;
    this.chestUsage17Input.nativeElement.disabled = true;
    this.chestUsage18Input.nativeElement.disabled = true;
    this.chestUsage19Input.nativeElement.disabled = true;
    this.chestUsage20Input.nativeElement.disabled = true;
  }

  _enableAllChestUsagesInputs() {
    this.chestUsage1Input.nativeElement.disabled = false;
    this.chestUsage2Input.nativeElement.disabled = false;
    this.chestUsage3Input.nativeElement.disabled = false;
    this.chestUsage4Input.nativeElement.disabled = false;
    this.chestUsage5Input.nativeElement.disabled = false;
    this.chestUsage6Input.nativeElement.disabled = false;
    this.chestUsage7Input.nativeElement.disabled = false;
    this.chestUsage8Input.nativeElement.disabled = false;
    this.chestUsage9Input.nativeElement.disabled = false;
    this.chestUsage10Input.nativeElement.disabled = false;
    this.chestUsage11Input.nativeElement.disabled = false;
    this.chestUsage12Input.nativeElement.disabled = false;
    this.chestUsage13Input.nativeElement.disabled = false;
    this.chestUsage14Input.nativeElement.disabled = false;
    this.chestUsage15Input.nativeElement.disabled = false;
    this.chestUsage16Input.nativeElement.disabled = false;
    this.chestUsage17Input.nativeElement.disabled = false;
    this.chestUsage18Input.nativeElement.disabled = false;
    this.chestUsage19Input.nativeElement.disabled = false;
    this.chestUsage20Input.nativeElement.disabled = false;
  }
}
