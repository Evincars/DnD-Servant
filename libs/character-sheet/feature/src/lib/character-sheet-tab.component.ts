import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CharacterSheetComponent } from './character-sheet.component';
import { GroupSheetComponent } from './group-sheet.component';
import { HorseSheetComponent } from './horse-sheet.component';

@Component({
  selector: 'character-sheet-tab',
  template: `
    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
      <mat-tab label="Karta postavy"><character-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Karta družiny"><group-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Parťák"><horse-sheet /></mat-tab>
    </mat-tab-group>
  `,
  styles: `
    ::ng-deep .mat-mdc-tab-labels {
      user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabGroup, MatTab, CharacterSheetComponent, GroupSheetComponent, HorseSheetComponent],
})
export class CharacterSheetTabComponent {}
