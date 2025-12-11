import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, untracked} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {GroupInventoryForm, GroupSheetForm} from "@dn-d-servant/character-sheet-util";
import {AuthService, FormUtil} from "@dn-d-servant/util";
import {CharacterSheetStore} from "@dn-d-servant/character-sheet-data-access";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {GroupSheetFormModelMappers} from "./group-sheet-form-model-mappers";

@Component({
  selector: 'group-sheet',
  template: `
    <img src="group-sheet-1.png" alt="Group Sheet" height="1817" width="1293" />
    <img src="group-sheet-2.png" alt="Group Sheet" height="1817" width="1293" />

    <form [formGroup]="form">
      <input
        [formControl]="controls.jmenoSkupinovehoZazemi"
        class="field"
        style="top:82px; left:76px; width:351px"
        placeholder="*"
      />
      
      <button (click)="onSaveClick()" type="submit" class="field button" style="top:4px; left:1090px; width:150px;">
          Uložit [enter]
      </button>
    </form>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule
  ],
})
export class GroupSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

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
    })
  });

  get controls() {
    return this.form.controls;
  }

  constructor() {
    const checkForUsername = effect(() => {
      const username = this.authService.currentUser()?.username;

      untracked(() => {
        if (username) {
          this.characterSheetStore.getGroupSheetByUsername(username);
        }
      });
    });

    const fetchedGroupSheet = effect(() => {
      const groupSheet = this.characterSheetStore.groupSheet();

      console.log('Fetched group sheet:', groupSheet);

      untracked(() => {
        if (groupSheet) {
          const formValue = FormUtil.convertModelToForm(
            groupSheet,
            GroupSheetFormModelMappers.groupSheetFormToApiMapper,
          );
          this.form.patchValue(formValue);
        }
      });
    });
  }

  onSaveClick() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      const request = FormUtil.convertFormToModel(
        this.form.getRawValue(),
        GroupSheetFormModelMappers.groupSheetFormToApiMapper,
      );
      request.username = `${username}_group`;

      this.characterSheetStore.saveGroupSheet(request);
    } else {
      this.snackBar.open('Pro uložení karty družiny se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
    }
  }
}
