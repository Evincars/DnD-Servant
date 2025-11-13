import { FormControl, FormGroup } from '@angular/forms';

export type ThirdPageForm = {
  topInfoForSpellSheet: FormGroup<TopInfoForSpellSheetForm>;
};

export type TopInfoForSpellSheetForm = {
  jmenoPostavy: FormControl<string | undefined>;
  stupenPozic: FormControl<string | undefined>;
  checkbox1: FormControl<string | undefined>;
  checkbox2: FormControl<string | undefined>;
  checkbox3: FormControl<string | undefined>;
  checkbox4: FormControl<string | undefined>;
  mystickyTaj: FormControl<string | undefined>;
  mystickyTajCheckbox1: FormControl<string | undefined>;
  mystickyTajCheckbox2: FormControl<string | undefined>;
  mystickyTajCheckbox3: FormControl<string | undefined>;
  mystickyTajCheckbox4: FormControl<string | undefined>;
};

export type ThirdPageApiModel = {
  topInfoForSpellSheet: {
    jmenoPostavy: string;
    stupenPozic: string;
    checkbox1: string;
    checkbox2: string;
    checkbox3: string;
    checkbox4: string;
    mystickyTaj: string;
    mystickyTajCheckbox1: string;
    mystickyTajCheckbox2: string;
    mystickyTajCheckbox3: string;
    mystickyTajCheckbox4: string;
  };
};
