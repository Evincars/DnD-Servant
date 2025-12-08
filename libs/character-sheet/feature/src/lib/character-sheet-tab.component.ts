import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CharacterSheetComponent } from './character-sheet.component';

@Component({
  selector: 'character-sheet-tab',
  template: `
    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start" style="font-family: Roboto,serif;">
      <mat-tab label="Karta postavy" style="font-family: Roboto,serif;"><character-sheet class="u-mt-2" /></mat-tab>
      <mat-tab label="Karta družiny">Content 2</mat-tab>
      <mat-tab label="Parťák 1">Content 3</mat-tab>
      <mat-tab label="Parťák 2">Content 3</mat-tab>
      <mat-tab label="Parťák 3">Content 3</mat-tab>
    </mat-tab-group>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabGroup, MatTab, CharacterSheetComponent],
})
export class CharacterSheetTabComponent {}
