import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LanguagesForm } from '@dn-d-servant/character-sheet-util';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RichTextareaComponent } from '@dn-d-servant/ui';
import { openExpertiseDialog } from '../help-dialogs/expertise-dialog.component';
import { openLanguagesDialog } from '../help-dialogs/languages-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'cs-languages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ReactiveFormsModule, MatIcon, MatTooltip, RichTextareaComponent],
  styleUrl: '../character-sheet.component.scss',
  template: `
    @if (_tick()) {
      <ng-container [formGroup]="form()">
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
          [formControl]="c.jazyky"
          id="jazyky"
          class="field"
          style="top:1349px; left:687px; width:492px"
          placeholder="Jazyky..."
        />
        <rich-textarea
          [formControl]="c.schopnosti"
          class="field textarea"
          style="top:1382px; left:634.04px; width:550.20px; height:381px;"
        ></rich-textarea>
      </ng-container>
    }
  `,
})
export class CsLanguagesComponent {
  form = input.required<FormGroup<LanguagesForm>>();
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

  onOpenExpertiseDialog() {
    openExpertiseDialog(this.dialog);
  }
  onOpenLanguagesDialog() {
    openLanguagesDialog(this.dialog);
  }
}
