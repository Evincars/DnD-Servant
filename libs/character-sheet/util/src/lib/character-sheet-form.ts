import { FormControl, FormGroup } from '@angular/forms';
import { ExtractFormData } from '@dn-d-servant/util';

export type CharacterSheetFormData = ExtractFormData<CharacterSheetForm>;

export type CharacterSheetForm = {
  topInfo: FormGroup<TopInfoForm>;
};

export type TopInfoForm = {
  rasa: FormControl<string | undefined>;
  povolani: FormControl<string | undefined>;
  zazemi: FormControl<string | undefined>;
  presvedceni: FormControl<string | undefined>;
  jmenoPostavy: FormControl<string | undefined>;
  uroven: FormControl<string | undefined>;
  zkusenosti: FormControl<string | undefined>;
  hrac: FormControl<string | undefined>;
};

export type CharacterSheetApiModel = {
  username: string;
  topInfo: {
    rasa?: string;
    povolani?: string;
    zazemi?: string;
    presvedceni?: string;
    jmenoPostavy?: string;
    uroven?: string;
    zkusenosti?: string;
    hrac?: string;
  };
};
