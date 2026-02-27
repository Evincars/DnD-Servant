import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HeaderInfoForm, LookAndFeelForm, SecondPageForm } from '@dn-d-servant/character-sheet-util';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    <label class="field image-label" style="top:835px; left:74px; width:359px;">
      Klikni pro nahrání obrázku postavy
      <input type="file" name="file" (change)="onFileSelected($event)" style="display:none;" />
    </label>
    <img
      [src]="base64Image()"
      style="position: absolute; top:873px; left:74px; width:359px; max-height: 365px; box-shadow: 0 10px 25px rgba(0,0,0,0.0);"
      alt="Obrázek postavy"
    />

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
  characterSheetStore = inject(CharacterSheetStore);
  private snackBar = inject(MatSnackBar);

  form = input.required<FormGroup<SecondPageForm>>();

  base64Image = signal<string | null>(null);
  imageSaved = output<string>();

  get controls(): SecondPageForm {
    return this.form().controls;
  }

  constructor() {
    const checkIfImageIsLoaded = effect(() => {
      const imageBase64 = this.characterSheetStore.characterSheet()?.secondPageForm.obrazekPostavy;

      untracked(() => {
        if (imageBase64) {
          this.base64Image.set('data:image/png;base64,' + imageBase64);
        }
      });
    });
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
      obrazekPostavy: fb.control(null),
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const maxSizeBytes = 500 * 1024; // 500 KB
    if (file.size > maxSizeBytes) {
      this.snackBar.open(
        `Obrázek je příliš velký (${(file.size / 1024).toFixed(
          0,
        )} KB). Maximum je 500 KB. Otevři obrázek v Malování, zmenši jeho velikost a ulož jako GIF.`,
        'Zavřít',
        {
          verticalPosition: 'top',
          duration: 6500,
        },
      );
      // reset the input
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      // Show preview immediately using the full data URL (includes correct MIME type)
      this.base64Image.set(dataUrl);
      // Update local store state (raw base64 only)
      this.characterSheetStore.saveCharacterImage(base64);
      // Trigger save to server
      this.imageSaved.emit(base64);
    };
    reader.readAsDataURL(file);
  }
}
