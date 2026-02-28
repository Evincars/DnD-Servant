import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  GroupInventoryForm,
  GroupSheetForm,
  RichTextareaComponent,
  SpinnerOverlayComponent,
} from '@dn-d-servant/character-sheet-util';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GroupSheetFormModelMappers } from './group-sheet-form-model-mappers';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { openAnimalsDialog } from './help-dialogs/animals-dialog.component';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimalKey, animalsSelect } from './animals-select';
import { openGroupBackgroundDialog } from './help-dialogs/group-background-dialog.component';

@Component({
  selector: 'group-sheet',
  template: `
    <spinner-overlay [diameter]="70" [showSpinner]="characterSheetStore.loading()">
      <img src="group-sheet-1.webp" alt="Group Sheet" height="1817" width="1293" />
      <img src="group-sheet-2.webp" alt="Group Sheet" height="1817" width="1293" />

      <form [formGroup]="form">
        <input
          [formControl]="controls.jmenoSkupinovehoZazemi"
          class="field"
          style="top:82px; left:76px; width:355px; text-align: center"
          placeholder="*"
        />

        <button
          (click)="onOpenGroupBackgroundDialog()"
          type="button"
          matTooltip="Skupinové zázemí"
          style="top:121px; left:1130px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <input
          [formControl]="controls.typSkupinovehoZazemi"
          class="field"
          style="top:82px; left:862px; width:354px; text-align: center"
          placeholder="*"
        />

        <input
          [formControl]="controls.jmenoSkupiny"
          class="field"
          style="top:300px; left:76px; width:353px; text-align: center"
          placeholder="Jméno skupiny"
        />

        <input
          [formControl]="controls.zdatnostPriSkupinovemOvereni"
          class="field"
          style="top:417px; left:76px; width:353px; text-align: center"
          placeholder="Zdatnost při skupinovém ověření"
        />

        <rich-textarea
          [formControl]="controls.zdatnostSPomuckamiAJazyky"
          class="field textarea"
          style="top:516px; left:76px; width:350px; height:90px;"
        ></rich-textarea>

        <rich-textarea
          [formControl]="controls.schopnostSkupinovehoZazemi"
          class="field textarea"
          style="top:658px; left:76px; width:350px; height:200px;"
        ></rich-textarea>

        <rich-textarea
          [formControl]="controls.skupinoveZazemi"
          class="field textarea"
          style="top:279px; left:464px; width:756px; height:579px;"
        ></rich-textarea>

        <button
          (click)="onOpenAnimalsDialog()"
          type="button"
          matTooltip="Zvířata a jejich nosnost"
          style="top:888px; left:690px;"
          class="field button small-info-button-icon"
        >
          <mat-icon class="small-info-icon">info</mat-icon>
        </button>
        <select [formControl]="controls.zvire" class="field" style="top:947px; left:124px; width:254px;">
          @for (animal of animalsSelect; track $index) {
          <option [value]="animal.key">{{ animal.value }}</option>
          }
        </select>
        <input
          [formControl]="controls.zvireJmeno"
          class="field"
          style="top:948px; left:381px; width:235px;"
          placeholder="Jméno zvířete"
        />
        <input [formControl]="controls.penize" class="field" style="top:948px; left:727px; width:491px;" placeholder="Peníze" />

        <!--        Column 1 of inventory-->
        <input
          [formControl]="controls.vybava.controls.radek1"
          [ngClass]="inventoryClasses()[0]"
          class="field inventory-item"
          style="top:1010px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek2"
          [ngClass]="inventoryClasses()[1]"
          class="field inventory-item"
          style="top:1058px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek3"
          [ngClass]="inventoryClasses()[2]"
          class="field inventory-item"
          style="top:1107px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek4"
          [ngClass]="inventoryClasses()[3]"
          class="field inventory-item"
          style="top:1156px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek5"
          [ngClass]="inventoryClasses()[4]"
          class="field inventory-item"
          style="top:1205px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek6"
          [ngClass]="inventoryClasses()[5]"
          class="field inventory-item"
          style="top:1254px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek7"
          [ngClass]="inventoryClasses()[6]"
          class="field inventory-item"
          style="top:1302px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek8"
          [ngClass]="inventoryClasses()[7]"
          class="field inventory-item"
          style="top:1350px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek9"
          [ngClass]="inventoryClasses()[8]"
          class="field inventory-item"
          style="top:1399px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek10"
          [ngClass]="inventoryClasses()[9]"
          class="field inventory-item"
          style="top:1447px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek11"
          [ngClass]="inventoryClasses()[10]"
          class="field inventory-item"
          style="top:1495px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek12"
          [ngClass]="inventoryClasses()[11]"
          class="field inventory-item"
          style="top:1543px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek13"
          [ngClass]="inventoryClasses()[12]"
          class="field inventory-item"
          style="top:1592px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek14"
          [ngClass]="inventoryClasses()[13]"
          class="field inventory-item"
          style="top:1641px; left:86px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek15"
          [ngClass]="inventoryClasses()[14]"
          class="field inventory-item"
          style="top:1689px; left:86px; width:347px;"
          placeholder="*"
        />

        <!--        Column 2 of inventory-->
        <input
          [formControl]="controls.vybava.controls.radek16"
          [ngClass]="inventoryClasses()[15]"
          class="field inventory-item"
          style="top:1010px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek17"
          [ngClass]="inventoryClasses()[16]"
          class="field inventory-item"
          style="top:1058px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek18"
          [ngClass]="inventoryClasses()[17]"
          class="field inventory-item"
          style="top:1107px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek19"
          [ngClass]="inventoryClasses()[18]"
          class="field inventory-item"
          style="top:1156px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek20"
          [ngClass]="inventoryClasses()[19]"
          class="field inventory-item"
          style="top:1205px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek21"
          [ngClass]="inventoryClasses()[20]"
          class="field inventory-item"
          style="top:1254px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek22"
          [ngClass]="inventoryClasses()[21]"
          class="field inventory-item"
          style="top:1302px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek23"
          [ngClass]="inventoryClasses()[22]"
          class="field inventory-item"
          style="top:1350px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek24"
          [ngClass]="inventoryClasses()[23]"
          class="field inventory-item"
          style="top:1399px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek25"
          [ngClass]="inventoryClasses()[24]"
          class="field inventory-item"
          style="top:1447px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek26"
          [ngClass]="inventoryClasses()[25]"
          class="field inventory-item"
          style="top:1495px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek27"
          [ngClass]="inventoryClasses()[26]"
          class="field inventory-item"
          style="top:1543px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek28"
          [ngClass]="inventoryClasses()[27]"
          class="field inventory-item"
          style="top:1592px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek29"
          [ngClass]="inventoryClasses()[28]"
          class="field inventory-item"
          style="top:1641px; left:479px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek30"
          [ngClass]="inventoryClasses()[29]"
          class="field inventory-item"
          style="top:1689px; left:479px; width:347px;"
          placeholder="*"
        />

        <!--        Column 3 of inventory-->
        <input
          [formControl]="controls.vybava.controls.radek31"
          [ngClass]="inventoryClasses()[30]"
          class="field inventory-item"
          style="top:1010px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek32"
          [ngClass]="inventoryClasses()[31]"
          class="field inventory-item"
          style="top:1058px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek33"
          [ngClass]="inventoryClasses()[32]"
          class="field inventory-item"
          style="top:1107px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek34"
          [ngClass]="inventoryClasses()[33]"
          class="field inventory-item"
          style="top:1156px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek35"
          [ngClass]="inventoryClasses()[34]"
          class="field inventory-item"
          style="top:1205px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek36"
          [ngClass]="inventoryClasses()[35]"
          class="field inventory-item"
          style="top:1254px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek37"
          [ngClass]="inventoryClasses()[36]"
          class="field inventory-item"
          style="top:1302px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek38"
          [ngClass]="inventoryClasses()[37]"
          class="field inventory-item"
          style="top:1350px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek39"
          [ngClass]="inventoryClasses()[38]"
          class="field inventory-item"
          style="top:1399px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek40"
          [ngClass]="inventoryClasses()[39]"
          class="field inventory-item"
          style="top:1447px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek41"
          [ngClass]="inventoryClasses()[40]"
          class="field inventory-item"
          style="top:1495px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek42"
          [ngClass]="inventoryClasses()[41]"
          class="field inventory-item"
          style="top:1543px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek43"
          [ngClass]="inventoryClasses()[42]"
          class="field inventory-item"
          style="top:1592px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek44"
          [ngClass]="inventoryClasses()[43]"
          class="field inventory-item"
          style="top:1641px; left:871px; width:347px;"
          placeholder="*"
        />
        <input
          [formControl]="controls.vybava.controls.radek45"
          [ngClass]="inventoryClasses()[44]"
          class="field inventory-item"
          style="top:1689px; left:871px; width:347px;"
          placeholder="*"
        />

        <!--        Second page-->
        <input
          [formControl]="controls.jmenoSkupiny2"
          class="field"
          style="top:2000px; left:76px; width:357px; text-align: center"
          placeholder="Jméno skupiny"
        />
        <input
          [formControl]="controls.reputace"
          class="field"
          style="top:2000px; left:467px; width:751px; text-align: center"
          placeholder="Reputace"
        />

        <rich-textarea
          [formControl]="controls.spolecnici"
          class="field textarea"
          style="top:2210px; left:73px; width:361px; height:1329px;"
        ></rich-textarea>

        <rich-textarea
          [formControl]="controls.vztahyKPostavamAOrganizacim"
          class="field textarea"
          style="top:2235px; left:465px; width:755px; height:1304px;"
        ></rich-textarea>

        <button (click)="onSaveClick()" type="submit" class="field button" style="top:4px; left:1090px; width:150px;">
          Uložit [enter]
        </button>
      </form>
    </spinner-overlay>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SpinnerOverlayComponent, MatIcon, MatTooltip, NgClass, RichTextareaComponent],
})
export class GroupSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  private readonly documentName = '_group';
  animalsSelect = animalsSelect;

  inventoryClasses = signal(Array(45).fill(''));

  fb = new FormBuilder().nonNullable;
  form = this.fb.group<GroupSheetForm>({
    jmenoSkupinovehoZazemi: this.fb.control(''),
    typSkupinovehoZazemi: this.fb.control(''),
    jmenoSkupiny: this.fb.control(''),
    zdatnostPriSkupinovemOvereni: this.fb.control(''),
    zdatnostSPomuckamiAJazyky: this.fb.control(''),
    schopnostSkupinovehoZazemi: this.fb.control(''),
    skupinoveZazemi: this.fb.control(''),
    zvire: this.fb.control(''),
    zvireJmeno: this.fb.control(''),
    penize: this.fb.control(''),
    vybava: this.fb.group<GroupInventoryForm>({
      radek1: this.fb.control(''),
      radek2: this.fb.control(''),
      radek3: this.fb.control(''),
      radek4: this.fb.control(''),
      radek5: this.fb.control(''),
      radek6: this.fb.control(''),
      radek7: this.fb.control(''),
      radek8: this.fb.control(''),
      radek9: this.fb.control(''),
      radek10: this.fb.control(''),
      radek11: this.fb.control(''),
      radek12: this.fb.control(''),
      radek13: this.fb.control(''),
      radek14: this.fb.control(''),
      radek15: this.fb.control(''),

      radek16: this.fb.control(''),
      radek17: this.fb.control(''),
      radek18: this.fb.control(''),
      radek19: this.fb.control(''),
      radek20: this.fb.control(''),
      radek21: this.fb.control(''),
      radek22: this.fb.control(''),
      radek23: this.fb.control(''),
      radek24: this.fb.control(''),
      radek25: this.fb.control(''),
      radek26: this.fb.control(''),
      radek27: this.fb.control(''),
      radek28: this.fb.control(''),
      radek29: this.fb.control(''),
      radek30: this.fb.control(''),

      radek31: this.fb.control(''),
      radek32: this.fb.control(''),
      radek33: this.fb.control(''),
      radek34: this.fb.control(''),
      radek35: this.fb.control(''),
      radek36: this.fb.control(''),
      radek37: this.fb.control(''),
      radek38: this.fb.control(''),
      radek39: this.fb.control(''),
      radek40: this.fb.control(''),
      radek41: this.fb.control(''),
      radek42: this.fb.control(''),
      radek43: this.fb.control(''),
      radek44: this.fb.control(''),
      radek45: this.fb.control(''),
    }),
    jmenoSkupiny2: this.fb.control(''),
    reputace: this.fb.control(''),
    spolecnici: this.fb.control(''),
    vztahyKPostavamAOrganizacim: this.fb.control(''),
  });

  get controls() {
    return this.form.controls;
  }

  constructor() {
    const checkForUsername = effect(() => {
      const username = this.authService.currentUser()?.username;

      untracked(() => {
        if (username) {
          this.characterSheetStore.getGroupSheetByUsername(`${username}${this.documentName}`);
        }
      });
    });

    const fetchedGroupSheet = effect(() => {
      const groupSheet = this.characterSheetStore.groupSheet();

      untracked(() => {
        if (groupSheet) {
          const formValue = FormUtil.convertModelToForm(groupSheet, GroupSheetFormModelMappers.groupSheetFormToApiMapper);
          this.form.patchValue(formValue);
        }
      });
    });

    this.controls.zvire.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      switch (value) {
        case AnimalKey.kunJezdecky:
          this._setInventoryClasses(16, 26, 36);
          break;
        case AnimalKey.kunTazny:
          this._setInventoryClasses(18, 28, 38);
          break;
        case AnimalKey.kunValecny:
          this._setInventoryClasses(18, 28, 38);
          break;
        case AnimalKey.mastif:
          this._setInventoryClasses(6, 11, 16);
          break;
        case AnimalKey.osel:
          this._setInventoryClasses(7, 12, 17);
          break;
        case AnimalKey.ponik:
          this._setInventoryClasses(7, 12, 17);
          break;
        case AnimalKey.slon:
          this._setInventoryClasses(44, 64, 84);
          break;
        case AnimalKey.velbloud:
          this._setInventoryClasses(16, 26, 36);
          break;
      }
    });
  }

  _setInventoryClasses(lightWeight: number, mediumWeight: number, heavyWeight: number) {
    const inventoryClassesArray = [...this.inventoryClasses()];

    inventoryClassesArray.forEach((x, i) => {
      if (i < lightWeight) {
        inventoryClassesArray[i] = 'soft-weight';
      } else if (i < mediumWeight) {
        inventoryClassesArray[i] = 'medium-weight';
      } else if (i < heavyWeight) {
        inventoryClassesArray[i] = 'heavy-weight';
      } else {
        inventoryClassesArray[i] = '';
      }
    });
    this.inventoryClasses.set(inventoryClassesArray);
  }

  onSaveClick() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      const request = FormUtil.convertFormToModel(this.form.getRawValue(), GroupSheetFormModelMappers.groupSheetFormToApiMapper);
      request.username = `${username}${this.documentName}`;

      this.characterSheetStore.saveGroupSheet(request);
    } else {
      this.snackBar.open('Pro uložení karty družiny se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
    }
  }

  onOpenAnimalsDialog() {
    openAnimalsDialog(this.dialog);
  }

  onOpenGroupBackgroundDialog() {
    openGroupBackgroundDialog(this.dialog);
  }
}
