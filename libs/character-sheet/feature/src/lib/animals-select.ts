export enum AnimalKey {
  kunJezdecky = 'kunJezdecky',
  kunTazny = 'kunTazny',
  kunValecny = 'kunValecny',
  mastif = 'mastif',
  osel = 'osel',
  ponik = 'ponik',
  slon = 'slon',
  velbloud = 'velbloud',
}

export type SelectListOptions = {
  key: AnimalKey;
  value: string;
}

export const animalsSelect: Array<SelectListOptions> = [
  { key: AnimalKey.kunJezdecky, value: 'Kůň (jezdecký) - 12 sáhů' },
  { key: AnimalKey.kunTazny, value: 'Kůň (tažný) - 8 sáhů' },
  { key: AnimalKey.kunValecny, value: 'Kůň (válečný) - 12 sáhů' },
  { key: AnimalKey.mastif, value: 'Mastif - 8 sáhů' },
  { key: AnimalKey.osel, value: 'Osel, mula či mezek - 8 sáhů' },
  { key: AnimalKey.ponik, value: 'Poník - 8 sáhů' },
  { key: AnimalKey.slon, value: 'Slon - 8 sáhů' },
  { key: AnimalKey.velbloud, value: 'Velbloud - 10 sáhů' },
];