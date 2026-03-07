import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
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
import { SpinnerOverlayComponent, DiceRollerService } from '@dn-d-servant/ui';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { CharacterSheetFormModelMappers } from './api-mappers/character-sheet-form-model-mappers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CharacterSheetSecondPageComponent } from './character-sheet-second-page.component';
import { CharacterSheetThirdPageComponent } from './character-sheet-third-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SpellSlotsService } from './character-sheet/spell-slots.service';
import { CsTopInfoComponent } from './character-sheet/cs-top-info.component';
import { CsAbilityScoresComponent } from './character-sheet/cs-ability-scores.component';
import { CsCombatStatsComponent } from './character-sheet/cs-combat-stats.component';
import { CsSkillsComponent } from './character-sheet/cs-skills.component';
import { CsSavingThrowsPassiveComponent } from './character-sheet/cs-saving-throws-passive.component';
import { CsSpellSlotsComponent } from './character-sheet/cs-spell-slots.component';
import { CsWeaponsComponent } from './character-sheet/cs-weapons.component';
import { CsLanguagesComponent } from './character-sheet/cs-languages.component';
import { CsInventoryComponent } from './character-sheet/cs-inventory.component';

@Component({
  selector: 'character-sheet',
  template: `
    <spinner-overlay [diameter]="70" [showSpinner]="characterSheetStore.loading()">
      <img src="character-sheet-1-copy.webp" alt="Character Sheet" height="1817" width="1293" />

      <form [formGroup]="form">
        <cs-top-info [form]="controls.topInfo" />

        <cs-ability-scores [main6Form]="controls.main6SkillsForm" [abilityBonusForm]="controls.abilityBonus" />

        <cs-combat-stats
          [speedForm]="controls.speedAndHealingDices"
          [armorForm]="controls.armorClass"
          [speedHighlight]="speedHighlight()"
        />

        <cs-saving-throws-passive
          [savingThrowsForm]="controls.savingThrowsForm"
          [passiveSkillsForm]="controls.passiveSkillsForm"
          [spellsAndAlchForm]="controls.spellsAndAlchemistChestForm"
          [infoAboutCharacterControl]="form.controls['infoAboutCharacter']"
        />

        <cs-spell-slots [spellSlotsForm]="controls.spellSlotsForm" [alchemistChestForm]="controls.alchemistChestForm" />

        <cs-skills [form]="controls.abilitiesForm" [pomuckyControl]="form.controls['pomucky']" />

        <cs-weapons [form]="controls.weaponsForm" />

        <cs-languages [form]="controls.languagesForm" />

        <cs-inventory [form]="controls.inventoryForm" [inventoryClasses]="inventoryClasses()" />

        <second-page [form]="controls.secondPageForm" (imageSaved)="onImageSaved($event)" />

        <third-page [form]="controls.thirdPageForm" />

        <button (click)="onSaveClick()" type="submit" class="field button" style="top:4px; left:1090px; width:150px;">
          Uložit [enter]
        </button>
      </form>
    </spinner-overlay>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CharacterSheetSecondPageComponent,
    CharacterSheetThirdPageComponent,
    SpinnerOverlayComponent,
    CsTopInfoComponent,
    CsAbilityScoresComponent,
    CsCombatStatsComponent,
    CsSavingThrowsPassiveComponent,
    CsSpellSlotsComponent,
    CsSkillsComponent,
    CsWeaponsComponent,
    CsLanguagesComponent,
    CsInventoryComponent,
  ],
})
export class CharacterSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  private readonly diceRollerService = inject(DiceRollerService);
  private readonly spellSlotsService = inject(SpellSlotsService);

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
      atletikaZdatnost: this.fb.control(''),
      atletika: this.fb.control(''),
      akrobacieZdatnost: this.fb.control(''),
      akrobacie: this.fb.control(''),
      cachryZdatnost: this.fb.control(''),
      cachry: this.fb.control(''),
      nenapadnostZdatnost: this.fb.control(''),
      nenapadnost: this.fb.control(''),
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

  get main6SkillsControls() {
    return this.form.controls.main6SkillsForm.controls;
  }

  get abilitiesControls() {
    return this.form.controls.abilitiesForm.controls;
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
      this.form.controls.savingThrowsForm.controls.silaZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.obratnostZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.odolnostZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.inteligenceZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.moudrostZdatnost.valueChanges,
      this.form.controls.savingThrowsForm.controls.charismaZdatnost.valueChanges,
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
      this.spellSlotsService.applySpellSlotsLevel(parseInt(level ?? '0'), this.spellSlotsControls);
    });

    this.spellSlotsControls.urovenCernokneznika.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(level => {
      const spellCasterLevel = parseInt(this.spellSlotsControls.urovenSesilatele.value ?? '0');
      this.spellSlotsService.applyBlackPriestLevel(parseInt(level ?? '0'), this.spellSlotsControls, spellCasterLevel);
    });

    this.alchemistChestControls.urovenAlchymisty.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(level => {
      this.spellSlotsService.applyAlchemistLevel(parseInt(level ?? '0'), this.alchemistChestControls);
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
          this._syncZdatnostniBonusFromUroven();
          this._recalcDerivedStats();
          if (this._viewInitialized()) {
            this._applyLevelDisabling();
            this._updateSpeedHighlight();
          }
        }
      });
    });

    afterNextRender(() => {
      this._viewInitialized.set(true);
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
    const sorcererLevel = parseInt(this.spellSlotsControls.urovenSesilatele.value ?? '0');
    this.spellSlotsService.applySpellSlotsLevel(sorcererLevel, this.spellSlotsControls);

    const warlockLevel = parseInt(this.spellSlotsControls.urovenCernokneznika.value ?? '0');
    this.spellSlotsService.applyBlackPriestLevel(warlockLevel, this.spellSlotsControls, sorcererLevel);

    const alchemistLevel = parseInt(this.alchemistChestControls.urovenAlchymisty.value ?? '0');
    this.spellSlotsService.applyAlchemistLevel(alchemistLevel, this.alchemistChestControls);
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

  private _zdatnostBonusByLevel(level: number): number {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  }

  private _applyDefaultsOnZdatnostChange(): void {
    const zbCtrl = this.form.controls.abilityBonus.controls.zdatnostniBonus;
    const urovenCtrl = this.form.controls.topInfo.controls.uroven;
    if (zbCtrl.value) return;

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

  private _syncZdatnostniBonusFromUroven(): void {
    const urovenCtrl = this.form.controls.topInfo.controls.uroven;
    const zbCtrl = this.form.controls.abilityBonus.controls.zdatnostniBonus;
    const level = parseInt(urovenCtrl.value ?? '0');
    if (!level || isNaN(level)) return;
    const expected = `+${this._zdatnostBonusByLevel(level)}`;
    const current = zbCtrl.value ?? '';
    const isAutoValue = /^\+[2-6]$/.test(current) || current === '';
    if (isAutoValue) {
      zbCtrl.setValue(expected, { emitEvent: false });
    }
  }

  _recalcDerivedStats(): void {
    const s6 = this.main6SkillsControls;
    const zb = parseInt(this.form.controls.abilityBonus.controls.zdatnostniBonus.value?.replace('+', '') ?? '0') || 0;
    const st = this.form.controls.savingThrowsForm.controls;
    const ab = this.abilitiesControls;
    const ps = this.form.controls.passiveSkillsForm.controls;

    const mod = (raw: string | null | undefined): number => {
      const n = parseInt(raw ?? '0');
      return isNaN(n) ? 0 : Math.floor((n - 10) / 2);
    };
    const zbMult = (ctrl: { value: string | null | undefined }): number => {
      const v = ctrl.value;
      if (v === 'expertise') return 2;
      if (v === 'true' || v === '1') return 1;
      return 0;
    };
    const fmtMod = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);
    const skillVal = (base: number, zdCtrl: { value: string | null | undefined }): string => fmtMod(base + zbMult(zdCtrl) * zb);

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

    this._setInventoryClasses(fmtMod(silaMod));
    this.form.controls.abilityBonus.controls.iniciativa.setValue(fmtMod(obrMod), { emitEvent: false });

    st.sila.setValue(skillVal(silaMod, st.silaZdatnost), { emitEvent: false });
    st.obratnost.setValue(skillVal(obrMod, st.obratnostZdatnost), { emitEvent: false });
    st.odolnost.setValue(skillVal(odlMod, st.odolnostZdatnost), { emitEvent: false });
    st.inteligence.setValue(skillVal(intMod, st.inteligenceZdatnost), { emitEvent: false });
    st.moudrost.setValue(skillVal(mdrMod, st.moudrostZdatnost), { emitEvent: false });
    st.charisma.setValue(skillVal(chaMod, st.charismaZdatnost), { emitEvent: false });

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
    if (isNaN(strengthFix)) strengthFix = 0;
    this._softWeightThreshold = 5 + strengthFix;
    this._mediumWeightThreshold = this._softWeightThreshold + 5;
    this._heavyWeightThreshold = this._mediumWeightThreshold + 5;
    const arr = [...this.inventoryClasses()];
    arr.forEach((_, i) => {
      if (i < this._softWeightThreshold) arr[i] = 'soft-weight';
      else if (i < this._mediumWeightThreshold) arr[i] = 'medium-weight';
      else if (i < this._heavyWeightThreshold) arr[i] = 'heavy-weight';
      else arr[i] = '';
    });
    this.inventoryClasses.set(arr);
    this._updateSpeedHighlight();
  }

  private _softWeightThreshold = 5;
  private _mediumWeightThreshold = 10;
  private _heavyWeightThreshold = 15;

  _updateSpeedHighlight() {
    const inventoryValues = Object.values(this.form.controls.inventoryForm.getRawValue()) as string[];
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
}
