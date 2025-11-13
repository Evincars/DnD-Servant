import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  HeaderInfoForm,
  LookAndFeelForm,
  SecondPageForm,
  ThirdPageForm,
  TopInfoForSpellSheetForm,
} from '@dn-d-servant/character-sheet-util';

@Component({
  selector: 'third-page',
  template: `
    <img src="character-sheet-3.png" alt="Character Sheet" height="1817" width="1293" />

    <input
      [formControl]="controls.topInfoForSpellSheet.controls.jmenoPostavy"
      class="field"
      style="top:179px; left:472px; width:347px; text-align: center"
      placeholder="Jméno postavy"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.stupenPozic"
      class="field"
      style="top:121px; left:960px; width:82px;"
      placeholder="Stupeň"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox1"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1061px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox2"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1102px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox3"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1144px;"
    />
    <input
      [formControl]="controls.topInfoForSpellSheet.controls.checkbox4"
      type="checkbox"
      class="field checkbox third-page-checkbox"
      style="top:122px; left:1185px;"
    />
  `,
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class ThirdPageComponent {
  form = input.required<FormGroup<ThirdPageForm>>();

  get controls(): ThirdPageForm {
    return this.form().controls;
  }

  static createForm(): FormGroup<ThirdPageForm> {
    const fb = new FormBuilder().nonNullable;
    return fb.group<ThirdPageForm>({
      topInfoForSpellSheet: fb.group<TopInfoForSpellSheetForm>({
        jmenoPostavy: fb.control(''),
        stupenPozic: fb.control(''),
        checkbox1: fb.control(''),
        checkbox2: fb.control(''),
        checkbox3: fb.control(''),
        checkbox4: fb.control(''),
        mystickyTaj: fb.control(''),
        mystickyTajCheckbox1: fb.control(''),
        mystickyTajCheckbox2: fb.control(''),
        mystickyTajCheckbox3: fb.control(''),
        mystickyTajCheckbox4: fb.control(''),
      }),
    });
  }
}
