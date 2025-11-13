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
  main6SkillsForm: FormGroup<Main6SkillsForm>;
  abilitiesForm: FormGroup<AbilitiesForm>;
  pomucky: FormControl<string | undefined>;
  weaponsForm: FormGroup<WeaponsForm>;
  languagesForm: FormGroup<LanguagesForm>;
  inventoryForm: FormGroup<InventoryForm>;
  spellSlotsForm: FormGroup<SpellSlotsForm>;
  alchemistChestForm: FormGroup<AlchemistChestForm>;
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

export type Main6SkillsForm = {
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

export type AbilitiesForm = {
  // Sila
  atletikaZdatnost: FormControl<string | undefined>;
  atletika: FormControl<string | undefined>;

  // Obratnost
  akrobacieZdatnost: FormControl<string | undefined>;
  akrobacie: FormControl<string | undefined>;
  cachryZdatnost: FormControl<string | undefined>;
  cachry: FormControl<string | undefined>;
  nenapadnostZdatnost: FormControl<string | undefined>;
  nenapadnost: FormControl<string | undefined>;

  // Inteligence
  historieZdatnost: FormControl<string | undefined>;
  historie: FormControl<string | undefined>;
  mystikaZdatnost: FormControl<string | undefined>;
  mystika: FormControl<string | undefined>;
  nabozenstviZdatnost: FormControl<string | undefined>;
  nabozenstvi: FormControl<string | undefined>;
  patraniZdatnost: FormControl<string | undefined>;
  patrani: FormControl<string | undefined>;
  prirodaZdatnost: FormControl<string | undefined>;
  priroda: FormControl<string | undefined>;

  // Moudrost
  lekarstviZdatnost: FormControl<string | undefined>;
  lekarstvi: FormControl<string | undefined>;
  ovladaniZviratZdatnost: FormControl<string | undefined>;
  ovladaniZvirat: FormControl<string | undefined>;
  prezitiZdatnost: FormControl<string | undefined>;
  preziti: FormControl<string | undefined>;
  vhledZdatnost: FormControl<string | undefined>;
  vhled: FormControl<string | undefined>;
  vnimaniZdatnost: FormControl<string | undefined>;
  vnimani: FormControl<string | undefined>;

  // Charisma
  klamaniZdatnost: FormControl<string | undefined>;
  klamani: FormControl<string | undefined>;
  presvedcovaniZdatnost: FormControl<string | undefined>;
  presvedcovani: FormControl<string | undefined>;
  vystupovaniZdatnost: FormControl<string | undefined>;
  vystupovani: FormControl<string | undefined>;
  zastrasovaniZdatnost: FormControl<string | undefined>;
  zastrasovani: FormControl<string | undefined>;
};

export type WeaponsForm = {
  zbran1: FormControl<string | undefined>;
  zbran1Bonus: FormControl<string | undefined>;
  zbran1Zasah: FormControl<string | undefined>;
  zbran1Typ: FormControl<string | undefined>;
  zbran1Dosah: FormControl<string | undefined>;
  zbran1Oc: FormControl<string | undefined>;

  zbran2: FormControl<string | undefined>;
  zbran2Bonus: FormControl<string | undefined>;
  zbran2Zasah: FormControl<string | undefined>;
  zbran2Typ: FormControl<string | undefined>;
  zbran2Dosah: FormControl<string | undefined>;
  zbran2Oc: FormControl<string | undefined>;

  zbran3: FormControl<string | undefined>;
  zbran3Bonus: FormControl<string | undefined>;
  zbran3Zasah: FormControl<string | undefined>;
  zbran3Typ: FormControl<string | undefined>;
  zbran3Dosah: FormControl<string | undefined>;
  zbran3Oc: FormControl<string | undefined>;

  zbran4: FormControl<string | undefined>;
  zbran4Bonus: FormControl<string | undefined>;
  zbran4Zasah: FormControl<string | undefined>;
  zbran4Typ: FormControl<string | undefined>;
  zbran4Dosah: FormControl<string | undefined>;
  zbran4Oc: FormControl<string | undefined>;

  zbran5: FormControl<string | undefined>;
  zbran5Bonus: FormControl<string | undefined>;
  zbran5Zasah: FormControl<string | undefined>;
  zbran5Typ: FormControl<string | undefined>;
  zbran5Dosah: FormControl<string | undefined>;
  zbran5Oc: FormControl<string | undefined>;

  zdatnostJednoduche: FormControl<string | undefined>;
  zdatnostValecne: FormControl<string | undefined>;
  dalsiZdatnosti: FormControl<string | undefined>;
};

export type LanguagesForm = {
  jazyky: FormControl<string | undefined>;
  schopnosti: FormControl<string | undefined>;
};

export type InventoryForm = {
  penize: FormControl<string | undefined>;

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
};

export type SpellSlotsForm = {
  urovenSesilatele: FormControl<string | undefined>;
  urovenCernokneznika: FormControl<string | undefined>;

  level1Slot1: FormControl<string | undefined>;
  level1Slot2: FormControl<string | undefined>;
  level1Slot3: FormControl<string | undefined>;
  level1Slot4: FormControl<string | undefined>;

  level2Slot1: FormControl<string | undefined>;
  level2Slot2: FormControl<string | undefined>;
  level2Slot3: FormControl<string | undefined>;
  level2Slot4: FormControl<string | undefined>;

  level3Slot1: FormControl<string | undefined>;
  level3Slot2: FormControl<string | undefined>;
  level3Slot3: FormControl<string | undefined>;
  level3Slot4: FormControl<string | undefined>;

  level4Slot1: FormControl<string | undefined>;
  level4Slot2: FormControl<string | undefined>;
  level4Slot3: FormControl<string | undefined>;
  level4Slot4: FormControl<string | undefined>;

  level5Slot1: FormControl<string | undefined>;
  level5Slot2: FormControl<string | undefined>;
  level5Slot3: FormControl<string | undefined>;
  level5Slot4: FormControl<string | undefined>;

  level6Slot1: FormControl<string | undefined>;
  level6Slot2: FormControl<string | undefined>;

  level7Slot1: FormControl<string | undefined>;
  level7Slot2: FormControl<string | undefined>;

  level8Slot1: FormControl<string | undefined>;

  level9Slot1: FormControl<string | undefined>;
};

export type AlchemistChestForm = {
  urovenAlchymisty: FormControl<string | undefined>;

  chestUsage1: FormControl<string | undefined>;
  chestUsage2: FormControl<string | undefined>;
  chestUsage3: FormControl<string | undefined>;
  chestUsage4: FormControl<string | undefined>;
  chestUsage5: FormControl<string | undefined>;
  chestUsage6: FormControl<string | undefined>;
  chestUsage7: FormControl<string | undefined>;
  chestUsage8: FormControl<string | undefined>;
  chestUsage9: FormControl<string | undefined>;
  chestUsage10: FormControl<string | undefined>;
  chestUsage11: FormControl<string | undefined>;
  chestUsage12: FormControl<string | undefined>;
  chestUsage13: FormControl<string | undefined>;
  chestUsage14: FormControl<string | undefined>;
  chestUsage15: FormControl<string | undefined>;
  chestUsage16: FormControl<string | undefined>;
  chestUsage17: FormControl<string | undefined>;
  chestUsage18: FormControl<string | undefined>;
  chestUsage19: FormControl<string | undefined>;
  chestUsage20: FormControl<string | undefined>;
};

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
  main6SkillsForm: {
    silaOprava: string;
    sila: string;
    obratnostOprava: string;
    obratnost: string;
    odolnostOprava: string;
    odolnost: string;
    inteligenceOprava: string;
    inteligence: string;
    moudrostOprava: string;
    moudrost: string;
    charismaOprava: string;
    charisma: string;
  };
  abilitiesForm: {
    // Sila
    atletikaZdatnost: string;
    atletika: string;

    // Obratnost
    akrobacieZdatnost: string;
    akrobacie: string;
    cachryZdatnost: string;
    cachry: string;
    nenapadnostZdatnost: string;
    nenapadnost: string;

    // Inteligence
    historieZdatnost: string;
    historie: string;
    mystikaZdatnost: string;
    mystika: string;
    nabozenstviZdatnost: string;
    nabozenstvi: string;
    patraniZdatnost: string;
    patrani: string;
    prirodaZdatnost: string;
    priroda: string;

    // Moudrost
    lekarstviZdatnost: string;
    lekarstvi: string;
    ovladaniZviratZdatnost: string;
    ovladaniZvirat: string;
    prezitiZdatnost: string;
    preziti: string;
    vhledZdatnost: string;
    vhled: string;
    vnimaniZdatnost: string;
    vnimani: string;

    // Charisma
    klamaniZdatnost: string;
    klamani: string;
    presvedcovaniZdatnost: string;
    presvedcovani: string;
    vystupovaniZdatnost: string;
    vystupovani: string;
    zastrasovaniZdatnost: string;
    zastrasovani: string;
  };
  pomucky: string | undefined;
  weaponsForm: {
    zbran1: string;
    zbran1Bonus: string;
    zbran1Zasah: string;
    zbran1Typ: string;
    zbran1Dosah: string;
    zbran1Oc: string;

    zbran2: string;
    zbran2Bonus: string;
    zbran2Zasah: string;
    zbran2Typ: string;
    zbran2Dosah: string;
    zbran2Oc: string;

    zbran3: string;
    zbran3Bonus: string;
    zbran3Zasah: string;
    zbran3Typ: string;
    zbran3Dosah: string;
    zbran3Oc: string;

    zbran4: string;
    zbran4Bonus: string;
    zbran4Zasah: string;
    zbran4Typ: string;
    zbran4Dosah: string;
    zbran4Oc: string;

    zbran5: string;
    zbran5Bonus: string;
    zbran5Zasah: string;
    zbran5Typ: string;
    zbran5Dosah: string;
    zbran5Oc: string;

    zdatnostJednoduche: string;
    zdatnostValecne: string;
    dalsiZdatnosti: string;
  };
  languagesForm: {
    jazyky: string;
    schopnosti: string;
  };
  inventoryForm: {
    penize: string;

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
  };
  spellSlotsForm: {
    urovenSesilatele: string;
    urovenCernokneznika: string;

    level1Slot1: string;
    level1Slot2: string;
    level1Slot3: string;
    level1Slot4: string;

    level2Slot1: string;
    level2Slot2: string;
    level2Slot3: string;
    level2Slot4: string;

    level3Slot1: string;
    level3Slot2: string;
    level3Slot3: string;
    level3Slot4: string;

    level4Slot1: string;
    level4Slot2: string;
    level4Slot3: string;
    level4Slot4: string;

    level5Slot1: string;
    level5Slot2: string;
    level5Slot3: string;
    level5Slot4: string;

    level6Slot1: string;
    level6Slot2: string;

    level7Slot1: string;
    level7Slot2: string;

    level8Slot1: string;

    level9Slot1: string;
  };
  alchemistChestForm: {
    urovenAlchymisty: string;

    chestUsage1: string;
    chestUsage2: string;
    chestUsage3: string;
    chestUsage4: string;
    chestUsage5: string;
    chestUsage6: string;
    chestUsage7: string;
    chestUsage8: string;
    chestUsage9: string;
    chestUsage10: string;
    chestUsage11: string;
    chestUsage12: string;
    chestUsage13: string;
    chestUsage14: string;
    chestUsage15: string;
    chestUsage16: string;
    chestUsage17: string;
    chestUsage18: string;
    chestUsage19: string;
    chestUsage20: string;
  };
};
