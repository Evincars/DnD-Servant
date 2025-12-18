import { FormControl, FormGroup } from '@angular/forms';

export type SecondPageForm = {
  headerInfo: FormGroup<HeaderInfoForm>;
  lookAndFeelForm: FormGroup<LookAndFeelForm>;
  vztahy: FormControl<string | undefined>;
  dalsiPoznamky1: FormControl<string | undefined>;
  dalsiPoznamky2: FormControl<string | undefined>;
  obrazekPostavy: FormControl<FormData | null>;
};

export type HeaderInfoForm = {
  jmenoPostavy: FormControl<string | undefined>;
  titulyAHodnosti: FormControl<string | undefined>;
};

export type LookAndFeelForm = {
  vek: FormControl<string | undefined>;
  plet: FormControl<string | undefined>;
  vyska: FormControl<string | undefined>;
  vlasy: FormControl<string | undefined>;
  vaha: FormControl<string | undefined>;
  oci: FormControl<string | undefined>;
  postava: FormControl<string | undefined>;
  obleceniAVzezreni: FormControl<string | undefined>;
  dojemAVystupovani: FormControl<string | undefined>;
};

export type SecondPageApiModel = {
  headerInfo: {
    jmenoPostavy: string;
    titulyAHodnosti: string;
  };
  lookAndFeelForm: {
    vek: string;
    plet: string;
    vyska: string;
    vlasy: string;
    vaha: string;
    oci: string;
    postava: string;
    obleceniAVzezreni: string;
    dojemAVystupovani: string;
  };
  vztahy: string;
  dalsiPoznamky1: string;
  dalsiPoznamky2: string;
  obrazekPostavy: string | null;
};
