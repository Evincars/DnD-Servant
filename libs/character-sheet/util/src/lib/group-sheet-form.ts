import {FormControl, FormGroup} from "@angular/forms";
import {ExtractFormData} from "@dn-d-servant/util";

export type GroupSheetFormData = ExtractFormData<GroupSheetForm>;

export type GroupSheetForm = {
  jmenoSkupinovehoZazemi: FormControl<string | undefined>;
  typSkupinovehoZazemi: FormControl<string | undefined>;
  jmenoSkupiny: FormControl<string | undefined>;
  zdatnostPriSkupinovemOvereni: FormControl<string | undefined>;
  zdatnostSPomuckamiAJazyky: FormControl<string | undefined>;
  schopnostSkupinovehoZazemi: FormControl<string | undefined>;
  skupinoveZazemi: FormControl<string | undefined>;
  zvire: FormControl<string | undefined>;
  zvireJmeno: FormControl<string | undefined>;
  penize: FormControl<string | undefined>;
  vybava: FormGroup<GroupInventoryForm>;
}

export type GroupInventoryForm = {
  radek1: FormControl<string | undefined>;
  radek2: FormControl<string | undefined>;
  radek3: FormControl<string | undefined>;
  radek4: FormControl<string | undefined>;
  radek5: FormControl<string | undefined>;
  radek6: FormControl<string | undefined>;
  radek7: FormControl<string | undefined>;
  radek8: FormControl<string | undefined>;
  radek9: FormControl<string | undefined>;
  radek10: FormControl<string | undefined>;
  radek11: FormControl<string | undefined>;
  radek12: FormControl<string | undefined>;
  radek13: FormControl<string | undefined>;
  radek14: FormControl<string | undefined>;
  radek15: FormControl<string | undefined>;

  radek16: FormControl<string | undefined>;
  radek17: FormControl<string | undefined>;
  radek18: FormControl<string | undefined>;
  radek19: FormControl<string | undefined>;
  radek20: FormControl<string | undefined>;
  radek21: FormControl<string | undefined>;
  radek22: FormControl<string | undefined>;
  radek23: FormControl<string | undefined>;
  radek24: FormControl<string | undefined>;
  radek25: FormControl<string | undefined>;
  radek26: FormControl<string | undefined>;
  radek27: FormControl<string | undefined>;
  radek28: FormControl<string | undefined>;
  radek29: FormControl<string | undefined>;
  radek30: FormControl<string | undefined>;

  radek31: FormControl<string | undefined>;
  radek32: FormControl<string | undefined>;
  radek33: FormControl<string | undefined>;
  radek34: FormControl<string | undefined>;
  radek35: FormControl<string | undefined>;
  radek36: FormControl<string | undefined>;
  radek37: FormControl<string | undefined>;
  radek38: FormControl<string | undefined>;
  radek39: FormControl<string | undefined>;
  radek40: FormControl<string | undefined>;
  radek41: FormControl<string | undefined>;
  radek42: FormControl<string | undefined>;
  radek43: FormControl<string | undefined>;
  radek44: FormControl<string | undefined>;
  radek45: FormControl<string | undefined>;
};

export type GroupSheetApiModel = {
  username: string;

  jmenoSkupinovehoZazemi: string;
  typSkupinovehoZazemi: string;
  jmenoSkupiny: string;
  zdatnostPriSkupinovemOvereni: string;
  zdatnostSPomuckamiAJazyky: string;
  schopnostSkupinovehoZazemi: string;
  skupinoveZazemi: string;
  zvire: string;
  zvireJmeno: string;
  penize: string;

  vybava: {
    radek1: string;
    radek2: string;
    radek3: string;
    radek4: string;
    radek5: string;
    radek6: string;
    radek7: string;
    radek8: string;
    radek9: string;
    radek10: string;
    radek11: string;
    radek12: string;
    radek13: string;
    radek14: string;
    radek15: string;

    radek16: string;
    radek17: string;
    radek18: string;
    radek19: string;
    radek20: string;
    radek21: string;
    radek22: string;
    radek23: string;
    radek24: string;
    radek25: string;
    radek26: string;
    radek27: string;
    radek28: string;
    radek29: string;
    radek30: string;

    radek31: string;
    radek32: string;
    radek33: string;
    radek34: string;
    radek35: string;
    radek36: string;
    radek37: string;
    radek38: string;
    radek39: string;
    radek40: string;
    radek41: string;
    radek42: string;
    radek43: string;
    radek44: string;
    radek45: string;
  }
}