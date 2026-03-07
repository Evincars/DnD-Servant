import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal, effect } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AbilityBonusForm, Main6SkillsForm } from '@dn-d-servant/character-sheet-util';
import { MatTooltip } from '@angular/material/tooltip';
import { DiceRollerService } from '@dn-d-servant/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'cs-ability-scores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ReactiveFormsModule, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    @if (_tick()) {
      <ng-container [formGroup]="main6Form()">
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

        <span class="roll-d20-wrap roll-d20-center" style="top:332.51px; left:78.60px; width:59.78px;">
          <input
            [formControl]="c.silaOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="SIL"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(c.silaOprava.value, 'Síla')">🎲</button>
        </span>
        <input
          [formControl]="c.sila"
          id="sila-input"
          class="field"
          style="top:378.94px; left:78.60px; width:49.78px; text-align: center"
          placeholder="SIL"
        />

        <span class="roll-d20-wrap roll-d20-center" style="top:497.86px; left:78.60px; width:59.78px;">
          <input
            [formControl]="c.obratnostOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="OBR"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(c.obratnostOprava.value, 'Obratnost')">🎲</button>
        </span>
        <input
          [formControl]="c.obratnost"
          id="obratnost-input"
          class="field"
          style="top:545.10px; left:78.60px; width:49.78px; text-align: center"
          placeholder="OBR"
        />

        <span class="roll-d20-wrap roll-d20-center" style="top:672.29px; left:78.60px; width:59.78px;">
          <input
            [formControl]="c.odolnostOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="ODL"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(c.odolnostOprava.value, 'Odolnost')">🎲</button>
        </span>
        <input
          [formControl]="c.odolnost"
          id="odolnost-input"
          class="field"
          style="top:720.53px; left:78.60px; width:49.78px; text-align: center"
          placeholder="ODL"
        />

        <span class="roll-d20-wrap roll-d20-center" style="top:847.72px; left:78.60px; width:59.78px;">
          <input
            [formControl]="c.inteligenceOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="INT"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(c.inteligenceOprava.value, 'Inteligence')">🎲</button>
        </span>
        <input
          [formControl]="c.inteligence"
          id="inteligence-input"
          class="field"
          style="top:894.15px; left:78.60px; width:49.78px; text-align: center"
          placeholder="INT"
        />

        <span class="roll-d20-wrap roll-d20-center" style="top:1015.30px; left:78.60px; width:59.78px;">
          <input
            [formControl]="c.moudrostOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="MDR"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(c.moudrostOprava.value, 'Moudrost')">🎲</button>
        </span>
        <input
          [formControl]="c.moudrost"
          id="moudrost-input"
          class="field"
          style="top:1061.73px; left:78.60px; width:49.78px; text-align: center"
          placeholder="MDR"
        />

        <span class="roll-d20-wrap roll-d20-center" style="top:1189.92px; left:78.60px; width:59.78px;">
          <input
            [formControl]="c.charismaOprava"
            class="field main-skill"
            style="top:0;left:0;width:100%;position:relative;"
            placeholder="CHA"
          />
          <button class="roll-d20-btn" type="button" (click)="rollD20(c.charismaOprava.value, 'Charisma')">🎲</button>
        </span>
        <input
          [formControl]="c.charisma"
          id="charisma-input"
          class="field"
          style="top:1236.36px; left:78.60px; width:49.78px; text-align: center"
          placeholder="CHA"
        />
      </ng-container>
    }
  `,
})
export class CsAbilityScoresComponent {
  main6Form = input.required<FormGroup<Main6SkillsForm>>();
  abilityBonusForm = input.required<FormGroup<AbilityBonusForm>>();
  private diceRollerService = inject(DiceRollerService);
  private destroyRef = inject(DestroyRef);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      const main = this.main6Form();
      const bonus = this.abilityBonusForm();
      merge(main.valueChanges, bonus.valueChanges)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get c() {
    return this.main6Form().controls;
  }

  get abilityBonusControls() {
    return this.abilityBonusForm().controls;
  }

  rollD20(fieldValue: string | null | undefined, label: string): void {
    const mod = parseInt((fieldValue ?? '0').replace('+', '')) || 0;
    this.diceRollerService.rollD20WithModifier(label, mod);
  }
}
