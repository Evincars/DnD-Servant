import { FormControl, FormGroup } from '@angular/forms';
import { ExtractFormData } from '@dn-d-servant/util';

export type CharacterSheetFormData = ExtractFormData<CharacterSheetForm>;

export type CharacterSheetForm = {
  topInfo: FormGroup<TopInfoForm>;
  abilityBonus: FormGroup<AbilityBonusForm>;
  speedAndHealingDices: FormGroup<SpeedAndHealingDicesForm>;
  armorClass: FormGroup<ArmorClassForm>;
  infoAboutCharacter: FormControl<string | undefined>;
  savingThrowsForm: FormGroup<SavingThrowsForm>;
  passiveSkillsForm: FormGroup<PassiveSkillsForm>;
  spellsAndAlchemistChestForm: FormGroup<SpellsAndAlchemistChestForm>;
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

export type AbilityBonusForm = {
  zdatnostniBonus: FormControl<string | undefined>;
  inspirace: FormControl<string | undefined>;
  iniciativa: FormControl<string | undefined>;
};

export type SpeedAndHealingDicesForm = {
  lehke: FormControl<string | undefined>;
  stredni: FormControl<string | undefined>;
  tezke: FormControl<string | undefined>;
  pouzitiKostek: FormControl<string | undefined>;
  maxPouzitiKostek: FormControl<string | undefined>;
  smrtUspech1: FormControl<string | undefined>;
  smrtUspech2: FormControl<string | undefined>;
  smrtUspech3: FormControl<string | undefined>;
  smrtNeuspech1: FormControl<string | undefined>;
  smrtNeuspech2: FormControl<string | undefined>;
  smrtNeuspech3: FormControl<string | undefined>;
  maxBoduVydrze: FormControl<string | undefined>;
};

export type ArmorClassForm = {
  zbroj: FormControl<string | undefined>;
  bezeZbroje: FormControl<string | undefined>;
  jine: FormControl<string | undefined>;
  zdatnostLehke: FormControl<string | undefined>;
  zdatnostStredni: FormControl<string | undefined>;
  zdatnostTezke: FormControl<string | undefined>;
  zdatnostStity: FormControl<string | undefined>;
};

export type SavingThrowsForm = {
  silaZdatnost: FormControl<string | undefined>;
  sila: FormControl<string | undefined>;
  obratnostZdatnost: FormControl<string | undefined>;
  obratnost: FormControl<string | undefined>;
  odolnostZdatnost: FormControl<string | undefined>;
  odolnost: FormControl<string | undefined>;
  inteligenceZdatnost: FormControl<string | undefined>;
  inteligence: FormControl<string | undefined>;
  moudrostZdatnost: FormControl<string | undefined>;
  moudrost: FormControl<string | undefined>;
  charismaZdatnost: FormControl<string | undefined>;
  charisma: FormControl<string | undefined>;
};

export type PassiveSkillsForm = {
  atletikaZdatnost: FormControl<string | undefined>;
  atletika: FormControl<string | undefined>;
  akrobacieZdatnost: FormControl<string | undefined>;
  akrobacie: FormControl<string | undefined>;
  nenapadnostZdatnost: FormControl<string | undefined>;
  nenapadnost: FormControl<string | undefined>;
  vhledZdatnost: FormControl<string | undefined>;
  vhled: FormControl<string | undefined>;
  vnimaniZdatnost: FormControl<string | undefined>;
  vnimani: FormControl<string | undefined>;
  jineZdatnost: FormControl<string | undefined>;
  jineNazev: FormControl<string | undefined>;
  jine: FormControl<string | undefined>;
};

export type SpellsAndAlchemistChestForm = {
  vlastnost: FormControl<string | undefined>;
  utBonus: FormControl<string | undefined>;
  soZachrany: FormControl<string | undefined>;
};

export type Main6Skills = {
  silaOprava: FormControl<string | undefined>;
  sila: FormControl<string | undefined>;
  obratnostOprava: FormControl<string | undefined>;
  obratnost: FormControl<string | undefined>;
  odolnostOprava: FormControl<string | undefined>;
  odolnost: FormControl<string | undefined>;
  inteligenceOprava: FormControl<string | undefined>;
  inteligence: FormControl<string | undefined>;
  moudrostOprava: FormControl<string | undefined>;
  moudrost: FormControl<string | undefined>;
  charismaOprava: FormControl<string | undefined>;
  charisma: FormControl<string | undefined>;
};

export type Abilities = {};

// ========== API Model ==========
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
  abilityBonus: {
    zdatnostniBonus: string;
    inspirace: string;
    iniciativa: string;
  };
  speedAndHealingDices: {
    lehke: string;
    stredni: string;
    tezke: string;
    pouzitiKostek: string;
    maxPouzitiKostek: string;
    smrtUspech1: string;
    smrtUspech2: string;
    smrtUspech3: string;
    smrtNeuspech1: string;
    smrtNeuspech2: string;
    smrtNeuspech3: string;
    maxBoduVydrze: string;
  };
  armorClass: {
    zbroj: string;
    bezeZbroje: string;
    jine: string;
    zdatnostLehke: string;
    zdatnostStredni: string;
    zdatnostTezke: string;
    zdatnostStity: string;
  };
  infoAboutCharacter: string;
  savingThrowsForm: {
    silaZdatnost: string;
    sila: string;
    obratnostZdatnost: string;
    obratnost: string;
    odolnostZdatnost: string;
    odolnost: string;
    inteligenceZdatnost: string;
    inteligence: string;
    moudrostZdatnost: string;
    moudrost: string;
    charismaZdatnost: string;
    charisma: string;
  };
  passiveSkillsForm: {
    atletikaZdatnost: string;
    atletika: string;
    akrobacieZdatnost: string;
    akrobacie: string;
    nenapadnostZdatnost: string;
    nenapadnost: string;
    vhledZdatnost: string;
    vhled: string;
    vnimaniZdatnost: string;
    vnimani: string;
    jineZdatnost: string;
    jineNazev: string;
    jine: string;
  };
  spellsAndAlchemistChestForm: {
    vlastnost: string;
    utBonus: string;
    soZachrany: string;
  };
};
