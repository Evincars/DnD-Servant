import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HeaderInfoForm, LookAndFeelForm, SecondPageForm } from '@dn-d-servant/character-sheet-util';

@Component({
  selector: 'second-page',
  template: `
    <img src="character-sheet-2-copy.png" alt="Character Sheet" height="1817" width="1293" />

    <input
      [formControl]="controls.headerInfo.controls.jmenoPostavy"
      class="field"
      style="top:83px; left:79px; width:347px; text-align: center"
      placeholder="Jméno postavy"
    />
    <input
      [formControl]="controls.headerInfo.controls.titulyAHodnosti"
      class="field"
      style="top:83px; left:867px; width:342px; text-align: center"
      placeholder="Tituly, hodnosti, řády, ..."
    />

    <input
      [formControl]="controls.lookAndFeelForm.controls.vek"
      class="field"
      style="top:297px; left:74px; width:171px"
      placeholder="Věk"
    />
    <input
      [formControl]="controls.lookAndFeelForm.controls.plet"
      class="field"
      style="top:297px; left:261px; width:171px"
      placeholder="Pleť"
    />
    <input
      [formControl]="controls.lookAndFeelForm.controls.vyska"
      class="field"
      style="top:372px; left:74px; width:171px"
      placeholder="Výška"
    />
    <input
      [formControl]="controls.lookAndFeelForm.controls.vlasy"
      class="field"
      style="top:372px; left:261px; width:171px"
      placeholder="Vlasy"
    />
    <input
      [formControl]="controls.lookAndFeelForm.controls.vaha"
      class="field"
      style="top:451px; left:74px; width:171px"
      placeholder="Váha"
    />
    <input
      [formControl]="controls.lookAndFeelForm.controls.oci"
      class="field"
      style="top:451px; left:261px; width:171px"
      placeholder="Oči"
    />
    <input
      [formControl]="controls.lookAndFeelForm.controls.postava"
      class="field"
      style="top:530px; left:74px; width:359px"
      placeholder="Postava"
    />
    <textarea
      [formControl]="controls.lookAndFeelForm.controls.obleceniAVzezreni"
      class="field textarea"
      style="top:603px; left:74px; width:359px; height:82px;"
      placeholder="Oblečení/vzezření..."
    ></textarea>
    <textarea
      [formControl]="controls.lookAndFeelForm.controls.dojemAVystupovani"
      class="field textarea"
      style="top:725px; left:74px; width:359px; height:82px;"
      placeholder="Dojem/vystupování..."
    ></textarea>

    <textarea
      [formControl]="controls.vztahy"
      class="field textarea"
      style="top:315px; left:464px; width:754px; height:912px;"
      placeholder="Vztahy..."
    ></textarea>

    <textarea
      [formControl]="controls.dalsiPoznamky1"
      class="field textarea"
      style="top:1318px; left:74px; width:560px; height:447px;"
      placeholder="Další poznámky..."
    ></textarea>
    <textarea
      [formControl]="controls.dalsiPoznamky2"
      class="field textarea"
      style="top:1318px; left:643px; width:574px; height:447px;"
      placeholder="..."
    ></textarea>
  `,
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class SecondPageComponent {
  form = input.required<FormGroup<SecondPageForm>>();

  get controls(): SecondPageForm {
    return this.form().controls;
  }

  static createForm(): FormGroup<SecondPageForm> {
    const fb = new FormBuilder().nonNullable;
    return fb.group<SecondPageForm>({
      headerInfo: fb.group<HeaderInfoForm>({
        jmenoPostavy: fb.control(''),
        titulyAHodnosti: fb.control(''),
      }),
      lookAndFeelForm: fb.group<LookAndFeelForm>({
        vek: fb.control(''),
        plet: fb.control(''),
        vyska: fb.control(''),
        vlasy: fb.control(''),
        vaha: fb.control(''),
        oci: fb.control(''),
        postava: fb.control(''),
        obleceniAVzezreni: fb.control(''),
        dojemAVystupovani: fb.control(''),
      }),
      vztahy: fb.control(''),
      dalsiPoznamky1: fb.control(''),
      dalsiPoznamky2: fb.control(''),
    });
  }
}
