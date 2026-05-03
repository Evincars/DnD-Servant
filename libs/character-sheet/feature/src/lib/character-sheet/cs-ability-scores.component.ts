import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal, effect } from '@angular/core';
import { SheetThemeService } from '../sheet-theme.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AbilityBonusForm, Main6SkillsForm } from '@dn-d-servant/character-sheet-util';
import { MatTooltip } from '@angular/material/tooltip';
import { DiceRollerService } from '@dn-d-servant/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'cs-ability-scores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', '[class.theme-dark]': 'sheetTheme.darkMode()' },
  imports: [ReactiveFormsModule, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Schopnosti</h3>
    @if (_tick()) {
      <ng-container [formGroup]="main6Form()">
        <div class="cs-ability-bonus-row">
          <div class="cs-ability-bonus-item" data-label="Zdatnostní bonus">
            <input
              [formControl]="abilityBonusControls.zdatnostniBonus"
              matTooltip="Ke každé Dovednosti se kterou máš zdatnost připočítej tento bonus"
              class="field readonly-field"
              readonly
              style="top:265.37px; left:178.4px; width:44.54px; text-align: center"
              placeholder="ZB"
            />
          </div>
          <div class="cs-ability-bonus-item" data-label="Inspirace">
            <input
              [formControl]="abilityBonusControls.inspirace"
              matTooltip="Utrať jednu inspiraci abys měl VÝHODU na ověření schopnosti, záchranný hod nebo útočný hod"
              class="field"
              style="top:265.37px; left:440.4px; width:44.54px; text-align: center"
              placeholder="*"
            />
          </div>
          <div class="cs-ability-bonus-item" data-label="Iniciativa">
            <input
              [formControl]="abilityBonusControls.iniciativa"
              matTooltip="stejné jako oprava Obratnosti"
              class="field"
              style="top:265.37px; left:622.49px; width:44.54px; text-align: center"
              placeholder="In."
            />
          </div>
        </div>

        <div class="cs-ability-group" data-ability="Síla">
          <label class="cs-ability-label">Síla</label>
          <span class="roll-d20-wrap roll-d20-center" style="top:326.51px; left:72.60px; width:59.78px;">
            <input [formControl]="c.silaOprava" class="field main-skill" style="top:0;left:0;width:100%;position:relative;" placeholder="SIL" (click)="rollD20(c.silaOprava.value, 'Síla')" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.silaOprava.value, 'Síla')">🎲</button>
          </span>
          <input [formControl]="c.sila" id="sila-input" class="field" style="top:378.94px; left:78.60px; width:49.78px; text-align: center" placeholder="SIL" />
        </div>

        <div class="cs-ability-group" data-ability="Obratnost">
          <label class="cs-ability-label">Obratnost</label>
          <span class="roll-d20-wrap roll-d20-center" style="top:491.86px; left:72.60px; width:59.78px;">
            <input [formControl]="c.obratnostOprava" class="field main-skill" style="top:0;left:0;width:100%;position:relative;" placeholder="OBR" (click)="rollD20(c.obratnostOprava.value, 'Obratnost')" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.obratnostOprava.value, 'Obratnost')">🎲</button>
          </span>
          <input [formControl]="c.obratnost" id="obratnost-input" class="field" style="top:545.10px; left:78.60px; width:49.78px; text-align: center" placeholder="OBR" />
        </div>

        <div class="cs-ability-group" data-ability="Odolnost">
          <label class="cs-ability-label">Odolnost</label>
          <span class="roll-d20-wrap roll-d20-center" style="top:666.29px; left:72.60px; width:59.78px;">
            <input [formControl]="c.odolnostOprava" class="field main-skill" style="top:0;left:0;width:100%;position:relative;" placeholder="ODL" (click)="rollD20(c.odolnostOprava.value, 'Odolnost')" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.odolnostOprava.value, 'Odolnost')">🎲</button>
          </span>
          <input [formControl]="c.odolnost" id="odolnost-input" class="field" style="top:720.53px; left:78.60px; width:49.78px; text-align: center" placeholder="ODL" />
        </div>

        <div class="cs-ability-group" data-ability="Inteligence">
          <label class="cs-ability-label">Inteligence</label>
          <span class="roll-d20-wrap roll-d20-center" style="top:841.72px; left:72.60px; width:59.78px;">
            <input [formControl]="c.inteligenceOprava" class="field main-skill" style="top:0;left:0;width:100%;position:relative;" placeholder="INT" (click)="rollD20(c.inteligenceOprava.value, 'Inteligence')" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.inteligenceOprava.value, 'Inteligence')">🎲</button>
          </span>
          <input [formControl]="c.inteligence" id="inteligence-input" class="field" style="top:894.15px; left:78.60px; width:49.78px; text-align: center" placeholder="INT" />
        </div>

        <div class="cs-ability-group" data-ability="Moudrost">
          <label class="cs-ability-label">Moudrost</label>
          <span class="roll-d20-wrap roll-d20-center" style="top:1009.30px; left:72.60px; width:59.78px;">
            <input [formControl]="c.moudrostOprava" class="field main-skill" style="top:0;left:0;width:100%;position:relative;" placeholder="MDR" (click)="rollD20(c.moudrostOprava.value, 'Moudrost')" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.moudrostOprava.value, 'Moudrost')">🎲</button>
          </span>
          <input [formControl]="c.moudrost" id="moudrost-input" class="field" style="top:1061.73px; left:78.60px; width:49.78px; text-align: center" placeholder="MDR" />
        </div>

        <div class="cs-ability-group" data-ability="Charisma">
          <label class="cs-ability-label">Charisma</label>
          <span class="roll-d20-wrap roll-d20-center" style="top:1183.92px; left:72.60px; width:59.78px;">
            <input [formControl]="c.charismaOprava" class="field main-skill" style="top:0;left:0;width:100%;position:relative;" placeholder="CHA" (click)="rollD20(c.charismaOprava.value, 'Charisma')" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.charismaOprava.value, 'Charisma')">🎲</button>
          </span>
          <input [formControl]="c.charisma" id="charisma-input" class="field" style="top:1236.36px; left:78.60px; width:49.78px; text-align: center" placeholder="CHA" />
        </div>
      </ng-container>
    }
  `,
})
export class CsAbilityScoresComponent {
  readonly sheetTheme = inject(SheetThemeService);
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
