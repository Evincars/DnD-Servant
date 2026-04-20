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

@Component({
  selector: 'cs-top-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ReactiveFormsModule, MatIcon, MatTooltip],
  styleUrl: '../character-sheet.component.scss',
  template: `
    <h3 class="cs-section-title">Základní informace</h3>
    @if (_tick()) {
      <ng-container [formGroup]="form()">
        <input [formControl]="c.rasa" class="field" style="top:92.21px; left:58.95px; width:183.4px" placeholder="Rasa" />
        <input
          [formControl]="c.povolani"
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
        <input [formControl]="c.zazemi" class="field" style="top: 158px; left: 58px; width: 183px;" placeholder="Zázemí" />

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
          [formControl]="c.presvedceni"
          class="field"
          style="top:158px; left:255px; width:183px;"
          placeholder="Přesvědčení"
        />

        <input
          [formControl]="c.jmenoPostavy"
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
          [formControl]="c.uroven"
          id="uroven-input"
          class="field"
          style="top:92px; left:858px; width:183px;"
          placeholder="Úroveň"
        />
        <input
          [formControl]="c.zkusenosti"
          class="field"
          style="top:92.67px; left:1051.93px; width:183.4px;"
          placeholder="Zkušenost"
        />
        <input [formControl]="c.hrac" class="field" style="top:158.08px; left:858.05px; width:183.4px;" placeholder="Hráč" />
      </ng-container>
    }
  `,
})
export class CsTopInfoComponent {
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
