import {FormControl} from "@angular/forms";
import {ExtractFormData} from "@dn-d-servant/util";

export type InitiativeTrackerFormData = ExtractFormData<InitiativeTrackerForm>;

export type InitiativeTrackerForm = {
  diceRoll: FormControl<number | undefined>;
  characterName: FormControl<string | undefined>;
  hitPoints: FormControl<number | undefined>;
  armorClass: FormControl<number | undefined>;
}

export type InitiativeTrackerApiModel = {
  diceRoll: number;
  characterName: string;
  hitPoints: number;
  armorClass: number;
}