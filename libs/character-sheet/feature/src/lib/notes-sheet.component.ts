import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NotesPageForm, RichTextareaComponent } from '@dn-d-servant/character-sheet-util';
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access';
import { AuthService, FormUtil } from '@dn-d-servant/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotesFormModelMappers } from './notes-form-model-mappers';

@Component({
  selector: 'notes-sheet',
  template: `
    <form [formGroup]="form">
      <rich-textarea
        [formControl]="controls.notesColumn1"
        class="field textarea"
        style="top:43px; left:0; width:650px; height:990px; background: rgb(248, 246, 237)"
      ></rich-textarea>
      <rich-textarea
        [formControl]="controls.notesColumn2"
        class="field textarea"
        style="top:43px; left:660px; width:650px; height:990px; background: rgb(248, 246, 237)"
      ></rich-textarea>

      <button (click)="onSaveClick()" type="submit" class="field button" style="top:4px; left:1200px; width:110px;">
        Uložit
      </button>
    </form>
  `,
  styleUrl: 'character-sheet.component.scss',
  styles: `
    :host {
      height: 1050px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RichTextareaComponent],
})
export class NotesSheetComponent {
  characterSheetStore = inject(CharacterSheetStore);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  snackBar = inject(MatSnackBar);

  private readonly documentName = '_notes';

  fb = new FormBuilder().nonNullable;
  form = this.fb.group<NotesPageForm>({
    notesColumn1: this.fb.control(''),
    notesColumn2: this.fb.control(''),
  });

  get controls() {
    return this.form.controls;
  }

  constructor() {
    const checkForUsername = effect(() => {
      const username = this.authService.currentUser()?.username;

      untracked(() => {
        if (username) {
          this.characterSheetStore.getNotesPageByUsername(`${username}${this.documentName}`);
        }
      });
    });

    const fetchedNotesPage = effect(() => {
      const notesPage = this.characterSheetStore.notesPage();

      untracked(() => {
        if (notesPage) {
          const formValue = FormUtil.convertModelToForm(notesPage, NotesFormModelMappers.notesFormToApiMapper);
          this.form.patchValue(formValue);
        }
      });
    });
  }

  onSaveClick() {
    const username = this.authService.currentUser()?.username;
    if (username) {
      const request = FormUtil.convertFormToModel(this.form.getRawValue(), NotesFormModelMappers.notesFormToApiMapper);
      request.username = `${username}${this.documentName}`;

      this.characterSheetStore.saveNotesPage(request);
    } else {
      this.snackBar.open('Pro uložení poznámek se musíte přihlásit.', 'Zavřít', { verticalPosition: 'top', duration: 4000 });
    }
  }
}
