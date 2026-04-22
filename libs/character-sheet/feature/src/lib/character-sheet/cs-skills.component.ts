import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AbilitiesForm } from '@dn-d-servant/character-sheet-util';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DiceRollerService, RichTextareaComponent } from '@dn-d-servant/ui';
import { openToolsDialog } from '../help-dialogs/tools-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'cs-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ReactiveFormsModule, NgClass, MatIcon, MatTooltip, RichTextareaComponent],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Dovednosti</h3>
    <!-- consume formValues signal so OnPush re-renders when form is patched -->
    @if (_tick()) {
      <ng-container [formGroup]="form()">
        <!-- detailed skills -->
        <div class="cs-skill-row">
          <div
            id="atletika-zdatnost"
            [ngClass]="abilityCheckboxClass(c.atletikaZdatnost)"
            (click)="cycleAbilityZdatnost(c.atletikaZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:418px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Atletika (SIL)" style="top:403.38px; left:348.46px; width:70.74px;">
            <input [formControl]="c.atletika" id="atletika" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.atletika.value, 'Atletika')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.akrobacieZdatnost)"
            (click)="cycleAbilityZdatnost(c.akrobacieZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:476px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Akrobacie (OBR)" style="top:461.52px; left:348.46px; width:70.74px;">
            <input [formControl]="c.akrobacie" id="akrobacie" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.akrobacie.value, 'Akrobacie')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.cachryZdatnost)"
            (click)="cycleAbilityZdatnost(c.cachryZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:504px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Čachry (OBR)" style="top:490.59px; left:348.46px; width:70.74px;">
            <input [formControl]="c.cachry" id="cachry" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.cachry.value, 'Čachry')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.nenapadnostZdatnost)"
            (click)="cycleAbilityZdatnost(c.nenapadnostZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:532px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Nenápadnost (OBR)" style="top:519.66px; left:348.46px; width:70.74px;">
            <input [formControl]="c.nenapadnost" id="nenapadnost" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.nenapadnost.value, 'Nenápadnost')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.historieZdatnost)"
            (click)="cycleAbilityZdatnost(c.historieZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:595px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Historie (INT)" style="top:581.44px; left:348.46px; width:70.74px;">
            <input [formControl]="c.historie" id="historie" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.historie.value, 'Historie')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.mystikaZdatnost)"
            (click)="cycleAbilityZdatnost(c.mystikaZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:624px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Mystika (INT)" style="top:610.51px; left:348.46px; width:70.74px;">
            <input [formControl]="c.mystika" id="mystika" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.mystika.value, 'Mystika')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.nabozenstviZdatnost)"
            (click)="cycleAbilityZdatnost(c.nabozenstviZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:653px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Náboženství (INT)" style="top:639.59px; left:348.46px; width:70.74px;">
            <input [formControl]="c.nabozenstvi" id="nabozenstvi" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.nabozenstvi.value, 'Náboženství')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.patraniZdatnost)"
            (click)="cycleAbilityZdatnost(c.patraniZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:681px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Pátrání (INT)" style="top:666.84px; left:348.46px; width:70.74px;">
            <input [formControl]="c.patrani" id="patrani" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.patrani.value, 'Pátrání')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.prirodaZdatnost)"
            (click)="cycleAbilityZdatnost(c.prirodaZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:709px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Příroda (INT)" style="top:695.89px; left:348.46px; width:70.74px;">
            <input [formControl]="c.priroda" id="priroda" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.priroda.value, 'Příroda')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.lekarstviZdatnost)"
            (click)="cycleAbilityZdatnost(c.lekarstviZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:771px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Lékařství (MDR)" style="top:757.69px; left:348.46px; width:70.74px;">
            <input [formControl]="c.lekarstvi" id="lekarstvi" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.lekarstvi.value, 'Lékařství')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.ovladaniZviratZdatnost)"
            (click)="cycleAbilityZdatnost(c.ovladaniZviratZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:800px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Ovl. zvířat (MDR)" style="top:787.76px; left:348.46px; width:70.74px;">
            <input [formControl]="c.ovladaniZvirat" id="ovladaniZvirat" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.ovladaniZvirat.value, 'Ovládání zvířat')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.prezitiZdatnost)"
            (click)="cycleAbilityZdatnost(c.prezitiZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:829px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Přežití (MDR)" style="top:814.42px; left:348.46px; width:70.74px;">
            <input [formControl]="c.preziti" id="preziti" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.preziti.value, 'Přežití')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.vhledZdatnost)"
            (click)="cycleAbilityZdatnost(c.vhledZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:857px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Vhled (MDR)" style="top:844.49px; left:348.46px; width:70.74px;">
            <input [formControl]="c.vhled" id="vhled" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.vhled.value, 'Vhled')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.vnimaniZdatnost)"
            (click)="cycleAbilityZdatnost(c.vnimaniZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:885px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Vnímání (MDR)" style="top:871.16px; left:348.46px; width:70.74px;">
            <input [formControl]="c.vnimani" id="vnimani" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.vnimani.value, 'Vnímání')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.klamaniZdatnost)"
            (click)="cycleAbilityZdatnost(c.klamaniZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:948px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Klamání (CHA)" style="top:934.75px; left:348.46px; width:70.74px;">
            <input [formControl]="c.klamani" id="klamani" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.klamani.value, 'Klamání')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.presvedcovaniZdatnost)"
            (click)="cycleAbilityZdatnost(c.presvedcovaniZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:977px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Přesvědčování (CHA)" style="top:963.01px; left:348.46px; width:70.74px;">
            <input [formControl]="c.presvedcovani" id="presvedcovani" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.presvedcovani.value, 'Přesvědčování')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.vystupovaniZdatnost)"
            (click)="cycleAbilityZdatnost(c.vystupovaniZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:1005px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Vystupování (CHA)" style="top:992.48px; left:348.46px; width:70.74px;">
            <input [formControl]="c.vystupovani" id="vystupovani" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.vystupovani.value, 'Vystupování')">🎲</button>
          </span>
        </div>
        <div class="cs-skill-row">
          <div
            [ngClass]="abilityCheckboxClass(c.zastrasovaniZdatnost)"
            (click)="cycleAbilityZdatnost(c.zastrasovaniZdatnost)"
            class="field ability-zdatnost-checkbox"
            style="top:1035px; left:186.09px;"
          ></div>
          <span class="roll-d20-wrap" data-label="Zastrašování (CHA)" style="top:1019.80px; left:348.46px; width:70.74px;">
            <input [formControl]="c.zastrasovani" id="zastrasovani" class="field no-pb" style="top:0;left:0;width:100%;position:relative;text-align:right;" placeholder="*" />
            <button class="roll-d20-btn" type="button" (click)="rollD20(c.zastrasovani.value, 'Zastrašování')">🎲</button>
          </span>
        </div>

        <button
          (click)="onOpenToolsDialog()"
          type="button"
          matTooltip="Pomůcky"
          style="top:1089px; left:346px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
      </ng-container>
      <rich-textarea
        [formControl]="pomuckyControl()"
        class="field textarea"
        style="top:1126.54px; left:182.09px; width:237.11px; height:167px;"
      ></rich-textarea>
    }
  `,
})
export class CsSkillsComponent {
  form = input.required<FormGroup<AbilitiesForm>>();
  pomuckyControl = input.required<FormControl<string | undefined>>();
  private dialog = inject(MatDialog);
  private diceRollerService = inject(DiceRollerService);
  private destroyRef = inject(DestroyRef);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      this.form()
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get c() {
    return this.form().controls;
  }

  onOpenToolsDialog() {
    openToolsDialog(this.dialog);
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
