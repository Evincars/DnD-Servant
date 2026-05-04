import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { SheetThemeService } from '../sheet-theme.service';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ArmorClassForm, SpeedAndHealingDicesForm } from '@dn-d-servant/character-sheet-util';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { openDamagesDialog } from '../help-dialogs/damages-dialog.component';
import { openArmorClassDialog } from '../help-dialogs/armor-class-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'cs-combat-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', '[class.theme-dark]': 'sheetTheme.darkMode()' },
  imports: [ReactiveFormsModule, NgClass, MatIcon, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Boj</h3>
    @if (_tick()) {
      <ng-container [formGroup]="speedForm()">
        <div class="cs-combat-speed-row">
          <div class="cs-combat-field-wrap" data-label="Lehké naložení">
            <input
              [formControl]="sc.lehke"
              [ngClass]="{ 'speed-highlight-light': speedHighlight() === 'light' }"
              class="field"
              style="top:300.89px; left:831.23px; width:110.04px;"
              placeholder="Lehké"
            />
          </div>
          <div class="cs-combat-field-wrap" data-label="Střední naložení">
            <input
              [formControl]="sc.stredni"
              [ngClass]="{ 'speed-highlight-medium': speedHighlight() === 'medium' }"
              class="field"
              style="top:300.89px; left:954.37px; width:110.04px;"
              placeholder="Střední"
            />
          </div>
          <div class="cs-combat-field-wrap" data-label="Těžké naložení">
            <input
              [formControl]="sc.tezke"
              [ngClass]="{ 'speed-highlight-heavy': speedHighlight() === 'heavy' }"
              class="field"
              style="top:300.89px; left:1075.89px; width:110.04px;"
              placeholder="Těžké"
            />
          </div>
          <div class="cs-combat-field-wrap" data-label="Max bodů výdrže">
            <input
              [formControl]="sc.maxBoduVydrze"
              class="field"
              style="top:276px; left:1202px; width:68px; text-align: center; font-size: 18px; color: red;"
              placeholder="20 / 20"
            />
          </div>
        </div>

        <div class="cs-combat-healing-row">
          <button
            (click)="onOpenDamagesDialog()"
            type="button"
            matTooltip="Bojové a přetrvávající zranění"
            style="top:414px; left:842px;"
            class="field button small-info-button-icon"
          >
            <mat-icon class="small-info-icon">info</mat-icon>
          </button>
          <div class="cs-combat-field-wrap" data-label="Použití kostek">
            <input
              [formControl]="sc.pouzitiKostek"
              class="field"
              style="top:410px; left:884px; width:188px;"
              placeholder="Použití kostek"
            />
          </div>
          <div class="cs-combat-field-wrap" data-label="Max použití kostek">
            <input
              [formControl]="sc.maxPouzitiKostek"
              class="field"
              style="top:447px; left:884px; width:188px;"
              placeholder="Max"
            />
          </div>
        </div>

        <!-- Hearts for Dead saving -->
        <div
          class="field death-save-icon death-save-heart"
          [class.death-save-icon--active]="sc.smrtUspech1.value"
          (click)="toggleDeathSave(sc.smrtUspech1)"
          style="top:410px; left:1094px;"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
        <div
          class="field death-save-icon death-save-heart"
          [class.death-save-icon--active]="sc.smrtUspech2.value"
          (click)="toggleDeathSave(sc.smrtUspech2)"
          style="top:410px; left:1126px;"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
        <div
          class="field death-save-icon death-save-heart"
          [class.death-save-icon--active]="sc.smrtUspech3.value"
          (click)="toggleDeathSave(sc.smrtUspech3)"
          style="top:410px; left:1158px;"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>

        <!-- Skulls for Death saving -->
        <div
          class="field death-save-icon death-save-skull"
          [class.death-save-icon--active]="sc.smrtNeuspech1.value"
          (click)="toggleDeathSave(sc.smrtNeuspech1)"
          style="top:430px; left:1090px;"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-2 14v-1h4v1h-4zm4-3H10v-.62C8.79 11.53 8 10.36 8 9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.36-.79 2.53-2 3.38V13zm-3 2h2v1h-2v-1z"
            />
          </svg>
        </div>
        <div
          class="field death-save-icon death-save-skull"
          [class.death-save-icon--active]="sc.smrtNeuspech2.value"
          (click)="toggleDeathSave(sc.smrtNeuspech2)"
          style="top:430px; left:1122px;"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-2 14v-1h4v1h-4zm4-3H10v-.62C8.79 11.53 8 10.36 8 9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.36-.79 2.53-2 3.38V13zm-3 2h2v1h-2v-1z"
            />
          </svg>
        </div>
        <div
          class="field death-save-icon death-save-skull"
          [class.death-save-icon--active]="sc.smrtNeuspech3.value"
          (click)="toggleDeathSave(sc.smrtNeuspech3)"
          style="top:430px; left:1154px;"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-2 14v-1h4v1h-4zm4-3H10v-.62C8.79 11.53 8 10.36 8 9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.36-.79 2.53-2 3.38V13zm-3 2h2v1h-2v-1z"
            />
          </svg>
        </div>
      </ng-container>

      <!-- Armor Class -->
      <ng-container [formGroup]="armorForm()">
        <button
          (click)="onOpenArmorClassDialog()"
          type="button"
          matTooltip="Zbroje a obranné číslo"
          style="top:335px; left:700px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <div class="cs-combat-ac-row">
          <div class="cs-combat-field-wrap" data-label="OČ (Zbroj)">
            <input
              [formControl]="ac.zbroj"
              matTooltip="Podívej se do tabulky Zbrojí kolik ti dává OČ"
              class="field"
              style="top:411px; left:475px; width:61px; text-align: center; font-size: 22px;"
              placeholder="Zbroj"
            />
          </div>
          <div class="cs-combat-field-wrap" data-label="OČ (Bez zbroje)">
            <input
              [formControl]="ac.bezeZbroje"
              matTooltip="10 + oprava Obratnosti"
              class="field"
              style="top:410.09px; left:582.95px; width:61.57px; text-align: center; font-size: 22px;"
              placeholder="Bez"
            />
          </div>
          <div class="cs-combat-field-wrap" data-label="OČ (Jiné)">
            <input
              [formControl]="ac.jine"
              matTooltip="Kolik Ti přičítá štít nebo jiná ochrana (např. magická)"
              class="field"
              style="top:410.09px; left:692.99px; width:61.57px; text-align: center; font-size: 22px;"
              placeholder="Jiné"
            />
          </div>
        </div>

        <!-- Proficiency with armors -->
        <div class="cs-combat-armor-prof-row">
          <div class="cs-combat-prof-item">
            <div
              [ngClass]="abilityCheckboxClass(ac.zdatnostLehke)"
              (click)="cycleAbilityZdatnost(ac.zdatnostLehke)"
              class="field ability-zdatnost-checkbox"
              style="top:475px; left:449px;"
            ></div>
            <span class="cs-combat-prof-label">Lehké</span>
          </div>
          <div class="cs-combat-prof-item">
            <div
              [ngClass]="abilityCheckboxClass(ac.zdatnostStredni)"
              (click)="cycleAbilityZdatnost(ac.zdatnostStredni)"
              class="field ability-zdatnost-checkbox"
              style="top:475px; left:543px;"
            ></div>
            <span class="cs-combat-prof-label">Střední</span>
          </div>
          <div class="cs-combat-prof-item">
            <div
              [ngClass]="abilityCheckboxClass(ac.zdatnostTezke)"
              (click)="cycleAbilityZdatnost(ac.zdatnostTezke)"
              class="field ability-zdatnost-checkbox"
              style="top:475px; left:648px;"
            ></div>
            <span class="cs-combat-prof-label">Těžké</span>
          </div>
          <div class="cs-combat-prof-item">
            <div
              [ngClass]="abilityCheckboxClass(ac.zdatnostStity)"
              (click)="cycleAbilityZdatnost(ac.zdatnostStity)"
              class="field ability-zdatnost-checkbox"
              style="top:475px; left:741px;"
            ></div>
            <span class="cs-combat-prof-label">Štíty</span>
          </div>
        </div>
      </ng-container>
    }
  `,
})
export class CsCombatStatsComponent {
  readonly sheetTheme = inject(SheetThemeService);
  speedForm = input.required<FormGroup<SpeedAndHealingDicesForm>>();
  armorForm = input.required<FormGroup<ArmorClassForm>>();
  speedHighlight = input<'light' | 'medium' | 'heavy' | ''>('');
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      const speed = this.speedForm();
      const armor = this.armorForm();
      merge(speed.valueChanges, armor.valueChanges)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get sc() {
    return this.speedForm().controls;
  }
  get ac() {
    return this.armorForm().controls;
  }

  onOpenDamagesDialog() {
    openDamagesDialog(this.dialog);
  }
  onOpenArmorClassDialog() {
    openArmorClassDialog(this.dialog);
  }

  toggleDeathSave(control: AbstractControl): void {
    control.setValue(!control.value);
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
