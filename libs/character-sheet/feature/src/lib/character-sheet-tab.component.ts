import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CharacterSheetComponent } from './character-sheet.component';
import { GroupSheetComponent } from './group-sheet.component';
import { HorseSheetComponent } from './horse-sheet.component';
import {NotesSheetComponent} from "./notes-sheet.component";
import {CharacterSheetStore} from "@dn-d-servant/character-sheet-data-access";
import {InitiativeTrackerComponent} from "./initiative-tracker.component";

@Component({
  selector: 'character-sheet-tab',
  template: `
    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
      <mat-tab label="Karta postavy"><character-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Karta družiny"><group-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Další parťáci"><horse-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Poznámky"><notes-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Iniciativa"><initiative-tracker class="u-mt-2" /></mat-tab>
    </mat-tab-group>
  `,
  styles: `
    ::ng-deep .mat-mdc-tab-labels {
      user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
  `,
  providers: [CharacterSheetStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabGroup, MatTab, CharacterSheetComponent, GroupSheetComponent, HorseSheetComponent, NotesSheetComponent, InitiativeTrackerComponent],
})
export class CharacterSheetTabComponent {}
