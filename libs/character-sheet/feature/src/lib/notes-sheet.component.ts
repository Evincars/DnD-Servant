import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'notes-sheet',
  template: `
    test
    <form>
    <textarea
        class="field textarea"
        style="top:545.1px; left:834.47px; width:349.77px; height:432px;"
        placeholder="Poznámky..."
    ></textarea>
    </form>
  `,
  styleUrl: 'character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule
  ],
})
export class NotesSheetComponent {}
