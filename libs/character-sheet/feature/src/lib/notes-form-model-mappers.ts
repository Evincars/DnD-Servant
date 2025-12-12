import { FormMapper } from '@dn-d-servant/util';
import {
  GroupSheetApiModel,
  GroupSheetFormData,
  NotesPageApiModel,
  NotesPageFormData
} from "@dn-d-servant/character-sheet-util";

export class NotesFormModelMappers {
  static notesFormToApiMapper: FormMapper<NotesPageFormData, NotesPageApiModel> = {
    twoWayBindings: {
      notesColumn1: 'notesColumn1',
      notesColumn2: 'notesColumn2',
    },
  };
}
