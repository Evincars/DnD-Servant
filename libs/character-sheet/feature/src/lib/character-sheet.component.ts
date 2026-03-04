import {
  afterNextRender,
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
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
  SpellSlotsForm,
  AlchemistChestForm,
  TopInfoForm,
  InventoryForm,
} from '@dn-d-servant/character-sheet-util';
import { RichTextareaComponent, SpinnerOverlayComponent, DiceRollerService } from '@dn-d-servant/ui';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { CharacterSheetFormModelMappers } from './api-mappers/character-sheet-form-model-mappers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { CharacterSheetSecondPageComponent } from './character-sheet-second-page.component';
import { CharacterSheetThirdPageComponent } from './character-sheet-third-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, merge } from 'rxjs';
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
import { openArmorClassDialog } from './help-dialogs/armor-class-dialog.component';
import { openWeaponsDialog } from './help-dialogs/weapons-dialog.component';
import { openManeuversDialog } from './help-dialogs/maneuvers-dialog.component';
import { openSpecialSituationsDialog } from './help-dialogs/special-situations-dialog.component';

@Component({
  selector: 'character-sheet',
  template: `
    <spinner-overlay [diameter]="70" [showSpinner]="characterSheetStore.loading()">
      <img src="character-sheet-1-copy.webp" alt="Character Sheet" height="1817" width="1293" />

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
          matTooltip="Ke každé Dovednosti se kterou máš zdatnost připočítej tento bonus"
          class="field readonly-field"
          readonly
          style="top:274.37px; left:183.4px; width:44.54px; text-align: center"
          placeholder="ZB"
        />
        <input
          [formControl]="abilityBonusControls.inspirace"
          matTooltip="Utrať jednu inspiraci abys měl VÝHODU na ověření schopnosti, záchranný hod nebo útočný hod"
          class="field"
          style="top:274.37px; left:445.4px; width:44.54px; text-align: center"
          placeholder="*"
        />
        <input
          [formControl]="abilityBonusControls.iniciativa"
          matTooltip="stejné jako oprava Obratnosti"
          class="field"
          style="top:274.37px; left:627.49px; width:44.54px; text-align: center"
          placeholder="In."
        />

        <input
          [formControl]="speedAndHealingDicesControls.lehke"
          [ngClass]="{ 'speed-highlight-light': speedHighlight() === 'light' }"
          class="field"
          style="top:308.89px; left:829.23px; width:110.04px;"
          placeholder="Lehké"
        />
        <input
          [formControl]="speedAndHealingDicesControls.stredni"
          [ngClass]="{ 'speed-highlight-medium': speedHighlight() === 'medium' }"
          class="field"
          style="top:308.89px; left:952.37px; width:110.04px;"
          placeholder="Střední"
        />
        <input
          [formControl]="speedAndHealingDicesControls.tezke"
          [ngClass]="{ 'speed-highlight-heavy': speedHighlight() === 'heavy' }"
          class="field"
          style="top:308.89px; left:1073.89px; width:110.04px;"
          placeholder="Těžké"
        />

        <input
          [formControl]="speedAndHealingDicesControls.maxBoduVydrze"
          class="field"
          style="top:283px; left:1193.41px; width:68.12px; text-align: center; font-size: 18px; color: red;"
          placeholder="20 / 20"
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

        <rich-textarea
          [formControl]="form.controls['infoAboutCharacter']"
          class="field textarea"
          style="top:545.1px; left:834.47px; width:349.77px; height:432px;"
        ></rich-textarea>

        <button
          (click)="onOpenArmorClassDialog()"
          type="button"
          matTooltip="Zbroje a obranné číslo"
          style="top:345px; left:700px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <input
          [formControl]="armorClassControls.zbroj"
          matTooltip="Podívej se do tabulky Zbrojí kolik ti dává OČ"
          class="field"
          style="top:416px; left:478px; width:61px; text-align: center; font-size: 22px;"
          placeholder="Zbroj"
        />
        <input
          [formControl]="armorClassControls.bezeZbroje"
          matTooltip="10 + oprava Obratnosti"
          class="field"
          style="top:416.09px; left:582.95px; width:61.57px; text-align: center; font-size: 22px;"
          placeholder="Bez"
        />
        <input
          [formControl]="armorClassControls.jine"
          matTooltip="Kolik Ti přičítá štít nebo jiná ochrana (např. magická)"
          class="field"
          style="top:416.09px; left:692.99px; width:61.57px; text-align: center; font-size: 22px;"
          placeholder="Jiné"
        />

        <!--    Proficiency with armors -->
        <div
          [ngClass]="abilityCheckboxClass(armorClassControls.zdatnostLehke)"
          (click)="cycleAbilityZdatnost(armorClassControls.zdatnostLehke)"
          class="field ability-zdatnost-checkbox"
          style="top:484.51px; left:453.33px;"
        ></div>
        <div
          [ngClass]="abilityCheckboxClass(armorClassControls.zdatnostStredni)"
          (click)="cycleAbilityZdatnost(armorClassControls.zdatnostStredni)"
          class="field ability-zdatnost-checkbox"
          style="top:484.51px; left:545.03px;"
        ></div>
        <div
          [ngClass]="abilityCheckboxClass(armorClassControls.zdatnostTezke)"
          (click)="cycleAbilityZdatnost(armorClassControls.zdatnostTezke)"
          class="field ability-zdatnost-checkbox"
          style="top:484.51px; left:647.52px;"
        ></div>
        <div
          [ngClass]="abilityCheckboxClass(armorClassControls.zdatnostStity)"
          (click)="cycleAbilityZdatnost(armorClassControls.zdatnostStity)"
          class="field ability-zdatnost-checkbox"
          style="top:484.51px; left:737.91px;"
        ></div>

        <!--    Saving throws -->
        <div
          [ngClass]="abilityCheckboxClass(savingThrowsControls.silaZdatnost)"
          (click)="cycleAbilityZdatnost(savingThrowsControls.silaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:575.36px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:559.64px; left:554.13px; width:61.57px;">
          <input
            [formControl]="savingThrowsControls.sila"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="SIL"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(savingThrowsControls.sila.value, 'Záchranný hod Síla')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(savingThrowsControls.obratnostZdatnost)"
          (click)="cycleAbilityZdatnost(savingThrowsControls.obratnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:602.61px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:588.71px; left:554.13px; width:61.57px;">
          <input
            [formControl]="savingThrowsControls.obratnost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="OBR"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(savingThrowsControls.obratnost.value, 'Záchranný hod Obratnost')"
          >
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(savingThrowsControls.odolnostZdatnost)"
          (click)="cycleAbilityZdatnost(savingThrowsControls.odolnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:631.68px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:617.78px; left:554.13px; width:61.57px;">
          <input
            [formControl]="savingThrowsControls.odolnost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="ODL"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(savingThrowsControls.odolnost.value, 'Záchranný hod Odolnost')"
          >
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(savingThrowsControls.inteligenceZdatnost)"
          (click)="cycleAbilityZdatnost(savingThrowsControls.inteligenceZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:660.75px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:646.85px; left:554.13px; width:61.57px;">
          <input
            [formControl]="savingThrowsControls.inteligence"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="INT"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(savingThrowsControls.inteligence.value, 'Záchranný hod Inteligence')"
          >
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(savingThrowsControls.moudrostZdatnost)"
          (click)="cycleAbilityZdatnost(savingThrowsControls.moudrostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:688.01px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:675.92px; left:554.13px; width:61.57px;">
          <input
            [formControl]="savingThrowsControls.moudrost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="MDR"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(savingThrowsControls.moudrost.value, 'Záchranný hod Moudrost')"
          >
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(savingThrowsControls.charismaZdatnost)"
          (click)="cycleAbilityZdatnost(savingThrowsControls.charismaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:717.08px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:703.18px; left:554.13px; width:61.57px;">
          <input
            [formControl]="savingThrowsControls.charisma"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="CHA"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(savingThrowsControls.charisma.value, 'Záchranný hod Charisma')"
          >
            🎲
          </button>
        </span>

        <!--    passive skills -->
        <div
          [ngClass]="abilityCheckboxClass(passiveSkillsControls.atletikaZdatnost)"
          (click)="cycleAbilityZdatnost(passiveSkillsControls.atletikaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:575.36px; left:634.11px;"
        ></div>
        <input
          [formControl]="passiveSkillsControls.atletika"
          class="field no-pb"
          style="top:559.64px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="ATL"
        />
        <div
          [ngClass]="abilityCheckboxClass(passiveSkillsControls.akrobacieZdatnost)"
          (click)="cycleAbilityZdatnost(passiveSkillsControls.akrobacieZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:602.61px; left:634.11px;"
        ></div>
        <input
          [formControl]="passiveSkillsControls.akrobacie"
          class="field no-pb"
          style="top:588.71px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="AKR"
        />
        <div
          [ngClass]="abilityCheckboxClass(passiveSkillsControls.nenapadnostZdatnost)"
          (click)="cycleAbilityZdatnost(passiveSkillsControls.nenapadnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:631.68px; left:634.11px;"
        ></div>
        <input
          [formControl]="passiveSkillsControls.nenapadnost"
          class="field no-pb"
          style="top:617.78px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="NEN"
        />
        <div
          [ngClass]="abilityCheckboxClass(passiveSkillsControls.vhledZdatnost)"
          (click)="cycleAbilityZdatnost(passiveSkillsControls.vhledZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:660.75px; left:634.11px;"
        ></div>
        <input
          [formControl]="passiveSkillsControls.vhled"
          class="field no-pb"
          style="top:646.85px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="VHL"
        />
        <div
          [ngClass]="abilityCheckboxClass(passiveSkillsControls.vnimaniZdatnost)"
          (click)="cycleAbilityZdatnost(passiveSkillsControls.vnimaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:688.01px; left:634.11px;"
        ></div>
        <input
          [formControl]="passiveSkillsControls.vnimani"
          class="field no-pb"
          style="top:675.92px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="VNI"
        />
        <div
          [ngClass]="abilityCheckboxClass(passiveSkillsControls.jineZdatnost)"
          (click)="cycleAbilityZdatnost(passiveSkillsControls.jineZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:717.08px; left:634.11px;"
        ></div>
        <input
          [formControl]="passiveSkillsControls.jineNazev"
          class="field no-pb"
          style="top:703.18px; left:655px; width:82.53px; text-align: left;"
          placeholder="-"
        />
        <input
          [formControl]="passiveSkillsControls.jine"
          class="field no-pb"
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
          matTooltip="Alchymistická truhla"
          style="top:764px; left:772px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <input
          [formControl]="spellsAndAlchemistChestControls.vlastnost"
          matTooltip="Tvoje sesílací vlastnost (podle povolání)"
          class="field"
          style="top:803px; left:442px; width:144px;"
          placeholder="Vlastnost"
        />
        <input
          [formControl]="spellsAndAlchemistChestControls.utBonus"
          matTooltip="zdat. bonus + oprava sesílací vlastnosti"
          class="field"
          style="top:803.11px; left:603.91px; width:94.32px;"
          placeholder="Út bonus"
        />
        <input
          [formControl]="spellsAndAlchemistChestControls.soZachrany"
          matTooltip="8 + zdat. bonus + oprava sesílací vlastnosti"
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

        <div
          #level1Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level1Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level1Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level1Slot1)"
          style="top:895px; left:444px;"
        ></div>
        <div
          #level1Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level1Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level1Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level1Slot2)"
          style="top:915px; left:444px;"
        ></div>
        <div
          #level1Slot3Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level1Slot3.disabled"
          [attr.data-state]="spellSlotsControls.level1Slot3.value"
          (click)="cycleSlot(spellSlotsControls.level1Slot3)"
          style="top:936px; left:444px;"
        ></div>
        <div
          #level1Slot4Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level1Slot4.disabled"
          [attr.data-state]="spellSlotsControls.level1Slot4.value"
          (click)="cycleSlot(spellSlotsControls.level1Slot4)"
          style="top:956px; left:444px;"
        ></div>

        <div
          #level2Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level2Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level2Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level2Slot1)"
          style="top:895px; left:471px;"
        ></div>
        <div
          #level2Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level2Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level2Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level2Slot2)"
          style="top:915px; left:471px;"
        ></div>
        <div
          #level2Slot3Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level2Slot3.disabled"
          [attr.data-state]="spellSlotsControls.level2Slot3.value"
          (click)="cycleSlot(spellSlotsControls.level2Slot3)"
          style="top:936px; left:471px;"
        ></div>
        <div
          #level2Slot4Input
          class="spell-slot-cb spell-slot-cb--black-priest"
          [class.disabled]="spellSlotsControls.level2Slot4.disabled"
          [attr.data-state]="spellSlotsControls.level2Slot4.value"
          (click)="cycleSlot(spellSlotsControls.level2Slot4)"
          style="top:956px; left:471px;"
        ></div>

        <div
          #level3Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level3Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level3Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level3Slot1)"
          style="top:895px; left:498px;"
        ></div>
        <div
          #level3Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level3Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level3Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level3Slot2)"
          style="top:915px; left:498px;"
        ></div>
        <div
          #level3Slot3Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level3Slot3.disabled"
          [attr.data-state]="spellSlotsControls.level3Slot3.value"
          (click)="cycleSlot(spellSlotsControls.level3Slot3)"
          style="top:936px; left:498px;"
        ></div>
        <div
          #level3Slot4Input
          class="spell-slot-cb spell-slot-cb--black-priest"
          [class.disabled]="spellSlotsControls.level3Slot4.disabled"
          [attr.data-state]="spellSlotsControls.level3Slot4.value"
          (click)="cycleSlot(spellSlotsControls.level3Slot4)"
          style="top:956px; left:498px;"
        ></div>

        <div
          #level4Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level4Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level4Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level4Slot1)"
          style="top:895px; left:525px;"
        ></div>
        <div
          #level4Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level4Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level4Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level4Slot2)"
          style="top:915px; left:525px;"
        ></div>
        <div
          #level4Slot3Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level4Slot3.disabled"
          [attr.data-state]="spellSlotsControls.level4Slot3.value"
          (click)="cycleSlot(spellSlotsControls.level4Slot3)"
          style="top:936px; left:525px;"
        ></div>
        <div
          #level4Slot4Input
          class="spell-slot-cb spell-slot-cb--black-priest"
          [class.disabled]="spellSlotsControls.level4Slot4.disabled"
          [attr.data-state]="spellSlotsControls.level4Slot4.value"
          (click)="cycleSlot(spellSlotsControls.level4Slot4)"
          style="top:956px; left:525px;"
        ></div>

        <div
          #level5Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level5Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level5Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level5Slot1)"
          style="top:895px; left:552px;"
        ></div>
        <div
          #level5Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level5Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level5Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level5Slot2)"
          style="top:915px; left:552px;"
        ></div>
        <div
          #level5Slot3Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level5Slot3.disabled"
          [attr.data-state]="spellSlotsControls.level5Slot3.value"
          (click)="cycleSlot(spellSlotsControls.level5Slot3)"
          style="top:936px; left:552px;"
        ></div>
        <div
          #level5Slot4Input
          class="spell-slot-cb spell-slot-cb--black-priest"
          [class.disabled]="spellSlotsControls.level5Slot4.disabled"
          [attr.data-state]="spellSlotsControls.level5Slot4.value"
          (click)="cycleSlot(spellSlotsControls.level5Slot4)"
          style="top:956px; left:552px;"
        ></div>

        <div
          #level6Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level6Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level6Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level6Slot1)"
          style="top:895px; left:579px;"
        ></div>
        <div
          #level6Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level6Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level6Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level6Slot2)"
          style="top:915px; left:579px;"
        ></div>

        <div
          #level7Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level7Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level7Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level7Slot1)"
          style="top:895px; left:605px;"
        ></div>
        <div
          #level7Slot2Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level7Slot2.disabled"
          [attr.data-state]="spellSlotsControls.level7Slot2.value"
          (click)="cycleSlot(spellSlotsControls.level7Slot2)"
          style="top:915px; left:605px;"
        ></div>

        <div
          #level8Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level8Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level8Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level8Slot1)"
          style="top:895px; left:632px;"
        ></div>

        <div
          #level9Slot1Input
          class="spell-slot-cb"
          [class.disabled]="spellSlotsControls.level9Slot1.disabled"
          [attr.data-state]="spellSlotsControls.level9Slot1.value"
          (click)="cycleSlot(spellSlotsControls.level9Slot1)"
          style="top:895px; left:659px;"
        ></div>

        <!--      Alchemist chest-->
        <div
          #chestUsage1Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage1.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage1.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage1)"
          style="top:895px; left:696px;"
        ></div>
        <div
          #chestUsage2Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage2.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage2.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage2)"
          style="top:895px; left:720px;"
        ></div>
        <div
          #chestUsage3Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage3.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage3.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage3)"
          style="top:895px; left:742px;"
        ></div>
        <div
          #chestUsage4Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage4.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage4.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage4)"
          style="top:895px; left:765px;"
        ></div>
        <div
          #chestUsage5Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage5.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage5.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage5)"
          style="top:895px; left:788px;"
        ></div>
        <div
          #chestUsage6Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage6.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage6.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage6)"
          style="top:915px; left:696px;"
        ></div>
        <div
          #chestUsage7Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage7.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage7.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage7)"
          style="top:915px; left:720px;"
        ></div>
        <div
          #chestUsage8Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage8.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage8.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage8)"
          style="top:915px; left:742px;"
        ></div>
        <div
          #chestUsage9Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage9.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage9.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage9)"
          style="top:915px; left:765px;"
        ></div>
        <div
          #chestUsage10Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage10.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage10.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage10)"
          style="top:915px; left:788px;"
        ></div>
        <div
          #chestUsage11Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage11.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage11.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage11)"
          style="top:936px; left:696px;"
        ></div>
        <div
          #chestUsage12Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage12.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage12.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage12)"
          style="top:936px; left:720px;"
        ></div>
        <div
          #chestUsage13Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage13.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage13.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage13)"
          style="top:936px; left:742px;"
        ></div>
        <div
          #chestUsage14Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage14.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage14.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage14)"
          style="top:936px; left:765px;"
        ></div>
        <div
          #chestUsage15Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage15.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage15.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage15)"
          style="top:936px; left:788px;"
        ></div>
        <div
          #chestUsage16Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage16.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage16.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage16)"
          style="top:956px; left:696px;"
        ></div>
        <div
          #chestUsage17Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage17.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage17.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage17)"
          style="top:956px; left:720px;"
        ></div>
        <div
          #chestUsage18Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage18.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage18.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage18)"
          style="top:956px; left:742px;"
        ></div>
        <div
          #chestUsage19Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage19.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage19.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage19)"
          style="top:956px; left:765px;"
        ></div>
        <div
          #chestUsage20Input
          class="spell-slot-cb"
          [class.disabled]="alchemistChestControls.chestUsage20.disabled"
          [attr.data-state]="alchemistChestControls.chestUsage20.value"
          (click)="cycleSlot(alchemistChestControls.chestUsage20)"
          style="top:956px; left:788px;"
        ></div>

        <!--    main 6 skills-->
        <span class="roll-d20-wrap roll-d20-center" style="top:332.51px; left:78.60px; width:49.78px;">
          <input
            [formControl]="main6SkillsControls.silaOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="SIL"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(main6SkillsControls.silaOprava.value, 'Oprava Síly')">
            🎲
          </button>
        </span>
        <input
          [formControl]="main6SkillsControls.sila"
          class="field"
          style="top:378.94px; left:78.60px; width:49.78px; text-align: center"
          placeholder="SIL"
        />
        <span class="roll-d20-wrap roll-d20-center" style="top:497.86px; left:78.60px; width:49.78px;">
          <input
            [formControl]="main6SkillsControls.obratnostOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="OBR"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(main6SkillsControls.obratnostOprava.value, 'Oprava Obratnosti')"
          >
            🎲
          </button>
        </span>
        <input
          [formControl]="main6SkillsControls.obratnost"
          class="field"
          style="top:545.10px; left:78.60px; width:49.78px; text-align: center"
          placeholder="OBR"
        />
        <span class="roll-d20-wrap roll-d20-center" style="top:672.29px; left:78.60px; width:49.78px;">
          <input
            [formControl]="main6SkillsControls.odolnostOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="ODL"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(main6SkillsControls.odolnostOprava.value, 'Oprava Odolnosti')"
          >
            🎲
          </button>
        </span>
        <input
          [formControl]="main6SkillsControls.odolnost"
          class="field"
          style="top:720.53px; left:78.60px; width:49.78px; text-align: center"
          placeholder="ODL"
        />
        <span class="roll-d20-wrap roll-d20-center" style="top:847.72px; left:78.60px; width:49.78px;">
          <input
            [formControl]="main6SkillsControls.inteligenceOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="INT"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(main6SkillsControls.inteligenceOprava.value, 'Oprava Inteligence')"
          >
            🎲
          </button>
        </span>
        <input
          [formControl]="main6SkillsControls.inteligence"
          class="field"
          style="top:894.15px; left:78.60px; width:49.78px; text-align: center"
          placeholder="INT"
        />
        <span class="roll-d20-wrap roll-d20-center" style="top:1015.30px; left:78.60px; width:49.78px;">
          <input
            [formControl]="main6SkillsControls.moudrostOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="MDR"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(main6SkillsControls.moudrostOprava.value, 'Oprava Moudrosti')"
          >
            🎲
          </button>
        </span>
        <input
          [formControl]="main6SkillsControls.moudrost"
          class="field"
          style="top:1061.73px; left:78.60px; width:49.78px; text-align: center"
          placeholder="MDR"
        />
        <span class="roll-d20-wrap roll-d20-center" style="top:1189.92px; left:78.60px; width:49.78px;">
          <input
            [formControl]="main6SkillsControls.charismaOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="CHA"
          />
          <button
            class="roll-d20-btn"
            type="button"
            (click)="rollD20(main6SkillsControls.charismaOprava.value, 'Oprava Charismatu')"
          >
            🎲
          </button>
        </span>
        <input
          [formControl]="main6SkillsControls.charisma"
          class="field"
          style="top:1236.36px; left:78.60px; width:49.78px; text-align: center"
          placeholder="CHA"
        />

        <!--    =============================================-->
        <!--    detailed skills-->
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.atletikaZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.atletikaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:418px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:403.38px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.atletika"
            id="atletika"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.atletika.value, 'Atletika')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.akrobacieZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.akrobacieZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:476px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:461.52px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.akrobacie"
            id="akrobacie"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.akrobacie.value, 'Akrobacie')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.cachryZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.cachryZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:504px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:490.59px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.cachry"
            id="cachry"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.cachry.value, 'Čachry')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.nenapadnostZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.nenapadnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:532px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:519.66px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.nenapadnost"
            id="nenapadnost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.nenapadnost.value, 'Nenápadnost')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.historieZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.historieZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:595px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:581.44px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.historie"
            id="historie"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.historie.value, 'Historie')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.mystikaZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.mystikaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:624px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:610.51px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.mystika"
            id="mystika"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.mystika.value, 'Mystika')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.nabozenstviZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.nabozenstviZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:653px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:639.59px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.nabozenstvi"
            id="nabozenstvi"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.nabozenstvi.value, 'Náboženství')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.patraniZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.patraniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:681px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:666.84px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.patrani"
            id="patrani"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.patrani.value, 'Pátrání')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.prirodaZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.prirodaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:709px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:695.89px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.priroda"
            id="priroda"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.priroda.value, 'Příroda')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.lekarstviZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.lekarstviZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:771px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:757.69px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.lekarstvi"
            id="lekarstvi"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.lekarstvi.value, 'Lékařství')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.ovladaniZviratZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.ovladaniZviratZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:800px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:787.76px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.ovladaniZvirat"
            id="ovladaniZvirat"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.ovladaniZvirat.value, 'Ovládání zvířat')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.prezitiZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.prezitiZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:829px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:814.42px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.preziti"
            id="preziti"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.preziti.value, 'Přežití')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.vhledZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.vhledZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:857px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:844.49px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.vhled"
            id="vhled"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.vhled.value, 'Vhled')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.vnimaniZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.vnimaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:885px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:871.16px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.vnimani"
            id="vnimani"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.vnimani.value, 'Vnímání')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.klamaniZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.klamaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:948px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:934.75px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.klamani"
            id="klamani"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.klamani.value, 'Klamání')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.presvedcovaniZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.presvedcovaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:977px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:963.01px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.presvedcovani"
            id="presvedcovani"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.presvedcovani.value, 'Přesvědčování')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.vystupovaniZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.vystupovaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:1005px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:992.48px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.vystupovani"
            id="vystupovani"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.vystupovani.value, 'Vystupování')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(abilitiesControls.zastrasovaniZdatnost)"
          (click)="cycleAbilityZdatnost(abilitiesControls.zastrasovaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:1035px; left:186.09px;"
        ></div>
        <span class="roll-d20-wrap" style="top:1019.80px; left:348.46px; width:70.74px;">
          <input
            [formControl]="abilitiesControls.zastrasovani"
            id="zastrasovani"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="*"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(abilitiesControls.zastrasovani.value, 'Zastrašování')">
            🎲
          </button>
        </span>

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
        <rich-textarea
          [formControl]="form.controls.pomucky"
          class="field textarea"
          style="top:1126.54px; left:182.09px; width:237.11px; height:167px;"
        ></rich-textarea>

        <!--    Weapons / attacks 1st row -->
        <button
          (click)="onOpenSpecialSituationsDialog()"
          type="button"
          matTooltip="Speciální situace"
          style="top:1003px; left:723px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <button
          (click)="onOpenWeaponsDialog()"
          type="button"
          matTooltip="Zbraně"
          style="top:1003px; left:750px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <button
          (click)="onOpenWeaponsAndArmorsDialog()"
          type="button"
          matTooltip="Tabulka zbraní a zbrojí"
          style="top:1003px; left:854px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <button
          (click)="onOpenManeuversDialog()"
          type="button"
          matTooltip="Manévry (Akce)"
          style="top:1003px; left:881px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <input
          [formControl]="weaponsControls.zbran1"
          id="weapon1"
          class="field field-sm"
          style="top:1067px; left:444px; width:266px"
          placeholder="Zbraň / útok"
        />
        <input
          [formControl]="weaponsControls.zbran1Bonus"
          id="weapon1_bonus"
          class="field field-sm"
          style="top:1067.38px; left:714.95px; width:78.6px"
          placeholder="Bonus"
        />
        <input
          [formControl]="weaponsControls.zbran1Zasah"
          id="weapon1_hit"
          class="field field-sm"
          style="top:1067.38px; left:797.79px; width:78.6px"
          placeholder="Zásah"
        />
        <input
          [formControl]="weaponsControls.zbran1Typ"
          id="weapon1_type"
          class="field field-sm"
          style="top:1067.38px; left:883.94px; width:95.63px"
          placeholder="Typ"
        />
        <input
          [formControl]="weaponsControls.zbran1Dosah"
          id="weapon1_distance"
          class="field field-sm"
          style="top:1067.38px; left:983.81px; width:95.63px"
          placeholder="Dosah"
        />
        <input
          [formControl]="weaponsControls.zbran1Oc"
          id="weapon1_armorClass"
          class="field field-sm"
          style="top:1067.38px; left:1086.99px; width:95.63px"
          placeholder="Dosah"
        />

        <!--    Weapons / attacks 2nd row -->
        <input
          [formControl]="weaponsControls.zbran2"
          id="weapon2"
          class="field field-sm"
          style="top:1101.10px; left:444.09px; width:266.93px"
          placeholder="Zbraň / útok"
        />
        <input
          [formControl]="weaponsControls.zbran2Bonus"
          id="weapon2_bonus"
          class="field field-sm"
          style="top:1101.10px; left:714.95px; width:78.6px"
          placeholder="Bonus"
        />
        <input
          [formControl]="weaponsControls.zbran2Zasah"
          id="weapon2_hit"
          class="field field-sm"
          style="top:1101.10px; left:797.79px; width:78.6px"
          placeholder="Zásah"
        />
        <input
          [formControl]="weaponsControls.zbran2Typ"
          id="weapon2_type"
          class="field field-sm"
          style="top:1101.10px; left:883.94px; width:95.63px"
          placeholder="Typ"
        />
        <input
          [formControl]="weaponsControls.zbran2Dosah"
          id="weapon2_distance"
          class="field field-sm"
          style="top:1101.10px; left:983.81px; width:95.63px"
          placeholder="Dosah"
        />
        <input
          [formControl]="weaponsControls.zbran2Oc"
          id="weapon2_armorClass"
          class="field field-sm"
          style="top:1101.10px; left:1086.99px; width:95.63px"
          placeholder="Dosah"
        />

        <!--    Weapons / attacks 3rd row -->
        <input
          [formControl]="weaponsControls.zbran3"
          id="weapon3"
          class="field field-sm"
          style="top:1135.63px; left:444.09px; width:266.93px"
          placeholder="Zbraň / útok"
        />
        <input
          [formControl]="weaponsControls.zbran3Bonus"
          id="weapon3_bonus"
          class="field field-sm"
          style="top:1135.63px; left:714.95px; width:78.6px"
          placeholder="Bonus"
        />
        <input
          [formControl]="weaponsControls.zbran3Zasah"
          id="weapon3_hit"
          class="field field-sm"
          style="top:1135.63px; left:797.79px; width:78.6px"
          placeholder="Zásah"
        />
        <input
          [formControl]="weaponsControls.zbran3Typ"
          id="weapon3_type"
          class="field field-sm"
          style="top:1135.63px; left:883.94px; width:95.63px"
          placeholder="Typ"
        />
        <input
          [formControl]="weaponsControls.zbran3Dosah"
          id="weapon3_distance"
          class="field field-sm"
          style="top:1135.63px; left:983.81px; width:95.63px"
          placeholder="Dosah"
        />
        <input
          [formControl]="weaponsControls.zbran3Oc"
          id="weapon3_armorClass"
          class="field field-sm"
          style="top:1135.63px; left:1086.99px; width:95.63px"
          placeholder="Dosah"
        />

        <!--    Weapons / attacks 4th row -->
        <input
          [formControl]="weaponsControls.zbran4"
          id="weapon4"
          class="field field-sm"
          style="top:1170.15px; left:444.09px; width:266.93px"
          placeholder="Zbraň / útok"
        />
        <input
          [formControl]="weaponsControls.zbran4Bonus"
          id="weapon4_bonus"
          class="field field-sm"
          style="top:1170.15px; left:714.95px; width:78.6px"
          placeholder="Bonus"
        />
        <input
          [formControl]="weaponsControls.zbran4Zasah"
          id="weapon4_hit"
          class="field field-sm"
          style="top:1170.15px; left:797.79px; width:78.6px"
          placeholder="Zásah"
        />
        <input
          [formControl]="weaponsControls.zbran4Typ"
          id="weapon4_type"
          class="field field-sm"
          style="top:1170.15px; left:883.94px; width:95.63px"
          placeholder="Typ"
        />
        <input
          [formControl]="weaponsControls.zbran4Dosah"
          id="weapon4_distance"
          class="field field-sm"
          style="top:1170.15px; left:983.81px; width:95.63px"
          placeholder="Dosah"
        />
        <input
          [formControl]="weaponsControls.zbran4Oc"
          id="weapon4_armorClass"
          class="field field-sm"
          style="top:1170.15px; left:1086.99px; width:95.63px"
          placeholder="Dosah"
        />

        <!--    Weapons / attacks 5th row -->
        <input
          [formControl]="weaponsControls.zbran5"
          id="weapon5"
          class="field field-sm"
          style="top:1205.67px; left:444.09px; width:266.93px"
          placeholder="Zbraň / útok"
        />
        <input
          [formControl]="weaponsControls.zbran5Bonus"
          id="weapon5_bonus"
          class="field field-sm"
          style="top:1205.67px; left:714.95px; width:78.6px"
          placeholder="Bonus"
        />
        <input
          [formControl]="weaponsControls.zbran5Zasah"
          id="weapon5_hit"
          class="field field-sm"
          style="top:1205.67px; left:797.79px; width:78.6px"
          placeholder="Zásah"
        />
        <input
          [formControl]="weaponsControls.zbran5Typ"
          id="weapon5_type"
          class="field field-sm"
          style="top:1205.67px; left:883.94px; width:95.63px"
          placeholder="Typ"
        />
        <input
          [formControl]="weaponsControls.zbran5Dosah"
          id="weapon5_distance"
          class="field field-sm"
          style="top:1205.67px; left:983.81px; width:95.63px"
          placeholder="Dosah"
        />
        <input
          [formControl]="weaponsControls.zbran5Oc"
          id="weapon5_armorClass"
          class="field field-sm"
          style="top:1205.67px; left:1086.99px; width:95.63px"
          placeholder="Dosah"
        />

        <div
          [ngClass]="abilityCheckboxClass(weaponsControls.zdatnostJednoduche)"
          (click)="cycleAbilityZdatnost(weaponsControls.zdatnostJednoduche)"
          id="zdatnostSJednoduchymaZbranema"
          class="field ability-zdatnost-checkbox"
          style="top:1255px; left:446.78px;"
        ></div>
        <div
          [ngClass]="abilityCheckboxClass(weaponsControls.zdatnostValecne)"
          (click)="cycleAbilityZdatnost(weaponsControls.zdatnostValecne)"
          id="zdatnostSValecnymaZbranema"
          class="field ability-zdatnost-checkbox"
          style="top:1255px; left:572.54px;"
        ></div>
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
        <rich-textarea
          [formControl]="languagesControls.schopnosti"
          class="field textarea"
          style="top:1382px; left:634.04px; width:550.20px; height:381px;"
        ></rich-textarea>

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

        <second-page [form]="controls.secondPageForm" (imageSaved)="onImageSaved($event)" />

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
    </spinner-overlay>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgClass,
    MatTooltip,
    CharacterSheetSecondPageComponent,
    CharacterSheetThirdPageComponent,
    MatIcon,
    SpinnerOverlayComponent,
    RichTextareaComponent,
  ],
})
export class CharacterSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  private readonly diceRollerService = inject(DiceRollerService);

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
  speedHighlight = signal<'light' | 'medium' | 'heavy' | ''>('');
  _viewInitialized = signal(false);
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
    secondPageForm: CharacterSheetSecondPageComponent.createForm(),
    thirdPageForm: CharacterSheetThirdPageComponent.createForm(),
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

    this.form.controls.inventoryForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this._updateSpeedHighlight();
    });

    // ── Auto-recalc ability fixes, dovednosti, záchranné hody, pasivní dovednosti ──
    const abilityScores$ = merge(
      this.main6SkillsControls.sila.valueChanges,
      this.main6SkillsControls.obratnost.valueChanges,
      this.main6SkillsControls.odolnost.valueChanges,
      this.main6SkillsControls.inteligence.valueChanges,
      this.main6SkillsControls.moudrost.valueChanges,
      this.main6SkillsControls.charisma.valueChanges,
      this.form.controls.abilityBonus.controls.zdatnostniBonus.valueChanges,
      this.form.controls.topInfo.controls.uroven.valueChanges,
      // Zdatnost checkboxes for saving throws
      this.form.controls.savingThrowsForm.controls.silaZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.obratnostZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.odolnostZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.inteligenceZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.moudrostZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.charismaZdatnost.valueChanges,
      // Zdatnost checkboxes for dovednosti
      this.abilitiesControls.atletikaZdatnost.valueChanges,
      this.abilitiesControls.akrobacieZdatnost.valueChanges,
      this.abilitiesControls.cachryZdatnost.valueChanges,
      this.abilitiesControls.nenapadnostZdatnost.valueChanges,
      this.abilitiesControls.historieZdatnost.valueChanges,
      this.abilitiesControls.mystikaZdatnost.valueChanges,
      this.abilitiesControls.nabozenstviZdatnost.valueChanges,
      this.abilitiesControls.patraniZdatnost.valueChanges,
      this.abilitiesControls.prirodaZdatnost.valueChanges,
      this.abilitiesControls.lekarstviZdatnost.valueChanges,
      this.abilitiesControls.ovladaniZviratZdatnost.valueChanges,
      this.abilitiesControls.prezitiZdatnost.valueChanges,
      this.abilitiesControls.vhledZdatnost.valueChanges,
      this.abilitiesControls.vnimaniZdatnost.valueChanges,
      this.abilitiesControls.klamaniZdatnost.valueChanges,
      this.abilitiesControls.presvedcovaniZdatnost.valueChanges,
      this.abilitiesControls.vystupovaniZdatnost.valueChanges,
      this.abilitiesControls.zastrasovaniZdatnost.valueChanges,
      // Zdatnost checkboxes for passive skills
      this.form.controls.passiveSkillsForm.controls.atletikaZdatnost.valueChanges,
      this.form.controls.passiveSkillsForm.controls.akrobacieZdatnost.valueChanges,
      this.form.controls.passiveSkillsForm.controls.nenapadnostZdatnost.valueChanges,
      this.form.controls.passiveSkillsForm.controls.vhledZdatnost.valueChanges,
      this.form.controls.passiveSkillsForm.controls.vnimaniZdatnost.valueChanges,
      this.form.controls.passiveSkillsForm.controls.jineZdatnost.valueChanges,
    );

    abilityScores$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this._applyDefaultsOnZdatnostChange();
      this._syncZdatnostniBonusFromUroven();
      this._recalcDerivedStats();
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
          // Only reset if sesilatele is also empty — otherwise leave its state intact
          if (!parseInt(this.spellSlotsControls.urovenSesilatele.value ?? '0')) {
            this._enableAllSpellSlotsInputs();
          }
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
          // Sync zdatnostniBonus from uroven, then recalculate all derived stats
          this._syncZdatnostniBonusFromUroven();
          this._recalcDerivedStats();
          // Apply disable logic only if the view is already initialized
          if (this._viewInitialized()) {
            this._applyLevelDisabling();
            this._updateSpeedHighlight();
          }
        }
      });
    });

    afterNextRender(() => {
      this._viewInitialized.set(true);
      // If data was already loaded before the view was ready, apply disable logic now
      if (this.characterSheetStore.characterSheet()) {
        this._applyLevelDisabling();
        this._updateSpeedHighlight();
      }
    });

    // ── Auto-draft every 30 s → localStorage only (no DB) ─────────────────
    interval(30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const username = this.authService.currentUser()?.username;
        if (!username) return;
        const model = FormUtil.convertFormToModel(
          this.form.getRawValue(),
          CharacterSheetFormModelMappers.characterSheetFormToApiMapper,
        );
        model.username = username;
        const imageThisSession = this.characterSheetStore.characterImage();
        const imageFromDb = this.characterSheetStore.characterSheet()?.secondPageForm?.obrazekPostavy ?? null;
        if (model.secondPageForm) {
          model.secondPageForm.obrazekPostavy = imageThisSession ?? imageFromDb;
        }
        this.characterSheetStore.saveDraftToLocalStorage({ type: 'character', model });
      });
  }

  _applyLevelDisabling() {
    const sesilateleLevel = parseInt(this.spellSlotsControls.urovenSesilatele.value ?? '0');
    switch (sesilateleLevel) {
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
        break;
    }

    const cernokneznikLevel = parseInt(this.spellSlotsControls.urovenCernokneznika.value ?? '0');
    switch (cernokneznikLevel) {
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
        // Only reset spell slots when sesilatele is also empty — otherwise
        // sesilatele already applied the correct disable/enable state.
        if (sesilateleLevel === 0) {
          this._enableAllSpellSlotsInputs();
        }
    }

    const alchymistLevel = parseInt(this.alchemistChestControls.urovenAlchymisty.value ?? '0');
    switch (alchymistLevel) {
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
  }

  onSaveClick() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      const request = FormUtil.convertFormToModel(
        this.form.getRawValue(),
        CharacterSheetFormModelMappers.characterSheetFormToApiMapper,
      );
      request.username = username;
      if (request.secondPageForm) {
        // characterImage() is only set in-memory after an upload in this session.
        // Fall back to the value already persisted in the loaded sheet so we never
        // overwrite a valid image with null on a regular save.
        const imageThisSession = this.characterSheetStore.characterImage();
        const imageFromDb = this.characterSheetStore.characterSheet()?.secondPageForm?.obrazekPostavy ?? null;
        request.secondPageForm.obrazekPostavy = imageThisSession ?? imageFromDb;
      }

      this.characterSheetStore.saveCharacterSheet(request);
    } else {
      this.infoMessage.set('Pro uložení postavy se musíte přihlásit.');
      this.snackBar.open('Pro uložení postavy se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
    }
  }

  onImageSaved(base64: string) {
    const username = this.authService.currentUser()?.username;
    if (!username) {
      this.snackBar.open('Pro uložení obrázku se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
      return;
    }
    const request = FormUtil.convertFormToModel(
      this.form.getRawValue(),
      CharacterSheetFormModelMappers.characterSheetFormToApiMapper,
    );
    request.username = username;
    if (!request.secondPageForm) {
      request.secondPageForm = {} as any;
    }
    request.secondPageForm.obrazekPostavy = base64;
    this.characterSheetStore.saveCharacterSheet(request);
  }

  onOpenWeaponsAndArmorsDialog() {
    openWeaponsAndArmorsDialog(this.dialog);
  }

  rollD20(fieldValue: string | null | undefined, label: string): void {
    const mod = parseInt((fieldValue ?? '0').replace('+', '')) || 0;
    this.diceRollerService.rollD20WithModifier(label, mod);
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

  onOpenArmorClassDialog() {
    openArmorClassDialog(this.dialog);
  }

  onOpenWeaponsDialog() {
    openWeaponsDialog(this.dialog);
  }

  onOpenManeuversDialog() {
    openManeuversDialog(this.dialog);
  }

  onOpenSpecialSituationsDialog() {
    openSpecialSituationsDialog(this.dialog);
  }

  cycleAbilityZdatnost(ctrl: AbstractControl): void {
    const current = ctrl.value;
    if (!current || current === '' || current === false || current === 'false') {
      ctrl.setValue('true');
    } else if (current === 'true' || current === true) {
      ctrl.setValue('expertise');
    } else {
      ctrl.setValue('');
    }
  }

  abilityCheckboxClass(ctrl: AbstractControl): Record<string, boolean> {
    const v = ctrl.value;
    return {
      'ability-zdatnost--checked': v === 'true' || v === true,
      'ability-zdatnost--expertise': v === 'expertise',
    };
  }

  /**
   * D&D 5e proficiency bonus by character level.
   * 1–4 → +2 | 5–8 → +3 | 9–12 → +4 | 13–16 → +5 | 17–20 → +6
   */
  private _zdatnostBonusByLevel(level: number): number {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  }

  /**
   * If any zdatnost checkbox is checked AND zdatnostniBonus is still empty,
   * fill in the default +2 bonus AND set uroven to 1.
   */
  private _applyDefaultsOnZdatnostChange(): void {
    const zbCtrl = this.form.controls.abilityBonus.controls.zdatnostniBonus;
    const urovenCtrl = this.form.controls.topInfo.controls.uroven;
    if (zbCtrl.value) return; // already set — don't overwrite

    const anyChecked = [
      ...Object.entries(this.form.controls.savingThrowsForm.controls),
      ...Object.entries(this.abilitiesControls),
      ...Object.entries(this.form.controls.passiveSkillsForm.controls),
    ].some(
      ([k, c]) => k.toLowerCase().endsWith('zdatnost') && (c.value === 'true' || c.value === '1' || c.value === 'expertise'),
    );

    if (anyChecked && !zbCtrl.value) {
      zbCtrl.setValue('+2', { emitEvent: false });
      if (!urovenCtrl.value) {
        urovenCtrl.setValue('1', { emitEvent: false });
      }
    }
  }

  /**
   * When uroven changes and zdatnostniBonus is either empty or matches the
   * auto-computed value for the previous level, update zdatnostniBonus
   * according to the D&D proficiency table.
   */
  private _syncZdatnostniBonusFromUroven(): void {
    const urovenCtrl = this.form.controls.topInfo.controls.uroven;
    const zbCtrl = this.form.controls.abilityBonus.controls.zdatnostniBonus;
    const level = parseInt(urovenCtrl.value ?? '0');
    if (!level || isNaN(level)) return;
    const expected = `+${this._zdatnostBonusByLevel(level)}`;
    // Auto-update only if the field is empty or already matches any auto value (+2..+6)
    const current = zbCtrl.value ?? '';
    const isAutoValue = /^\+[2-6]$/.test(current) || current === '';
    if (isAutoValue) {
      zbCtrl.setValue(expected, { emitEvent: false });
    }
  }

  /**
   * Auto-fills:
   * 1. Oprava (fix) for each of the 6 ability scores
   * 2. Each dovednost value  = abilityMod [+ zdatnostniBonus if checked, +2× if expertise]
   * 3. Each záchranný hod   = abilityMod [+ zdatnostniBonus if checked]
   * 4. Each pasivní dovednost = 10 + corresponding dovednost value
   */
  _recalcDerivedStats(): void {
    const s6 = this.main6SkillsControls;
    const zb = parseInt(this.form.controls.abilityBonus.controls.zdatnostniBonus.value?.replace('+', '') ?? '0') || 0;
    const st = this.form.controls.savingThrowsForm.controls;
    const ab = this.abilitiesControls;
    const ps = this.form.controls.passiveSkillsForm.controls;

    // ── Helpers ───────────────────────────────────────────────────────────
    const mod = (raw: string | null | undefined): number => {
      const n = parseInt(raw ?? '0');
      return isNaN(n) ? 0 : Math.floor((n - 10) / 2);
    };
    /** Returns bonus multiplier: 0 = no zdatnost, 1 = zdatnost, 2 = expertise */
    const zbMult = (ctrl: { value: string | null | undefined }): number => {
      const v = ctrl.value;
      if (v === 'expertise') return 2;
      if (v === 'true' || v === '1') return 1;
      return 0;
    };
    const fmtMod = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);
    const skillVal = (base: number, zdCtrl: { value: string | null | undefined }): string => fmtMod(base + zbMult(zdCtrl) * zb);

    // ── 1. Ability fixes (oprava) ─────────────────────────────────────────
    const silaMod = mod(s6.sila.value);
    const obrMod = mod(s6.obratnost.value);
    const odlMod = mod(s6.odolnost.value);
    const intMod = mod(s6.inteligence.value);
    const mdrMod = mod(s6.moudrost.value);
    const chaMod = mod(s6.charisma.value);

    s6.silaOprava.setValue(fmtMod(silaMod), { emitEvent: false });
    s6.obratnostOprava.setValue(fmtMod(obrMod), { emitEvent: false });
    s6.odolnostOprava.setValue(fmtMod(odlMod), { emitEvent: false });
    s6.inteligenceOprava.setValue(fmtMod(intMod), { emitEvent: false });
    s6.moudrostOprava.setValue(fmtMod(mdrMod), { emitEvent: false });
    s6.charismaOprava.setValue(fmtMod(chaMod), { emitEvent: false });

    // Also keep inventory classes in sync with the new silaOprava
    this._setInventoryClasses(fmtMod(silaMod));

    // ── Iniciativa = oprava obratnosti ────────────────────────────────────
    this.form.controls.abilityBonus.controls.iniciativa.setValue(fmtMod(obrMod), { emitEvent: false });

    // ── 2. Záchranné hody ─────────────────────────────────────────────────
    st.sila.setValue(skillVal(silaMod, st.silaZdatnost), { emitEvent: false });
    st.obratnost.setValue(skillVal(obrMod, st.obratnostZdatnost), { emitEvent: false });
    st.odolnost.setValue(skillVal(odlMod, st.odolnostZdatnost), { emitEvent: false });
    st.inteligence.setValue(skillVal(intMod, st.inteligenceZdatnost), { emitEvent: false });
    st.moudrost.setValue(skillVal(mdrMod, st.moudrostZdatnost), { emitEvent: false });
    st.charisma.setValue(skillVal(chaMod, st.charismaZdatnost), { emitEvent: false });

    // ── 3. Dovednosti ─────────────────────────────────────────────────────
    ab.atletika.setValue(skillVal(silaMod, ab.atletikaZdatnost), { emitEvent: false });
    ab.akrobacie.setValue(skillVal(obrMod, ab.akrobacieZdatnost), { emitEvent: false });
    ab.cachry.setValue(skillVal(obrMod, ab.cachryZdatnost), { emitEvent: false });
    ab.nenapadnost.setValue(skillVal(obrMod, ab.nenapadnostZdatnost), { emitEvent: false });
    ab.historie.setValue(skillVal(intMod, ab.historieZdatnost), { emitEvent: false });
    ab.mystika.setValue(skillVal(intMod, ab.mystikaZdatnost), { emitEvent: false });
    ab.nabozenstvi.setValue(skillVal(intMod, ab.nabozenstviZdatnost), { emitEvent: false });
    ab.patrani.setValue(skillVal(intMod, ab.patraniZdatnost), { emitEvent: false });
    ab.priroda.setValue(skillVal(intMod, ab.prirodaZdatnost), { emitEvent: false });
    ab.lekarstvi.setValue(skillVal(mdrMod, ab.lekarstviZdatnost), { emitEvent: false });
    ab.ovladaniZvirat.setValue(skillVal(mdrMod, ab.ovladaniZviratZdatnost), { emitEvent: false });
    ab.preziti.setValue(skillVal(mdrMod, ab.prezitiZdatnost), { emitEvent: false });
    ab.vhled.setValue(skillVal(mdrMod, ab.vhledZdatnost), { emitEvent: false });
    ab.vnimani.setValue(skillVal(mdrMod, ab.vnimaniZdatnost), { emitEvent: false });
    ab.klamani.setValue(skillVal(chaMod, ab.klamaniZdatnost), { emitEvent: false });
    ab.presvedcovani.setValue(skillVal(chaMod, ab.presvedcovaniZdatnost), { emitEvent: false });
    ab.vystupovani.setValue(skillVal(chaMod, ab.vystupovaniZdatnost), { emitEvent: false });
    ab.zastrasovani.setValue(skillVal(chaMod, ab.zastrasovaniZdatnost), { emitEvent: false });

    // ── 4. Pasivní dovednosti = 10 + dovednost value ─────────────────────
    const passiveVal = (base: number, zdCtrl: { value: string | null | undefined }): string =>
      String(10 + base + zbMult(zdCtrl) * zb);

    ps.atletika.setValue(passiveVal(silaMod, ps.atletikaZdatnost), { emitEvent: false });
    ps.akrobacie.setValue(passiveVal(obrMod, ps.akrobacieZdatnost), { emitEvent: false });
    ps.nenapadnost.setValue(passiveVal(obrMod, ps.nenapadnostZdatnost), { emitEvent: false });
    ps.vhled.setValue(passiveVal(mdrMod, ps.vhledZdatnost), { emitEvent: false });
    ps.vnimani.setValue(passiveVal(mdrMod, ps.vnimaniZdatnost), { emitEvent: false });
  }

  _setInventoryClasses(strength: string) {
    let strengthFix = parseInt(strength?.replace(/[^\d\-+]/g, '') ?? '0');
    if (isNaN(strengthFix)) {
      strengthFix = 0;
    }
    this._softWeightThreshold = 5 + strengthFix;
    this._mediumWeightThreshold = this._softWeightThreshold + 5;
    this._heavyWeightThreshold = this._mediumWeightThreshold + 5;
    const inventoryClassesArray = [...this.inventoryClasses()];

    inventoryClassesArray.forEach((x, i) => {
      if (i < this._softWeightThreshold) {
        inventoryClassesArray[i] = 'soft-weight';
      } else if (i < this._mediumWeightThreshold) {
        inventoryClassesArray[i] = 'medium-weight';
      } else if (i < this._heavyWeightThreshold) {
        inventoryClassesArray[i] = 'heavy-weight';
      } else {
        inventoryClassesArray[i] = '';
      }
    });
    this.inventoryClasses.set(inventoryClassesArray);
    this._updateSpeedHighlight();
  }

  private _softWeightThreshold = 5;
  private _mediumWeightThreshold = 10;
  private _heavyWeightThreshold = 15;

  _updateSpeedHighlight() {
    const inventoryValues = Object.values(this.form.controls.inventoryForm.getRawValue()) as string[];

    // Count total filled rows regardless of colour zone.
    // Compare against thresholds: soft=5+strengthFix, medium=soft+5, heavy=medium+5
    const filledCount = inventoryValues.filter(v => !!v?.trim()).length;

    if (filledCount === 0) {
      this.speedHighlight.set('');
    } else if (filledCount <= this._softWeightThreshold + 1) {
      this.speedHighlight.set('light');
    } else if (filledCount <= this._mediumWeightThreshold + 1) {
      this.speedHighlight.set('medium');
    } else {
      this.speedHighlight.set('heavy');
    }
  }

  _setSpellSlotsLevel1() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
  }
  _setSpellSlotsLevel2() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
  }
  _setSpellSlotsLevel3() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
  }
  _setSpellSlotsLevel4() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
  }
  _setSpellSlotsLevel5() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
    this._en('level3Slot1');
    this._en('level3Slot2');
  }
  _setSpellSlotsLevel6() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
    this._en('level3Slot1');
    this._en('level3Slot2');
    this._en('level3Slot3');
  }
  _setSpellSlotsLevel7() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
    this._en('level3Slot1');
    this._en('level3Slot2');
    this._en('level3Slot3');
    this._en('level4Slot1');
  }
  _setSpellSlotsLevel8() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
    this._en('level3Slot1');
    this._en('level3Slot2');
    this._en('level3Slot3');
    this._en('level4Slot1');
    this._en('level4Slot2');
  }
  _setSpellSlotsLevel9() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
    this._en('level3Slot1');
    this._en('level3Slot2');
    this._en('level3Slot3');
    this._en('level4Slot1');
    this._en('level4Slot2');
    this._en('level4Slot3');
    this._en('level5Slot1');
  }
  _setSpellSlotsLevel10() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
    this._en('level1Slot3');
    this._en('level1Slot4');
    this._en('level2Slot1');
    this._en('level2Slot2');
    this._en('level2Slot3');
    this._en('level3Slot1');
    this._en('level3Slot2');
    this._en('level3Slot3');
    this._en('level4Slot1');
    this._en('level4Slot2');
    this._en('level4Slot3');
    this._en('level5Slot1');
    this._en('level5Slot2');
  }
  _setSpellSlotsLevel11() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot1');
    this._di('level7Slot2');
    this._di('level8Slot1');
    this._di('level9Slot1');
  }
  _setSpellSlotsLevel12() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot1');
    this._di('level7Slot2');
    this._di('level8Slot1');
    this._di('level9Slot1');
  }
  _setSpellSlotsLevel13() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot2');
    this._di('level8Slot1');
    this._di('level9Slot1');
  }
  _setSpellSlotsLevel14() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot2');
    this._di('level8Slot1');
    this._di('level9Slot1');
  }
  _setSpellSlotsLevel15() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot2');
    this._di('level9Slot1');
  }
  _setSpellSlotsLevel16() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot2');
  }
  _setSpellSlotsLevel17() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot3');
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot2');
  }
  _setSpellSlotsLevel18() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot4');
    this._di('level6Slot2');
    this._di('level7Slot2');
  }
  _setSpellSlotsLevel19() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot4');
    this._di('level7Slot2');
  }
  _setSpellSlotsLevel20() {
    this._enableAllSpellSlotsInputs();
    this._disableBlackPriestSpellSlotsInputs();
    this._di('level5Slot4');
  }

  _setBlackPriestSpellSlotsLevel1() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
  }
  _setBlackPriestSpellSlotsLevel2() {
    this._disableAllSpellSlotsInputs();
    this._en('level1Slot1');
    this._en('level1Slot2');
  }
  _setBlackPriestSpellSlotsLevel3() {
    this._disableAllSpellSlotsInputs();
    this._en('level2Slot1');
    this._en('level2Slot2');
  }
  _setBlackPriestSpellSlotsLevel5() {
    this._disableAllSpellSlotsInputs();
    this._en('level3Slot1');
    this._en('level3Slot2');
  }
  _setBlackPriestSpellSlotsLevel7() {
    this._disableAllSpellSlotsInputs();
    this._en('level4Slot1');
    this._en('level4Slot2');
  }
  _setBlackPriestSpellSlotsLevel9() {
    this._disableAllSpellSlotsInputs();
    this._en('level5Slot1');
    this._en('level5Slot2');
  }
  _setBlackPriestSpellSlotsLevel11() {
    this._disableAllSpellSlotsInputs();
    this._en('level5Slot1');
    this._en('level5Slot2');
    this._en('level5Slot3');
    this._en('level6Slot1');
  }
  _setBlackPriestSpellSlotsLevel13() {
    this._disableAllSpellSlotsInputs();
    this._en('level5Slot1');
    this._en('level5Slot2');
    this._en('level5Slot3');
    this._en('level6Slot1');
    this._en('level7Slot1');
  }
  _setBlackPriestSpellSlotsLevel15() {
    this._disableAllSpellSlotsInputs();
    this._en('level5Slot1');
    this._en('level5Slot2');
    this._en('level5Slot3');
    this._en('level6Slot1');
    this._en('level7Slot1');
    this._en('level8Slot1');
  }
  _setBlackPriestSpellSlotsLevel17() {
    this._disableAllSpellSlotsInputs();
    this._en('level5Slot1');
    this._en('level5Slot2');
    this._en('level5Slot3');
    this._en('level5Slot4');
    this._en('level6Slot1');
    this._en('level7Slot1');
    this._en('level8Slot1');
    this._en('level9Slot1');
  }

  _setAlchemistChestUsagesLevel1() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
  }
  _setAlchemistChestUsagesLevel2() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
  }
  _setAlchemistChestUsagesLevel3() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
  }
  _setAlchemistChestUsagesLevel4() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
  }
  _setAlchemistChestUsagesLevel5() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
    this._ace('chestUsage5');
  }
  _setAlchemistChestUsagesLevel6() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
    this._ace('chestUsage5');
    this._ace('chestUsage6');
  }
  _setAlchemistChestUsagesLevel7() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
    this._ace('chestUsage5');
    this._ace('chestUsage6');
    this._ace('chestUsage7');
  }
  _setAlchemistChestUsagesLevel8() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
    this._ace('chestUsage5');
    this._ace('chestUsage6');
    this._ace('chestUsage7');
    this._ace('chestUsage8');
  }
  _setAlchemistChestUsagesLevel9() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
    this._ace('chestUsage5');
    this._ace('chestUsage6');
    this._ace('chestUsage7');
    this._ace('chestUsage8');
    this._ace('chestUsage9');
  }
  _setAlchemistChestUsagesLevel10() {
    this._disableAllChestUsagesInputs();
    this._ace('chestUsage1');
    this._ace('chestUsage2');
    this._ace('chestUsage3');
    this._ace('chestUsage4');
    this._ace('chestUsage5');
    this._ace('chestUsage6');
    this._ace('chestUsage7');
    this._ace('chestUsage8');
    this._ace('chestUsage9');
    this._ace('chestUsage10');
  }
  _setAlchemistChestUsagesLevel11() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage12');
    this._acd('chestUsage13');
    this._acd('chestUsage14');
    this._acd('chestUsage15');
    this._acd('chestUsage16');
    this._acd('chestUsage17');
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel12() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage13');
    this._acd('chestUsage14');
    this._acd('chestUsage15');
    this._acd('chestUsage16');
    this._acd('chestUsage17');
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel13() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage14');
    this._acd('chestUsage15');
    this._acd('chestUsage16');
    this._acd('chestUsage17');
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel14() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage15');
    this._acd('chestUsage16');
    this._acd('chestUsage17');
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel15() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage16');
    this._acd('chestUsage17');
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel16() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage17');
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel17() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage18');
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel18() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage19');
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel19() {
    this._enableAllChestUsagesInputs();
    this._acd('chestUsage20');
  }
  _setAlchemistChestUsagesLevel20() {
    this._enableAllChestUsagesInputs();
  }

  // ── Tri-state cycle: '' → 'cross' → 'filled' → '' ──────────────────────────
  cycleSlot(control: AbstractControl): void {
    if (control.disabled) return;
    const next: Record<string, string> = { '': 'cross', cross: 'filled', filled: '' };
    control.setValue(next[control.value ?? ''] ?? 'cross');
  }

  _disableBlackPriestSpellSlotsInputs() {
    this.spellSlotsControls.level2Slot4.disable({ emitEvent: false });
    this.spellSlotsControls.level3Slot4.disable({ emitEvent: false });
    this.spellSlotsControls.level4Slot4.disable({ emitEvent: false });
    this.spellSlotsControls.level5Slot4.disable({ emitEvent: false });
  }

  _disableAllSpellSlotsInputs() {
    const c = this.spellSlotsControls;
    [
      c.level1Slot1,
      c.level1Slot2,
      c.level1Slot3,
      c.level1Slot4,
      c.level2Slot1,
      c.level2Slot2,
      c.level2Slot3,
      c.level2Slot4,
      c.level3Slot1,
      c.level3Slot2,
      c.level3Slot3,
      c.level3Slot4,
      c.level4Slot1,
      c.level4Slot2,
      c.level4Slot3,
      c.level4Slot4,
      c.level5Slot1,
      c.level5Slot2,
      c.level5Slot3,
      c.level5Slot4,
      c.level6Slot1,
      c.level6Slot2,
      c.level7Slot1,
      c.level7Slot2,
      c.level8Slot1,
      c.level9Slot1,
    ].forEach(ctrl => ctrl.disable({ emitEvent: false }));
  }

  _enableAllSpellSlotsInputs() {
    const c = this.spellSlotsControls;
    [
      c.level1Slot1,
      c.level1Slot2,
      c.level1Slot3,
      c.level1Slot4,
      c.level2Slot1,
      c.level2Slot2,
      c.level2Slot3,
      c.level2Slot4,
      c.level3Slot1,
      c.level3Slot2,
      c.level3Slot3,
      c.level3Slot4,
      c.level4Slot1,
      c.level4Slot2,
      c.level4Slot3,
      c.level4Slot4,
      c.level5Slot1,
      c.level5Slot2,
      c.level5Slot3,
      c.level5Slot4,
      c.level6Slot1,
      c.level6Slot2,
      c.level7Slot1,
      c.level7Slot2,
      c.level8Slot1,
      c.level9Slot1,
    ].forEach(ctrl => ctrl.enable({ emitEvent: false }));
  }

  _disableAllChestUsagesInputs() {
    const c = this.alchemistChestControls;
    [
      c.chestUsage1,
      c.chestUsage2,
      c.chestUsage3,
      c.chestUsage4,
      c.chestUsage5,
      c.chestUsage6,
      c.chestUsage7,
      c.chestUsage8,
      c.chestUsage9,
      c.chestUsage10,
      c.chestUsage11,
      c.chestUsage12,
      c.chestUsage13,
      c.chestUsage14,
      c.chestUsage15,
      c.chestUsage16,
      c.chestUsage17,
      c.chestUsage18,
      c.chestUsage19,
      c.chestUsage20,
    ].forEach(ctrl => ctrl.disable({ emitEvent: false }));
  }

  _enableAllChestUsagesInputs() {
    const c = this.alchemistChestControls;
    [
      c.chestUsage1,
      c.chestUsage2,
      c.chestUsage3,
      c.chestUsage4,
      c.chestUsage5,
      c.chestUsage6,
      c.chestUsage7,
      c.chestUsage8,
      c.chestUsage9,
      c.chestUsage10,
      c.chestUsage11,
      c.chestUsage12,
      c.chestUsage13,
      c.chestUsage14,
      c.chestUsage15,
      c.chestUsage16,
      c.chestUsage17,
      c.chestUsage18,
      c.chestUsage19,
      c.chestUsage20,
    ].forEach(ctrl => ctrl.enable({ emitEvent: false }));
  }

  // ── Spell-slot level helpers ─────────────────────────────────────────────
  private _ss(name: keyof SpellSlotsForm) {
    return this.spellSlotsControls[name];
  }
  private _en(name: keyof SpellSlotsForm) {
    this._ss(name).enable({ emitEvent: false });
  }
  private _di(name: keyof SpellSlotsForm) {
    this._ss(name).disable({ emitEvent: false });
  }

  // ── Alchemist-chest level helpers ────────────────────────────────────────
  private _ach(name: keyof AlchemistChestForm) {
    return this.alchemistChestControls[name];
  }
  private _ace(name: keyof AlchemistChestForm) {
    this._ach(name).enable({ emitEvent: false });
  }
  private _acd(name: keyof AlchemistChestForm) {
    this._ach(name).disable({ emitEvent: false });
  }
}
