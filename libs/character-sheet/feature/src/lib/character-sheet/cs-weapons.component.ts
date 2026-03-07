import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WeaponsForm } from '@dn-d-servant/character-sheet-util';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { openWeaponsAndArmorsDialog } from '../help-dialogs/weapons-and-armors-dialog.component';
import { openWeaponsDialog } from '../help-dialogs/weapons-dialog.component';
import { openManeuversDialog } from '../help-dialogs/maneuvers-dialog.component';
import { openSpecialSituationsDialog } from '../help-dialogs/special-situations-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'cs-weapons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ReactiveFormsModule, NgClass, MatIcon, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    @if (_tick()) {
      <ng-container [formGroup]="form()">
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

        <!-- Weapon rows 1-5 -->
        @for (row of weaponRows; track row.num) {
          <input
            [formControl]="getControl(row.zbranKey)"
            [id]="'weapon' + row.num"
            class="field field-sm"
            [style]="row.zbranStyle"
            placeholder="Zbraň / útok"
          />
          <input
            [formControl]="getControl(row.bonusKey)"
            [id]="'weapon' + row.num + '_bonus'"
            class="field field-sm"
            [style]="row.bonusStyle"
            placeholder="Bonus"
          />
          <input
            [formControl]="getControl(row.zasahKey)"
            [id]="'weapon' + row.num + '_hit'"
            class="field field-sm"
            [style]="row.zasahStyle"
            placeholder="Zásah"
          />
          <input
            [formControl]="getControl(row.typKey)"
            [id]="'weapon' + row.num + '_type'"
            class="field field-sm"
            [style]="row.typStyle"
            placeholder="Typ"
          />
          <input
            [formControl]="getControl(row.dosahKey)"
            [id]="'weapon' + row.num + '_distance'"
            class="field field-sm"
            [style]="row.dosahStyle"
            placeholder="Dosah"
          />
          <input
            [formControl]="getControl(row.ocKey)"
            [id]="'weapon' + row.num + '_armorClass'"
            class="field field-sm"
            [style]="row.ocStyle"
            placeholder="Dosah"
          />
        }

        <div
          [ngClass]="abilityCheckboxClass(c.zdatnostJednoduche)"
          (click)="cycleAbilityZdatnost(c.zdatnostJednoduche)"
          id="zdatnostSJednoduchymaZbranema"
          class="field ability-zdatnost-checkbox"
          style="top:1255px; left:446.78px;"
        ></div>
        <div
          [ngClass]="abilityCheckboxClass(c.zdatnostValecne)"
          (click)="cycleAbilityZdatnost(c.zdatnostValecne)"
          id="zdatnostSValecnymaZbranema"
          class="field ability-zdatnost-checkbox"
          style="top:1255px; left:572.54px;"
        ></div>
        <input
          [formControl]="c.dalsiZdatnosti"
          id="dalsiZdatnostSeZbrani"
          class="field"
          style="top:1248px; left:666.79px; width:514.83px"
          placeholder="Další zdatnosti..."
        />
      </ng-container>
    }
  `,
})
export class CsWeaponsComponent {
  form = input.required<FormGroup<WeaponsForm>>();
  private dialog = inject(MatDialog);
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

  readonly weaponRows = [
    {
      num: 1,
      zbranKey: 'zbran1',
      bonusKey: 'zbran1Bonus',
      zasahKey: 'zbran1Zasah',
      typKey: 'zbran1Typ',
      dosahKey: 'zbran1Dosah',
      ocKey: 'zbran1Oc',
      zbranStyle: 'top:1067px; left:444px; width:266px',
      bonusStyle: 'top:1067.38px; left:714.95px; width:78.6px',
      zasahStyle: 'top:1067.38px; left:797.79px; width:78.6px',
      typStyle: 'top:1067.38px; left:883.94px; width:95.63px',
      dosahStyle: 'top:1067.38px; left:983.81px; width:95.63px',
      ocStyle: 'top:1067.38px; left:1086.99px; width:95.63px',
    },
    {
      num: 2,
      zbranKey: 'zbran2',
      bonusKey: 'zbran2Bonus',
      zasahKey: 'zbran2Zasah',
      typKey: 'zbran2Typ',
      dosahKey: 'zbran2Dosah',
      ocKey: 'zbran2Oc',
      zbranStyle: 'top:1101.10px; left:444.09px; width:266.93px',
      bonusStyle: 'top:1101.10px; left:714.95px; width:78.6px',
      zasahStyle: 'top:1101.10px; left:797.79px; width:78.6px',
      typStyle: 'top:1101.10px; left:883.94px; width:95.63px',
      dosahStyle: 'top:1101.10px; left:983.81px; width:95.63px',
      ocStyle: 'top:1101.10px; left:1086.99px; width:95.63px',
    },
    {
      num: 3,
      zbranKey: 'zbran3',
      bonusKey: 'zbran3Bonus',
      zasahKey: 'zbran3Zasah',
      typKey: 'zbran3Typ',
      dosahKey: 'zbran3Dosah',
      ocKey: 'zbran3Oc',
      zbranStyle: 'top:1135.63px; left:444.09px; width:266.93px',
      bonusStyle: 'top:1135.63px; left:714.95px; width:78.6px',
      zasahStyle: 'top:1135.63px; left:797.79px; width:78.6px',
      typStyle: 'top:1135.63px; left:883.94px; width:95.63px',
      dosahStyle: 'top:1135.63px; left:983.81px; width:95.63px',
      ocStyle: 'top:1135.63px; left:1086.99px; width:95.63px',
    },
    {
      num: 4,
      zbranKey: 'zbran4',
      bonusKey: 'zbran4Bonus',
      zasahKey: 'zbran4Zasah',
      typKey: 'zbran4Typ',
      dosahKey: 'zbran4Dosah',
      ocKey: 'zbran4Oc',
      zbranStyle: 'top:1170.15px; left:444.09px; width:266.93px',
      bonusStyle: 'top:1170.15px; left:714.95px; width:78.6px',
      zasahStyle: 'top:1170.15px; left:797.79px; width:78.6px',
      typStyle: 'top:1170.15px; left:883.94px; width:95.63px',
      dosahStyle: 'top:1170.15px; left:983.81px; width:95.63px',
      ocStyle: 'top:1170.15px; left:1086.99px; width:95.63px',
    },
    {
      num: 5,
      zbranKey: 'zbran5',
      bonusKey: 'zbran5Bonus',
      zasahKey: 'zbran5Zasah',
      typKey: 'zbran5Typ',
      dosahKey: 'zbran5Dosah',
      ocKey: 'zbran5Oc',
      zbranStyle: 'top:1205.67px; left:444.09px; width:266.93px',
      bonusStyle: 'top:1205.67px; left:714.95px; width:78.6px',
      zasahStyle: 'top:1205.67px; left:797.79px; width:78.6px',
      typStyle: 'top:1205.67px; left:883.94px; width:95.63px',
      dosahStyle: 'top:1205.67px; left:983.81px; width:95.63px',
      ocStyle: 'top:1205.67px; left:1086.99px; width:95.63px',
    },
  ] as const;

  getControl(key: string): FormControl {
    return this.c[key as keyof WeaponsForm] as unknown as FormControl;
  }

  onOpenWeaponsAndArmorsDialog() {
    openWeaponsAndArmorsDialog(this.dialog);
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
}
