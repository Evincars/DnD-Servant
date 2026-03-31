import {FormControl} from "@angular/forms";
import {ExtractFormData} from "@dn-d-servant/util";

export type NotesPageFormData = ExtractFormData<NotesPageForm>;

export type NotesPageForm = {
  notesColumn1: FormControl<string | undefined>
  notesColumn2: FormControl<string | undefined>
  notesColumn3: FormControl<string | undefined>
  notesColumn4: FormControl<string | undefined>
}

export type NotesPageApiModel = {
  username: string,

  notesColumn1: string,
  notesColumn2: string,
  notesColumn3: string,
  notesColumn4: string,
}