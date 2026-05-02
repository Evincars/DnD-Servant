import { ChangeDetectionStrategy, Component, inject, input, signal, effect } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TopInfoForm } from '@dn-d-servant/character-sheet-util';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { openBackgroundDialog } from '../help-dialogs/background-dialog.component';
import { openConvictionDialog } from '../help-dialogs/conviction-dialog.component';
import { openLevelsDialog } from '../help-dialogs/levels-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { SheetThemeService } from '@dn-d-servant/character-sheet-feature';

@Component({
  selector: 'cs-top-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', '[class.theme-dark]': 'sheetTheme.darkMode()' },
  imports: [ReactiveFormsModule, MatIcon, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Základní informace</h3>
    @if (_tick()) {
      <ng-container [formGroup]="form()">
        <div class="cs-top-field-wrap" data-label="Rasa">
          <input [formControl]="c.rasa" class="field" style="top:78px; left:47px; width:189px" placeholder="Rasa" />
        </div>
        <div class="cs-top-field-wrap" data-label="Povolání">
          <input [formControl]="c.povolani" class="field" style="top:78px; left:248px; width:188px;" placeholder="Povolání" />
        </div>

        <button
          (click)="onOpenBackgroundDialog()"
          type="button"
          matTooltip="Zázemí postavy"
          style="top: 145px; left: 25px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <div class="cs-top-field-wrap" data-label="Zázemí">
          <input [formControl]="c.zazemi" class="field" style="top: 145px; left: 48px; width: 188px;" placeholder="Zázemí" />
        </div>

        <button
          (click)="onOpenConvictionDialog()"
          type="button"
          matTooltip="Přesvědčení postavy"
          style="top:145px; left:440px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <div class="cs-top-field-wrap" data-label="Přesvědčení">
          <input [formControl]="c.presvedceni" class="field" style="top:145px; left:248px; width:188px;" placeholder="Přesvědčení" />
        </div>

        <div class="cs-top-field-wrap cs-top-field-wrap--jmeno" data-label="Jméno postavy">
          <input [formControl]="c.jmenoPostavy" class="field" style="top:136px; left:466px; width:362px; text-align: center; font-weight: bold" placeholder="Jméno postavy" />
        </div>

        <button
          (click)="onOpenLevelsDialog()"
          type="button"
          matTooltip="Úroveň postavy"
          style="top:78px; left:835px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <div class="cs-top-field-wrap" data-label="Úroveň">
          <input [formControl]="c.uroven" id="uroven-input" class="field" style="top:78px; left:860px; width:188px;" placeholder="Úroveň" />
        </div>
        <div class="cs-top-field-wrap" data-label="Zkušenosti">
          <input [formControl]="c.zkusenosti" class="field" style="top:78px; left:1058px; width:188px;" placeholder="Zkušenost" />
        </div>
        <div class="cs-top-field-wrap" data-label="Hráč">
          <input [formControl]="c.hrac" class="field" style="top:145px; left:860px; width:386px;" placeholder="Hráč" />
        </div>
      </ng-container>
    }
  `,
})
export class CsTopInfoComponent {
  readonly sheetTheme = inject(SheetThemeService);
  form = input.required<FormGroup<TopInfoForm>>();
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  readonly _tick = signal(0);

  constructor() {
    effect(() => {
      const f = this.form();
      f.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this._tick.update(v => v + 1));
      this._tick.update(v => v + 1);
    });
  }

  get c() {
    return this.form().controls;
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
}
