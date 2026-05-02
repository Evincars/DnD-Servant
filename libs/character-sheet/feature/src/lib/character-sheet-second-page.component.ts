import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HeaderInfoForm, LookAndFeelForm, SecondPageForm } from '@dn-d-servant/character-sheet-util';
import { RichTextareaComponent } from '@dn-d-servant/ui';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SheetThemeService } from './sheet-theme.service';
import { CsSvgSheetComponent } from './character-sheet/cs-svg-sheet.component';

@Component({
  selector: 'second-page',
  template: `
    <cs-svg-sheet src="character-sheets/character-sheet-2.svg" />

    <h3 class="cs-section-title">Vzhled a povaha</h3>

    <input
      [formControl]="controls.headerInfo.controls.jmenoPostavy"
      class="field cs-sp-name-hide"
      style="top:83px; left:79px; width:347px; text-align: center"
      placeholder="Jméno postavy"
    />

    <div class="cs-sp-appearance-grid">
      <input
        [formControl]="controls.headerInfo.controls.titulyAHodnosti"
        class="field"
        data-label="Tituly a hodnosti"
        style="top:83px; left:867px; width:342px; text-align: center"
        placeholder="Tituly, hodnosti, řády, ..."
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.vek"
        class="field"
        data-label="Věk"
        style="top:297px; left:74px; width:171px"
        placeholder="Věk"
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.plet"
        class="field"
        data-label="Pleť"
        style="top:297px; left:261px; width:171px"
        placeholder="Pleť"
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.vyska"
        class="field"
        data-label="Výška"
        style="top:372px; left:74px; width:171px"
        placeholder="Výška"
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.vlasy"
        class="field"
        data-label="Vlasy"
        style="top:372px; left:261px; width:171px"
        placeholder="Vlasy"
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.vaha"
        class="field"
        data-label="Váha"
        style="top:451px; left:74px; width:171px"
        placeholder="Váha"
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.oci"
        class="field"
        data-label="Oči"
        style="top:451px; left:261px; width:171px"
        placeholder="Oči"
      />
      <input
        [formControl]="controls.lookAndFeelForm.controls.postava"
        class="field"
        data-label="Postava"
        style="top:530px; left:74px; width:359px"
        placeholder="Postava"
      />
    </div>
    <div class="cs-spells-field-wrap cs-spells-field-wrap--textarea cs-responsive-only" data-label="O postavě">
      <rich-textarea [formControl]="infoAboutCharacterControl()" class="field textarea" style="top:545.1px; left:834.47px; width:349.77px; height:432px;"></rich-textarea>
    </div>
    <rich-textarea
      [formControl]="controls.lookAndFeelForm.controls.obleceniAVzezreni"
      class="field textarea"
      style="top:603px; left:74px; width:359px; height:82px;"
    ></rich-textarea>
    <rich-textarea
      [formControl]="controls.lookAndFeelForm.controls.dojemAVystupovani"
      class="field textarea"
      style="top:725px; left:74px; width:359px; height:82px;"
    ></rich-textarea>
    <!-- ── Character portrait — click to upload, button to full-screen ── -->
    <div
      class="field char-img-wrap"
      style="top:835px; left:74px; width:359px; height:403px;"
      (click)="triggerFileInput()"
      matTooltip="Klikni pro nahrání nebo změnu obrázku (max 500 KB, GIF) - poslední záložka Konvertor Obrázků"
    >
      @if (base64Image()) {
        <img [src]="base64Image()!" alt="Obrázek postavy" class="char-img" />
        <button
          mat-icon-button
          type="button"
          class="char-img-view-btn"
          (click)="openPreview($event)"
          matTooltip="Zobrazit v plné velikosti"
        >
          <mat-icon>open_in_full</mat-icon>
        </button>
        <div class="char-img-overlay"><mat-icon>upload</mat-icon></div>
      } @else {
        <div class="char-img-placeholder">
          <mat-icon>add_photo_alternate</mat-icon>
          <span>Klikni pro nahrání obrázku</span>
          <span class="char-img-hint">nejlépe GIF, max 500 KB</span>
        </div>
      }
      <input #charFileInput type="file" accept="image/*" (change)="onFileSelected($event)" style="display:none;" />
    </div>

    <!-- ── Full-scale preview overlay ── -->
    @if (showPreview()) {
      <div class="char-img-backdrop" (click)="closePreview()">
        <div class="char-img-preview" (click)="$event.stopPropagation()">
          <button mat-icon-button type="button" class="char-img-close-btn" (click)="closePreview()" matTooltip="Zavřít">
            <mat-icon>close</mat-icon>
          </button>
          <div class="char-img-preview-frame">
            <img [src]="base64Image()!" alt="Obrázek postavy" />
          </div>
          <div class="char-img-preview-hint">Klikni mimo obrázek nebo stiskni Esc pro zavření</div>
        </div>
      </div>
    }

    <h4 class="cs-section-title cs-sub-title">Vztahy a příběh</h4>
    <rich-textarea
      [formControl]="controls.vztahy"
      class="field textarea"
      style="top:315px; left:464px; width:754px; height:912px;"
    ></rich-textarea>

    <h4 class="cs-section-title cs-sub-title">Další poznámky</h4>
    <rich-textarea
      [formControl]="controls.dalsiPoznamky1"
      class="field textarea"
      style="top:1318px; left:74px; width:560px; height:447px;"
    ></rich-textarea>
    <rich-textarea
      [formControl]="controls.dalsiPoznamky2"
      class="field textarea"
      style="top:1318px; left:643px; width:574px; height:447px;"
    ></rich-textarea>
  `,
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatTooltip, RichTextareaComponent, MatIconButton, MatIcon, CsSvgSheetComponent],
  host: { '(document:keydown.escape)': 'onEscape()', '[class.theme-dark]': 'sheetTheme.darkMode()' },
})
export class CharacterSheetSecondPageComponent {
  characterSheetStore = inject(CharacterSheetStore);
  private snackBar = inject(MatSnackBar);
  readonly sheetTheme = inject(SheetThemeService);

  form = input.required<FormGroup<SecondPageForm>>();
  infoAboutCharacterControl = input.required<any>();

  base64Image = signal<string | null>(null);
  showPreview = signal(false);
  imageSaved = output<string>();

  private readonly charFileInput = viewChild<ElementRef<HTMLInputElement>>('charFileInput');

  get controls(): SecondPageForm {
    return this.form().controls;
  }

  constructor() {
    const checkIfImageIsLoaded = effect(() => {
      const imageBase64 = this.characterSheetStore.characterSheet()?.secondPageForm?.obrazekPostavy;

      untracked(() => {
        if (imageBase64) {
          this.base64Image.set('data:image/png;base64,' + imageBase64);
        }
      });
    });
  }

  triggerFileInput(): void {
    this.charFileInput()?.nativeElement.click();
  }

  openPreview(event: MouseEvent): void {
    event.stopPropagation();
    this.showPreview.set(true);
  }

  closePreview(): void {
    this.showPreview.set(false);
  }

  onEscape(): void {
    if (this.showPreview()) this.closePreview();
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
