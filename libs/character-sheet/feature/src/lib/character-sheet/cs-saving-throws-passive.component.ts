import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PassiveSkillsForm, SavingThrowsForm, SpellsAndAlchemistChestForm } from '@dn-d-servant/character-sheet-util';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DiceRollerService, RichTextareaComponent } from '@dn-d-servant/ui';
import { openSpellsDialog } from '../help-dialogs/spells-dialog.component';
import { openAlchemistDialog } from '../help-dialogs/alchemist-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'cs-saving-throws-passive',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ReactiveFormsModule, NgClass, MatIcon, MatTooltip, RichTextareaComponent],
  styleUrl: '../character-sheet.component.scss',
  template: `
    @if (_tick()) {
      <!-- Saving throws -->
      <ng-container [formGroup]="savingThrowsForm()">
        <div
          [ngClass]="abilityCheckboxClass(st.silaZdatnost)"
          (click)="cycleAbilityZdatnost(st.silaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:575.36px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:559.64px; left:554.13px; width:61.57px;">
          <input
            [formControl]="st.sila"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="SIL"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(st.sila.value, 'Záchranný hod Síla')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(st.obratnostZdatnost)"
          (click)="cycleAbilityZdatnost(st.obratnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:602.61px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:588.71px; left:554.13px; width:61.57px;">
          <input
            [formControl]="st.obratnost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="OBR"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(st.obratnost.value, 'Záchranný hod Obratnost')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(st.odolnostZdatnost)"
          (click)="cycleAbilityZdatnost(st.odolnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:631.68px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:617.78px; left:554.13px; width:61.57px;">
          <input
            [formControl]="st.odolnost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="ODL"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(st.odolnost.value, 'Záchranný hod Odolnost')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(st.inteligenceZdatnost)"
          (click)="cycleAbilityZdatnost(st.inteligenceZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:660.75px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:646.85px; left:554.13px; width:61.57px;">
          <input
            [formControl]="st.inteligence"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="INT"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(st.inteligence.value, 'Záchranný hod Inteligence')">
            🎲
          </button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(st.moudrostZdatnost)"
          (click)="cycleAbilityZdatnost(st.moudrostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:688.01px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:675.92px; left:554.13px; width:61.57px;">
          <input
            [formControl]="st.moudrost"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="MDR"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(st.moudrost.value, 'Záchranný hod Moudrost')">🎲</button>
        </span>
        <div
          [ngClass]="abilityCheckboxClass(st.charismaZdatnost)"
          (click)="cycleAbilityZdatnost(st.charismaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:717.08px; left:445.78px;"
        ></div>
        <span class="roll-d20-wrap" style="top:703.18px; left:554.13px; width:61.57px;">
          <input
            [formControl]="st.charisma"
            class="field no-pb"
            style="top:0;left:0;width:100%;position:relative;text-align:right;"
            placeholder="CHA"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(st.charisma.value, 'Záchranný hod Charisma')">🎲</button>
        </span>
      </ng-container>

      <!-- Passive skills -->
      <ng-container [formGroup]="passiveSkillsForm()">
        <div
          [ngClass]="abilityCheckboxClass(ps.atletikaZdatnost)"
          (click)="cycleAbilityZdatnost(ps.atletikaZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:575.36px; left:634.11px;"
        ></div>
        <input
          [formControl]="ps.atletika"
          class="field no-pb"
          style="top:559.64px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="ATL"
        />
        <div
          [ngClass]="abilityCheckboxClass(ps.akrobacieZdatnost)"
          (click)="cycleAbilityZdatnost(ps.akrobacieZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:602.61px; left:634.11px;"
        ></div>
        <input
          [formControl]="ps.akrobacie"
          class="field no-pb"
          style="top:588.71px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="AKR"
        />
        <div
          [ngClass]="abilityCheckboxClass(ps.nenapadnostZdatnost)"
          (click)="cycleAbilityZdatnost(ps.nenapadnostZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:631.68px; left:634.11px;"
        ></div>
        <input
          [formControl]="ps.nenapadnost"
          class="field no-pb"
          style="top:617.78px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="NEN"
        />
        <div
          [ngClass]="abilityCheckboxClass(ps.vhledZdatnost)"
          (click)="cycleAbilityZdatnost(ps.vhledZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:660.75px; left:634.11px;"
        ></div>
        <input
          [formControl]="ps.vhled"
          class="field no-pb"
          style="top:646.85px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="VHL"
        />
        <div
          [ngClass]="abilityCheckboxClass(ps.vnimaniZdatnost)"
          (click)="cycleAbilityZdatnost(ps.vnimaniZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:688.01px; left:634.11px;"
        ></div>
        <input
          [formControl]="ps.vnimani"
          class="field no-pb"
          style="top:675.92px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="VNI"
        />
        <div
          [ngClass]="abilityCheckboxClass(ps.jineZdatnost)"
          (click)="cycleAbilityZdatnost(ps.jineZdatnost)"
          class="field ability-zdatnost-checkbox"
          style="top:717.08px; left:634.11px;"
        ></div>
        <input
          [formControl]="ps.jineNazev"
          class="field no-pb"
          style="top:703.18px; left:655px; width:82.53px; text-align: left;"
          placeholder="-"
        />
        <input
          [formControl]="ps.jine"
          class="field no-pb"
          style="top:703.18px; left:743.77px; width:61.57px; text-align: right;"
          placeholder="-"
        />
      </ng-container>

      <!-- Spells and alchemist header -->
      <ng-container [formGroup]="spellsAndAlchForm()">
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
          [formControl]="sa.vlastnost"
          matTooltip="Tvoje sesílací vlastnost (podle povolání)"
          class="field"
          style="top:803px; left:442px; width:144px;"
          placeholder="Vlastnost"
        />
        <input
          [formControl]="sa.utBonus"
          matTooltip="zdat. bonus + oprava sesílací vlastnosti"
          class="field"
          style="top:803.11px; left:603.91px; width:94.32px;"
          placeholder="Út bonus"
        />
        <input
          [formControl]="sa.soZachrany"
          matTooltip="8 + zdat. bonus + oprava sesílací vlastnosti"
          class="field"
          style="top:803.11px; left:708.71px; width:94.32px;"
          placeholder="SO záchr."
        />
      </ng-container>

      <!-- Info about character rich-textarea -->
      <rich-textarea
        [formControl]="infoAboutCharacterControl()"
        class="field textarea"
        style="top:545.1px; left:834.47px; width:349.77px; height:432px;"
      ></rich-textarea>
    }
  `,
})
export class CsSavingThrowsPassiveComponent {
  savingThrowsForm = input.required<FormGroup<SavingThrowsForm>>();
  passiveSkillsForm = input.required<FormGroup<PassiveSkillsForm>>();
  spellsAndAlchForm = input.required<FormGroup<SpellsAndAlchemistChestForm>>();
  infoAboutCharacterControl = input.required<any>();
  private dialog = inject(MatDialog);
  private diceRollerService = inject(DiceRollerService);
  private destroyRef = inject(DestroyRef);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      const st = this.savingThrowsForm();
      const ps = this.passiveSkillsForm();
      merge(st.valueChanges, ps.valueChanges)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get st() {
    return this.savingThrowsForm().controls;
  }
  get ps() {
    return this.passiveSkillsForm().controls;
  }
  get sa() {
    return this.spellsAndAlchForm().controls;
  }

  onOpenSpellsDialog() {
    openSpellsDialog(this.dialog);
  }
  onOpenAlchemistDialog() {
    openAlchemistDialog(this.dialog);
  }

  rollD20(fieldValue: string | null | undefined, label: string): void {
    const mod = parseInt((fieldValue ?? '0').replace('+', '')) || 0;
    this.diceRollerService.rollD20WithModifier(label, mod);
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
}
