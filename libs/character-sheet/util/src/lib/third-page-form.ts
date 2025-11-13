import { FormControl, FormGroup } from '@angular/forms';

export type ThirdPageForm = {
  topInfoForSpellSheet: FormGroup<TopInfoForSpellSheetForm>;
  professionForm: FormGroup<ProfessionForm>;
  spellsForm: FormGroup<SpellsForm>;
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

export type ProfessionForm = {
  prvniPovolaniSesilatelskePovolani: FormControl<string | undefined>;
  prvniPovolaniUroven: FormControl<string | undefined>;
  prvniPovolaniMaxStupenKouzel: FormControl<string | undefined>;
  prvniPovolaniSesilaciVlastnost: FormControl<string | undefined>;
  prvniPovolaniSOZachrany: FormControl<string | undefined>;
  prvniPovolaniUtocnyBonus: FormControl<string | undefined>;

  druhePovolaniSesilatelskePovolani: FormControl<string | undefined>;
  druhePovolaniUroven: FormControl<string | undefined>;
  druhePovolaniMaxStupenKouzel: FormControl<string | undefined>;
  druhePovolaniSesilaciVlastnost: FormControl<string | undefined>;
  druhePovolaniSOZachrany: FormControl<string | undefined>;
  druhePovolaniUtocnyBonus: FormControl<string | undefined>;
};

export type SpellsForm = {
  r1P: FormControl<string | undefined>;
  r1S: FormControl<string | undefined>;
  r1Nazev: FormControl<string | undefined>;
  r1Utok: FormControl<string | undefined>;
  r1DobaSesilani: FormControl<string | undefined>;
  r1Slozky: FormControl<string | undefined>;
  r1Dosah: FormControl<string | undefined>;
  r1Trvani: FormControl<string | undefined>;
  r1Poznamka: FormControl<string | undefined>;
  r1Str: FormControl<string | undefined>;

  r2P: FormControl<string | undefined>;
  r2S: FormControl<string | undefined>;
  r2Nazev: FormControl<string | undefined>;
  r2Utok: FormControl<string | undefined>;
  r2DobaSesilani: FormControl<string | undefined>;
  r2Slozky: FormControl<string | undefined>;
  r2Dosah: FormControl<string | undefined>;
  r2Trvani: FormControl<string | undefined>;
  r2Poznamka: FormControl<string | undefined>;
  r2Str: FormControl<string | undefined>;

  r3P: FormControl<string | undefined>;
  r3S: FormControl<string | undefined>;
  r3Nazev: FormControl<string | undefined>;
  r3Utok: FormControl<string | undefined>;
  r3DobaSesilani: FormControl<string | undefined>;
  r3Slozky: FormControl<string | undefined>;
  r3Dosah: FormControl<string | undefined>;
  r3Trvani: FormControl<string | undefined>;
  r3Poznamka: FormControl<string | undefined>;
  r3Str: FormControl<string | undefined>;

  r4P: FormControl<string | undefined>;
  r4S: FormControl<string | undefined>;
  r4Nazev: FormControl<string | undefined>;
  r4Utok: FormControl<string | undefined>;
  r4DobaSesilani: FormControl<string | undefined>;
  r4Slozky: FormControl<string | undefined>;
  r4Dosah: FormControl<string | undefined>;
  r4Trvani: FormControl<string | undefined>;
  r4Poznamka: FormControl<string | undefined>;
  r4Str: FormControl<string | undefined>;

  r5P: FormControl<string | undefined>;
  r5S: FormControl<string | undefined>;
  r5Nazev: FormControl<string | undefined>;
  r5Utok: FormControl<string | undefined>;
  r5DobaSesilani: FormControl<string | undefined>;
  r5Slozky: FormControl<string | undefined>;
  r5Dosah: FormControl<string | undefined>;
  r5Trvani: FormControl<string | undefined>;
  r5Poznamka: FormControl<string | undefined>;
  r5Str: FormControl<string | undefined>;

  r6P: FormControl<string | undefined>;
  r6S: FormControl<string | undefined>;
  r6Nazev: FormControl<string | undefined>;
  r6Utok: FormControl<string | undefined>;
  r6DobaSesilani: FormControl<string | undefined>;
  r6Slozky: FormControl<string | undefined>;
  r6Dosah: FormControl<string | undefined>;
  r6Trvani: FormControl<string | undefined>;
  r6Poznamka: FormControl<string | undefined>;
  r6Str: FormControl<string | undefined>;

  r7P: FormControl<string | undefined>;
  r7S: FormControl<string | undefined>;
  r7Nazev: FormControl<string | undefined>;
  r7Utok: FormControl<string | undefined>;
  r7DobaSesilani: FormControl<string | undefined>;
  r7Slozky: FormControl<string | undefined>;
  r7Dosah: FormControl<string | undefined>;
  r7Trvani: FormControl<string | undefined>;
  r7Poznamka: FormControl<string | undefined>;
  r7Str: FormControl<string | undefined>;

  r8P: FormControl<string | undefined>;
  r8S: FormControl<string | undefined>;
  r8Nazev: FormControl<string | undefined>;
  r8Utok: FormControl<string | undefined>;
  r8DobaSesilani: FormControl<string | undefined>;
  r8Slozky: FormControl<string | undefined>;
  r8Dosah: FormControl<string | undefined>;
  r8Trvani: FormControl<string | undefined>;
  r8Poznamka: FormControl<string | undefined>;
  r8Str: FormControl<string | undefined>;

  r9P: FormControl<string | undefined>;
  r9S: FormControl<string | undefined>;
  r9Nazev: FormControl<string | undefined>;
  r9Utok: FormControl<string | undefined>;
  r9DobaSesilani: FormControl<string | undefined>;
  r9Slozky: FormControl<string | undefined>;
  r9Dosah: FormControl<string | undefined>;
  r9Trvani: FormControl<string | undefined>;
  r9Poznamka: FormControl<string | undefined>;
  r9Str: FormControl<string | undefined>;

  r10P: FormControl<string | undefined>;
  r10S: FormControl<string | undefined>;
  r10Nazev: FormControl<string | undefined>;
  r10Utok: FormControl<string | undefined>;
  r10DobaSesilani: FormControl<string | undefined>;
  r10Slozky: FormControl<string | undefined>;
  r10Dosah: FormControl<string | undefined>;
  r10Trvani: FormControl<string | undefined>;
  r10Poznamka: FormControl<string | undefined>;
  r10Str: FormControl<string | undefined>;
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
  professionForm: {
    prvniPovolaniSesilatelskePovolani: string;
    prvniPovolaniUroven: string;
    prvniPovolaniMaxStupenKouzel: string;
    prvniPovolaniSesilaciVlastnost: string;
    prvniPovolaniSOZachrany: string;
    prvniPovolaniUtocnyBonus: string;

    druhePovolaniSesilatelskePovolani: string;
    druhePovolaniUroven: string;
    druhePovolaniMaxStupenKouzel: string;
    druhePovolaniSesilaciVlastnost: string;
    druhePovolaniSOZachrany: string;
    druhePovolaniUtocnyBonus: string;
  };
  spellsForm: {
    r1P: string;
    r1S: string;
    r1Nazev: string;
    r1Utok: string;
    r1DobaSesilani: string;
    r1Slozky: string;
    r1Dosah: string;
    r1Trvani: string;
    r1Poznamka: string;
    r1Str: string;

    r2P: string;
    r2S: string;
    r2Nazev: string;
    r2Utok: string;
    r2DobaSesilani: string;
    r2Slozky: string;
    r2Dosah: string;
    r2Trvani: string;
    r2Poznamka: string;
    r2Str: string;

    r3P: string;
    r3S: string;
    r3Nazev: string;
    r3Utok: string;
    r3DobaSesilani: string;
    r3Slozky: string;
    r3Dosah: string;
    r3Trvani: string;
    r3Poznamka: string;
    r3Str: string;

    r4P: string;
    r4S: string;
    r4Nazev: string;
    r4Utok: string;
    r4DobaSesilani: string;
    r4Slozky: string;
    r4Dosah: string;
    r4Trvani: string;
    r4Poznamka: string;
    r4Str: string;

    r5P: string;
    r5S: string;
    r5Nazev: string;
    r5Utok: string;
    r5DobaSesilani: string;
    r5Slozky: string;
    r5Dosah: string;
    r5Trvani: string;
    r5Poznamka: string;
    r5Str: string;

    r6P: string;
    r6S: string;
    r6Nazev: string;
    r6Utok: string;
    r6DobaSesilani: string;
    r6Slozky: string;
    r6Dosah: string;
    r6Trvani: string;
    r6Poznamka: string;
    r6Str: string;

    r7P: string;
    r7S: string;
    r7Nazev: string;
    r7Utok: string;
    r7DobaSesilani: string;
    r7Slozky: string;
    r7Dosah: string;
    r7Trvani: string;
    r7Poznamka: string;
    r7Str: string;

    r8P: string;
    r8S: string;
    r8Nazev: string;
    r8Utok: string;
    r8DobaSesilani: string;
    r8Slozky: string;
    r8Dosah: string;
    r8Trvani: string;
    r8Poznamka: string;
    r8Str: string;

    r9P: string;
    r9S: string;
    r9Nazev: string;
    r9Utok: string;
    r9DobaSesilani: string;
    r9Slozky: string;
    r9Dosah: string;
    r9Trvani: string;
    r9Poznamka: string;
    r9Str: string;

    r10P: string;
    r10S: string;
    r10Nazev: string;
    r10Utok: string;
    r10DobaSesilani: string;
    r10Slozky: string;
    r10Dosah: string;
    r10Trvani: string;
    r10Poznamka: string;
    r10Str: string;
  };
};
