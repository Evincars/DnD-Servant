import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DiceRollerService } from '@dn-d-servant/ui';

// ── Data model ──────────────────────────────────────────────────────────────

type PotionCategory = 'vse' | 'leceni' | 'boj' | 'pohyb' | 'mysl' | 'jedy' | 'ostatni';
type Rarity = 'Běžný' | 'Neobvyklý' | 'Vzácný' | 'Velmi vzácný' | 'Legendární';
type RarityFilter = 'vse' | 'Běžný' | 'Neobvyklý' | 'Vzácný' | 'Velmi vzácný' | 'Legendární';

/** Hex color of the liquid inside the potion bottle SVG */
type PotionColor = string;

interface Ingredient {
  name: string;
  price: number;
}

interface Potion {
  name: string;
  effect: string;
  category: PotionCategory;
  rarity: Rarity;
  ingredients: Ingredient[];
  priceBuy: string;
  priceCraft: string;
  craftTime: string;
  color: PotionColor;
}

// ── Helper: distribute total price among N ingredients with slight randomness ─
function distributePrices(total: number, count: number, seed: number): number[] {
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    const h = ((seed * 31 + i * 17 + 7) % 100) / 100;
    weights.push(0.7 + h * 0.6);
  }
  const wSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / wSum) * total);
  const rounded = raw.map(v => {
    if (total >= 1000) return Math.round(v / 10) * 10;
    if (total >= 100) return Math.round(v / 5) * 5;
    return Math.round(v);
  });
  const diff = total - rounded.reduce((a, b) => a + b, 0);
  rounded[0] += diff;
  return rounded;
}

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function ing(names: string[], craftTotal: number, potionName: string): Ingredient[] {
  const prices = distributePrices(craftTotal, names.length, strHash(potionName));
  return names.map((name, i) => ({ name, price: prices[i] }));
}

/** Normalize string for diacritics-insensitive search */
function normSearch(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

// ── Potion color palette (by type/effect) ───────────────────────────────────
const C = {
  red: '#e84040',
  crimson: '#c02040',
  pink: '#e86088',
  orange: '#e88030',
  gold: '#d4a020',
  yellow: '#e8d040',
  green: '#40c860',
  teal: '#30b8a0',
  cyan: '#40c8e8',
  blue: '#4080e8',
  indigo: '#5040d8',
  purple: '#9040d8',
  violet: '#b040e8',
  white: '#e8e0d0',
  silver: '#b0b8c8',
  black: '#282030',
  brown: '#8a5030',
};

const POTIONS: Potion[] = [
  // ─── LÉČENÍ ───────────────────────────────────────────
  {
    name: 'Lektvar léčení',
    effect: 'Obnoví 2k4+2 HP',
    category: 'leceni',
    rarity: 'Běžný',
    ingredients: ing(['Červená jetelina (bylina, louky)', 'Včelí med (obchod / úl)', 'Čistá pramenitá voda'], 38, 'Lektvar léčení'),
    priceBuy: '50 zl',
    priceCraft: '38 zl',
    craftTime: '2 hodiny',
    color: C.red,
  },
  {
    name: 'Lektvar většího léčení',
    effect: 'Obnoví 4k4+4 HP',
    category: 'leceni',
    rarity: 'Běžný',
    ingredients: ing(['Solný květ (skalní bylina)', 'Trollí krev (z trola)', 'Zlatý mech (les, SO 13)'], 75, 'Lektvar většího léčení'),
    priceBuy: '100 zl',
    priceCraft: '75 zl',
    craftTime: '4 hodiny',
    color: C.crimson,
  },
  {
    name: 'Lektvar vynikajícího léčení',
    effect: 'Obnoví 8k4+8 HP',
    category: 'leceni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Fénixí pero (z fénixe / obchod)', 'Stříbrná kapradina (SO 15)', 'Roztavený jantar (minerál)'], 380, 'Lektvar vynikajícího léčení'),
    priceBuy: '500 zl',
    priceCraft: '380 zl',
    craftTime: '1 den',
    color: C.crimson,
  },
  {
    name: 'Lektvar nejvyššího léčení',
    effect: 'Obnoví 10k4+20 HP',
    category: 'leceni',
    rarity: 'Vzácný',
    ingredients: ing(['Dračí žluč (z draka)', 'Měsíční orchidej (SO 18, noc úplňku)', 'Prach z unicorn rohu'], 3800, 'Lektvar nejvyššího léčení'),
    priceBuy: '5 000 zl',
    priceCraft: '3 800 zl',
    craftTime: '3 dny',
    color: C.crimson,
  },
  {
    name: 'Lektvar proti jedu',
    effect: 'Vyléčí Otrávení, imunita 1 hod.',
    category: 'leceni',
    rarity: 'Běžný',
    ingredients: ing(['Bílý bez (bylina, okraje lesů)', 'Hadí svlak (z hada)', 'Citrónová šťáva'], 75, 'Lektvar proti jedu'),
    priceBuy: '100 zl',
    priceCraft: '75 zl',
    craftTime: '3 hodiny',
    color: C.green,
  },
  {
    name: 'Lektvar zotavení',
    effect: 'Odstraní jednu nemoc nebo stav',
    category: 'leceni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Světluška (chycená za úsvitu)', 'Krev kněze (dobrovolná, 1k4 HP)', 'Šafrán (vzácné koření)'], 230, 'Lektvar zotavení'),
    priceBuy: '300 zl',
    priceCraft: '230 zl',
    craftTime: '8 hodin',
    color: C.gold,
  },
  {
    name: 'Lektvar regenerace',
    effect: 'Obnovuje 1 HP/kolo po 1 minutu (10 HP celkem)',
    category: 'leceni',
    rarity: 'Vzácný',
    ingredients: ing(['Trollí srdce (z trola, čerstvé)', 'Salamandří olej (z ohnivého salamandra)', 'Diamantový prach (50 zl)'], 1500, 'Lektvar regenerace'),
    priceBuy: '2 000 zl',
    priceCraft: '1 500 zl',
    craftTime: '2 dny',
    color: C.pink,
  },
  // ─── BOJ ──────────────────────────────────────────────
  {
    name: 'Lektvar síly obra',
    effect: 'Síla 21 po 1 hodinu',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ing(['Obrova kost (prach z kosti obra)', 'Železný kořen (SO 14, hory)', 'Červené víno (staré, min. 10 let)'], 380, 'Lektvar síly obra'),
    priceBuy: '500 zl',
    priceCraft: '380 zl',
    craftTime: '1 den',
    color: C.brown,
  },
  {
    name: 'Lektvar síly kopcového obra',
    effect: 'Síla 21 po 1 hodinu',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ing(['Kopcový kořen (SO 14)', 'Obrova svalovina (kopcový obr)', 'Kamenný prach'], 380, 'Lektvar síly kopcového obra'),
    priceBuy: '500 zl',
    priceCraft: '380 zl',
    craftTime: '1 den',
    color: C.brown,
  },
  {
    name: 'Lektvar síly ledového obra',
    effect: 'Síla 23 po 1 hodinu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ing(['Srdce ledového obra', 'Ledovcový krystal (SO 16)', 'Medvědí tuk (polární medvěd)'], 1500, 'Lektvar síly ledového obra'),
    priceBuy: '2 000 zl',
    priceCraft: '1 500 zl',
    craftTime: '2 dny',
    color: C.cyan,
  },
  {
    name: 'Lektvar síly ohnivého obra',
    effect: 'Síla 25 po 1 hodinu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ing(['Popel ohnivého obra', 'Magmatický kořen (SO 17, vulkán)', 'Obsidiánový prach (minerál)'], 2300, 'Lektvar síly ohnivého obra'),
    priceBuy: '3 000 zl',
    priceCraft: '2 300 zl',
    craftTime: '3 dny',
    color: C.orange,
  },
  {
    name: 'Lektvar odolnosti',
    effect: 'Odolnost vůči jednomu typu poškození 1 hod.',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ing(['Šupina draka (odpovídá typu)', 'Kouřový kámen (minerál)', 'Popel z hromového dubu'], 300, 'Lektvar odolnosti'),
    priceBuy: '400 zl',
    priceCraft: '300 zl',
    craftTime: '8 hodin',
    color: C.silver,
  },
  {
    name: 'Lektvar hrdinství',
    effect: '10 dočasných HP + Inspirace po 1 hod.',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ing(['Lví srdce (ze lva)', 'Červená rulíková semena (SO 14)', 'Jiskřivý pyrit (minerál)'], 155, 'Lektvar hrdinství'),
    priceBuy: '200 zl',
    priceCraft: '155 zl',
    craftTime: '6 hodin',
    color: C.gold,
  },
  {
    name: 'Lektvar rychlosti',
    effect: 'Jako kouzlo Haste po 1 minutu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ing(['Gepardí pazneht (z geparda)', 'Blesková kapradina (SO 16, bouřka)', 'Rtuť (minerál, nebezpečná)'], 1500, 'Lektvar rychlosti'),
    priceBuy: '2 000 zl',
    priceCraft: '1 500 zl',
    craftTime: '2 dny',
    color: C.yellow,
  },
  {
    name: 'Lektvar neviditelnosti',
    effect: 'Neviditelnost po 1 hodinu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ing(['Oko mimika (z mimika)', 'Stínový mech (SO 15, tmavé jeskyně)', 'Destilovaný alkohol (90%+)'], 1500, 'Lektvar neviditelnosti'),
    priceBuy: '2 000 zl',
    priceCraft: '1 500 zl',
    craftTime: '2 dny',
    color: C.white,
  },
  {
    name: 'Lektvar nezranitelnosti',
    effect: 'Odolnost vůči VŠEM typům poškození 1 min.',
    category: 'boj',
    rarity: 'Velmi vzácný',
    ingredients: ing(['Krev tarraska (z tarraska)', 'Adamantinový prach (50 zl)', 'Srdce goléma (z goléma)'], 7500, 'Lektvar nezranitelnosti'),
    priceBuy: '10 000 zl',
    priceCraft: '7 500 zl',
    craftTime: '7 dní',
    color: C.silver,
  },
  {
    name: 'Olej ostření',
    effect: 'Zbraň má +3 k zásahu a poškození na 1 hod.',
    category: 'boj',
    rarity: 'Velmi vzácný',
    ingredients: ing(['Prach z briliantu (500 zl)', 'Krev pláštníka (z pláštníka)', 'Éterická esence (SO 18)'], 6200, 'Olej ostření'),
    priceBuy: '8 000 zl',
    priceCraft: '6 200 zl',
    craftTime: '5 dní',
    color: C.indigo,
  },
  // ─── POHYB ────────────────────────────────────────────
  {
    name: 'Lektvar šplhání',
    effect: 'Rychlost šplhání = rychlost pohybu, 1 hod.',
    category: 'pohyb',
    rarity: 'Běžný',
    ingredients: ing(['Pavučina (z velkého pavouka)', 'Pryskyřice břízy', 'Mátový olej'], 55, 'Lektvar šplhání'),
    priceBuy: '75 zl',
    priceCraft: '55 zl',
    craftTime: '2 hodiny',
    color: C.teal,
  },
  {
    name: 'Lektvar vodního dechu',
    effect: 'Dýchání pod vodou po 1 hod.',
    category: 'pohyb',
    rarity: 'Běžný',
    ingredients: ing(['Rybí žábry (z velké ryby)', 'Říční řasa (SO 11)', 'Perleťový prach (z ústřice)'], 55, 'Lektvar vodního dechu'),
    priceBuy: '75 zl',
    priceCraft: '55 zl',
    craftTime: '2 hodiny',
    color: C.blue,
  },
  {
    name: 'Lektvar levitace',
    effect: 'Levitace po 10 minut',
    category: 'pohyb',
    rarity: 'Neobvyklý',
    ingredients: ing(['Peří gryfa (z gryfa)', 'Vzdušný křemen (minerál, hory)', 'Destilát oblačnice (SO 15)'], 310, 'Lektvar levitace'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '8 hodin',
    color: C.white,
  },
  {
    name: 'Lektvar létání',
    effect: 'Rychlost letu 18 m po 1 hod.',
    category: 'pohyb',
    rarity: 'Vzácný',
    ingredients: ing(['Pegasovo pero (z pegase)', 'Oblačný jantar (SO 17, bouřka)', 'Destilovaný vítr (magický proces)'], 2300, 'Lektvar létání'),
    priceBuy: '3 000 zl',
    priceCraft: '2 300 zl',
    craftTime: '2 dny',
    color: C.cyan,
  },
  {
    name: 'Lektvar éteričnosti',
    effect: 'Přechod do Éterické sféry na 1 hod.',
    category: 'pohyb',
    rarity: 'Vzácný',
    ingredients: ing(['Éterická mlha (SO 17, místo s portálem)', 'Perla fázového pavouka', 'Duševní křišťál (minerál)'], 3100, 'Lektvar éteričnosti'),
    priceBuy: '4 000 zl',
    priceCraft: '3 100 zl',
    craftTime: '3 dny',
    color: C.violet,
  },
  {
    name: 'Lektvar plazivosti',
    effect: 'Svobodný pohyb po zdech a stropě na 1 hod.',
    category: 'pohyb',
    rarity: 'Neobvyklý',
    ingredients: ing(['Gekoní tlapka (z obřího gekona)', 'Lepivá pryskyřice (SO 13)', 'Alchymistická guma'], 270, 'Lektvar plazivosti'),
    priceBuy: '350 zl',
    priceCraft: '270 zl',
    craftTime: '6 hodin',
    color: C.green,
  },
  // ─── MYSL ─────────────────────────────────────────────
  {
    name: 'Lektvar přátelství zvířat',
    effect: 'Zvíře přátelské po 1 hod. (ZH 13)',
    category: 'mysl',
    rarity: 'Běžný',
    ingredients: ing(['Divoký med (z divokého úlu)', 'Levandule (bylina)', 'Zvířecí srst (odpovídá druhu)'], 75, 'Lektvar přátelství zvířat'),
    priceBuy: '100 zl',
    priceCraft: '75 zl',
    craftTime: '3 hodiny',
    color: C.gold,
  },
  {
    name: 'Lektvar charismatu',
    effect: 'Charisma 20 po 1 hodinu',
    category: 'mysl',
    rarity: 'Neobvyklý',
    ingredients: ing(['Jazyky slavíka (tři, ze slavíka)', 'Růžová růže (sbíraná za rozbřesku)', 'Rubínový prach (minerál)'], 310, 'Lektvar charismatu'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '8 hodin',
    color: C.pink,
  },
  {
    name: 'Lektvar jasnovidnosti',
    effect: 'Jako kouzlo Clairvoyance po 10 min.',
    category: 'mysl',
    rarity: 'Vzácný',
    ingredients: ing(['Oko basilišky (z basilišky)', 'Modrý lotosový květ (SO 16, noc)', 'Stříbrný prach (minerál)'], 1150, 'Lektvar jasnovidnosti'),
    priceBuy: '1 500 zl',
    priceCraft: '1 150 zl',
    craftTime: '2 dny',
    color: C.indigo,
  },
  {
    name: 'Lektvar čtení myšlenek',
    effect: 'Jako kouzlo Detect Thoughts po 1 hod.',
    category: 'mysl',
    rarity: 'Vzácný',
    ingredients: ing(['Mozek mindflayera (z mindflayera)', 'Fialová iris (SO 15)', 'Destilát slz (magický proces)'], 1500, 'Lektvar čtení myšlenek'),
    priceBuy: '2 000 zl',
    priceCraft: '1 500 zl',
    craftTime: '2 dny',
    color: C.purple,
  },
  {
    name: 'Lektvar telepatie',
    effect: 'Telepatická komunikace do 36 m na 1 hod.',
    category: 'mysl',
    rarity: 'Neobvyklý',
    ingredients: ing(['Mozek flumfa (z flumfa)', 'Tyrkysový prach (minerál)', 'Ušní vosk obřího netopýra'], 310, 'Lektvar telepatie'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '8 hodin',
    color: C.teal,
  },
  {
    name: 'Lektvar inteligence',
    effect: 'Inteligence 19 po 1 hodinu',
    category: 'mysl',
    rarity: 'Neobvyklý',
    ingredients: ing(['Mozek aboleta (kousek)', 'Šedá ambra (velryba)', 'Inkoust z chobotnice (SO 12)'], 310, 'Lektvar inteligence'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '6 hodin',
    color: C.blue,
  },
  // ─── JEDY ─────────────────────────────────────────────
  {
    name: 'Základní jed',
    effect: '1k4 jedového zranění (OČ povlečeného)',
    category: 'jedy',
    rarity: 'Běžný',
    ingredients: ing(['Hadí jedový váček (z jedovatého hada)', 'Bolehlav (bylina, SO 11)', 'Alkohol (na konzervaci)'], 75, 'Základní jed'),
    priceBuy: '100 zl',
    priceCraft: '75 zl',
    craftTime: '2 hodiny',
    color: C.green,
  },
  {
    name: 'Jed spánku',
    effect: 'Cíl musí uspět v ZH ODL (SO 13) nebo usne na 1 min.',
    category: 'jedy',
    rarity: 'Běžný',
    ingredients: ing(['Mák spánku (bylina, SO 12)', 'Sliny obří žáby (SO 11)', 'Valeriánový kořen'], 115, 'Jed spánku'),
    priceBuy: '150 zl',
    priceCraft: '115 zl',
    craftTime: '3 hodiny',
    color: C.purple,
  },
  {
    name: 'Drow jed',
    effect: 'ZH ODL SO 13 nebo Bezvědomí na 1 hod.',
    category: 'jedy',
    rarity: 'Neobvyklý',
    ingredients: ing(['Podzemní houba drow (Temné říše)', 'Temná lilie (SO 15, bez světla)', 'Pavouččí žlázový extrakt'], 460, 'Drow jed'),
    priceBuy: '600 zl',
    priceCraft: '460 zl',
    craftTime: '1 den',
    color: C.black,
  },
  {
    name: 'Jed wyverna',
    effect: '7k6 jedového zranění (ZH ODL SO 15, ½ při úspěchu)',
    category: 'jedy',
    rarity: 'Vzácný',
    ingredients: ing(['Wyverní žihadlo (z wyverna, čerstvé)', 'Kyselina z ankhega (SO 14)', 'Tmavá melasa (konzervant)'], 920, 'Jed wyverna'),
    priceBuy: '1 200 zl',
    priceCraft: '920 zl',
    craftTime: '2 dny',
    color: C.green,
  },
  {
    name: 'Purpurový červí jed',
    effect: '12k6 jedového zranění (ZH ODL SO 19, ½ při úspěchu)',
    category: 'jedy',
    rarity: 'Velmi vzácný',
    ingredients: ing(['Žlázový vak purpurového červa', 'Černý lotos (SO 18, tropické bažiny)', 'Destilát arsenu (alchymický)'], 6200, 'Purpurový červí jed'),
    priceBuy: '8 000 zl',
    priceCraft: '6 200 zl',
    craftTime: '5 dní',
    color: C.violet,
  },
  {
    name: 'Jed paralýzy',
    effect: 'ZH ODL SO 14 nebo Paralyzovaný na 1 min. (opak. ZH)',
    category: 'jedy',
    rarity: 'Neobvyklý',
    ingredients: ing(['Carrion crawler sliz (z crawler)', 'Ghúlí dráp (z ghúla)', 'Octová esence'], 380, 'Jed paralýzy'),
    priceBuy: '500 zl',
    priceCraft: '380 zl',
    craftTime: '8 hodin',
    color: C.teal,
  },
  {
    name: 'Assassin Blood',
    effect: '1k12 jed. zranění + Otrávení 24 hod. (ZH ODL SO 10)',
    category: 'jedy',
    rarity: 'Běžný',
    ingredients: ing(['Belladonna (bylina, SO 12)', 'Kryší žluč (od obří krysy)', 'Řepkový olej'], 115, 'Assassin Blood'),
    priceBuy: '150 zl',
    priceCraft: '115 zl',
    craftTime: '3 hodiny',
    color: C.crimson,
  },
  {
    name: 'Midnight Tears',
    effect: 'Bez efektu do půlnoci, pak 9k6 jed. (ZH ODL SO 17)',
    category: 'jedy',
    rarity: 'Vzácný',
    ingredients: ing(['Půlnoční květ (SO 17, kvete jen o půlnoci)', 'Stínová esence (SO 15)', 'Černý jantar (minerál)'], 2300, 'Midnight Tears'),
    priceBuy: '3 000 zl',
    priceCraft: '2 300 zl',
    craftTime: '2 dny',
    color: C.black,
  },
  // ─── OSTATNÍ ──────────────────────────────────────────
  {
    name: 'Lektvar zmenšení',
    effect: 'Zmenšení na Tiny po 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Prach z víly (od víly dobrovolně)', 'Mravenčí kyselina (z obřího mravence)', 'Borůvkový extrakt'], 230, 'Lektvar zmenšení'),
    priceBuy: '300 zl',
    priceCraft: '230 zl',
    craftTime: '6 hodin',
    color: C.violet,
  },
  {
    name: 'Lektvar růstu',
    effect: 'Zvětšení na Large po 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Obří houba (SO 13, temné lesy)', 'Kost obra (prach)', 'Dubová pryskyřice'], 230, 'Lektvar růstu'),
    priceBuy: '300 zl',
    priceCraft: '230 zl',
    craftTime: '6 hodin',
    color: C.orange,
  },
  {
    name: 'Lektvar iluzorního vzhledu',
    effect: 'Jako kouzlo Disguise Self po 1 hod.',
    category: 'ostatni',
    rarity: 'Běžný',
    ingredients: ing(['Chameleoní kůže (z chameleona)', 'Rtuťový květ (SO 12)', 'Popel z černého dřeva'], 115, 'Lektvar iluzorního vzhledu'),
    priceBuy: '150 zl',
    priceCraft: '115 zl',
    craftTime: '3 hodiny',
    color: C.silver,
  },
  {
    name: 'Lektvar vitality',
    effect: 'Odstraní vyčerpání, obnoví max HP na 1 den',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Ženšenový kořen (SO 13, vzácný)', 'Srdce vrány (ze starého havrana)', 'Zlatý prach (minerál, 10 zl)'], 380, 'Lektvar vitality'),
    priceBuy: '500 zl',
    priceCraft: '380 zl',
    craftTime: '1 den',
    color: C.gold,
  },
  {
    name: 'Lektvar dlouhého dechu',
    effect: 'Nepotřebuje dýchat po 1 hod.',
    category: 'ostatni',
    rarity: 'Běžný',
    ingredients: ing(['Vzdušná houba (SO 12, jeskyně)', 'Medúzí extrakt (z medúzy)', 'Máta peprná'], 75, 'Lektvar dlouhého dechu'),
    priceBuy: '100 zl',
    priceCraft: '75 zl',
    craftTime: '2 hodiny',
    color: C.cyan,
  },
  {
    name: 'Elixír zdraví',
    effect: 'Vyléčí všechny nemoci, jedy a stavy',
    category: 'ostatni',
    rarity: 'Velmi vzácný',
    ingredients: ing(['Slza draka (z živého draka)', 'Světluška jitřenky (SO 19, úsvit)', 'Prach z andělského pera'], 7800, 'Elixír zdraví'),
    priceBuy: '10 000 zl',
    priceCraft: '7 800 zl',
    craftTime: '7 dní',
    color: C.gold,
  },
  {
    name: 'Lektvar odolnosti ohni',
    effect: 'Odolnost vůči ohnivému poškození 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Salamandří šupina (ohnivý salam.)', 'Červený korál (minerál)', 'Popel z ohnivého elementála'], 310, 'Lektvar odolnosti ohni'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '8 hodin',
    color: C.orange,
  },
  {
    name: 'Lektvar odolnosti chladu',
    effect: 'Odolnost vůči chladnému poškození 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Ledový mech (SO 14, arktické jeskyně)', 'Yetí srst (z yetiho)', 'Mentolový krystal'], 310, 'Lektvar odolnosti chladu'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '8 hodin',
    color: C.cyan,
  },
  {
    name: 'Lektvar ohnivého dechu',
    effect: 'Výdech ohně: 4k6 v kuželu 4,5 m (3× za 1 hod.)',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ing(['Dračí pepř (SO 14, sopečné oblasti)', 'Síra (minerál)', 'Alkohol (vysokoprocentní)'], 310, 'Lektvar ohnivého dechu'),
    priceBuy: '400 zl',
    priceCraft: '310 zl',
    craftTime: '6 hodin',
    color: C.orange,
  },
  {
    name: 'Lektvar tmavozraku',
    effect: 'Tmavozrak 18 m na 1 hodinu',
    category: 'ostatni',
    rarity: 'Běžný',
    ingredients: ing(['Oči jeskynní ryby', 'Houba temnosvitu (SO 11, jeskyně)', 'Odvar z kořene mrkve'], 90, 'Lektvar tmavozraku'),
    priceBuy: '120 zl',
    priceCraft: '90 zl',
    craftTime: '2 hodiny',
    color: C.indigo,
  },
  {
    name: 'Lektvar mládí',
    effect: 'Sníží fyzický věk o 1k6+6 let (nevyléčí)',
    category: 'ostatni',
    rarity: 'Velmi vzácný',
    ingredients: ing(['Slza nymfy (dobrovolný dar)', 'Jablko ze stromu života (SO 20)', 'Diamantový prach (500 zl)'], 11500, 'Lektvar mládí'),
    priceBuy: '15 000 zl',
    priceCraft: '11 500 zl',
    craftTime: '10 dní',
    color: C.pink,
  },
  {
    name: 'Univerzální rozpouštědlo',
    effect: 'Rozpustí jakékoli lepidlo (Sovereign Glue aj.)',
    category: 'ostatni',
    rarity: 'Legendární',
    ingredients: ing(['Sliz z vousatého ďábla', 'Kyselina z černého pudinka', 'Éterická sůl (SO 20)'], 38000, 'Univerzální rozpouštědlo'),
    priceBuy: '50 000 zl',
    priceCraft: '38 000 zl',
    craftTime: '30 dní',
    color: C.white,
  },
];

const CATEGORY_LABELS: { key: PotionCategory; label: string }[] = [
  { key: 'vse', label: 'Vše' },
  { key: 'leceni', label: 'Léčení' },
  { key: 'boj', label: 'Boj' },
  { key: 'pohyb', label: 'Pohyb' },
  { key: 'mysl', label: 'Mysl' },
  { key: 'jedy', label: 'Jedy' },
  { key: 'ostatni', label: 'Ostatní' },
];

const RARITY_LABELS: { key: RarityFilter; label: string }[] = [
  { key: 'vse', label: 'Vše' },
  { key: 'Běžný', label: 'Běžný' },
  { key: 'Neobvyklý', label: 'Neobvyklý' },
  { key: 'Vzácný', label: 'Vzácný' },
  { key: 'Velmi vzácný', label: 'Velmi vzácný' },
  { key: 'Legendární', label: 'Legendární' },
];

// ── Crafting SO & fail table data ────────────────────────────────────────────

const RARITY_SCALE = new Map<Rarity, number>([
  ['Běžný', 1], ['Neobvyklý', 2], ['Vzácný', 3], ['Velmi vzácný', 4], ['Legendární', 5],
]);

/** Lower SO values — failures are now interesting, not just "lost materials". */
const CRAFT_SO = new Map<Rarity, number>([
  ['Běžný', 8], ['Neobvyklý', 12], ['Vzácný', 16], ['Velmi vzácný', 20], ['Legendární', 25],
]);

type FailSeverity = 'great' | 'good' | 'mixed' | 'bad' | 'terrible' | 'doom';

interface FailEntry {
  min: number;
  max: number;
  title: string;
  severity: FailSeverity;
  desc: (r: number) => string;
}

const FAIL_TABLE: FailEntry[] = [
  {
    min: 1, max: 1,
    title: 'VELKÝ TŘESK', severity: 'doom',
    desc: r => `Výbuch srovnatelný s pěstí obřů srovná laboratoř a vše do ${r * 10} sáhů se zemí. Všechny bytosti v dosahu si hází ZH ODL SO ${10 + r * 3} nebo utrpí ${r * 2}k10 ohnivého zranění (½ při úspěchu). Výbuch je viditelný z ${r} míle.`,
  },
  {
    min: 2, max: 2,
    title: 'Smrtelná otrava', severity: 'doom',
    desc: r => `Jedovatý oblak zasahuje tebe a vše do ${r * 3} sáhů. ZH ODL SO ${8 + r * 3} nebo ${r}k6 jedového zranění za každé kolo po dobu ${r} kol + Otrávení na ${r} hodin.`,
  },
  {
    min: 3, max: 3,
    title: 'Řetězová reakce', severity: 'doom',
    desc: r => `Všechny lektvary a magické kapaliny v okruhu ${r * 2} sáhů explodují. Každá lahvička způsobí ${r}k4 poškození odpovídajícího typu. Zásoby jsou nenávratně ztraceny.`,
  },
  {
    min: 4, max: 4,
    title: 'Jiskrový požár', severity: 'terrible',
    desc: r => `Výbuch jisker zapaluje laboratoř a vše do ${r * 4} sáhů. ZH ODL SO 14 nebo ${r}k6 ohnivého zranění. Škoda na vybavení přibližně ${r * 150} zlatých.`,
  },
  {
    min: 5, max: 5,
    title: 'Divoká magie', severity: 'terrible',
    desc: r => `Hraj ${r}× na tabulce efektů Divoké magie. Každý efekt je nezávislý a nastane okamžitě, jeden po druhém.`,
  },
  {
    min: 6, max: 6,
    title: 'Transmutace těla', severity: 'terrible',
    desc: r => `Tvé tělo se dočasně zmutuje. ZH ODL SO ${10 + r * 2} nebo získáš náhodnou fyzickou mutaci na ${r} dní (PH volí: šupiny, oči navíc, drápy, ocas...).`,
  },
  {
    min: 7, max: 7,
    title: 'Výbuch kyseliny', severity: 'terrible',
    desc: r => `Kotlík prasknul a kyselina stříká všude. ${r}k8 kyselinového zranění, vybavení v dosahu zkoroduje. Alchymistická souprava potřebuje opravu za ${r * 50} zl.`,
  },
  {
    min: 8, max: 8,
    title: 'Vlastní otrava', severity: 'bad',
    desc: r => `Spolkneš stabilizační vzorek. ZH ODL SO ${10 + r * 2} nebo Otrávení na ${r * 2} hodiny a ${r}k4 jedového zranění. Suroviny jsou ztraceny.`,
  },
  {
    min: 9, max: 9,
    title: 'Magnetická anomálie', severity: 'bad',
    desc: r => `Lektvar vygeneroval silné magnetické pole. Všechny kovové předměty do ${r * 3} sáhů se přilepí k tvojí výbavě na ${r} hodin. Nevýhoda na útoky se zbraněmi.`,
  },
  {
    min: 10, max: 10,
    title: 'Záhadná látka', severity: 'bad',
    desc: _r => `Vyrobil jsi něco stabilního — ale jen matně tušíš co to může dělat. Nevíš jak to vyrobit znovu. PH si hodí tajně za výsledek (může být cokoliv od "nic" po "kouzlo 5. kruh").`,
  },
  {
    min: 11, max: 11,
    title: 'Amnézie procesu', severity: 'bad',
    desc: r => `Výpary ti zasáhly paměť. Zapomeneš recept na tento lektvar na ${r} dní. Musíš ho najít znovu nebo počkat.`,
  },
  {
    min: 12, max: 12,
    title: 'Odporná chuť', severity: 'mixed',
    desc: r => `Lektvar je funkční, ale chutná nevýslovně hrozně. Pití vyžaduje ZH ODL SO ${11 + r}. Selhání = ${r} kol zvracení (Otrávení) a ztráta akce. Po spolknutí účinkuje normálně.`,
  },
  {
    min: 13, max: 13,
    title: 'Nestabilní směs', severity: 'mixed',
    desc: r => `Lektvar funguje, ale musí být použit do ${r} hodin, jinak ztratí účinek. Navíc při nárazu (pádu) má 50% šanci explodovat za ${r}k4 poškození.`,
  },
  {
    min: 14, max: 14,
    title: 'Poloviční efekt', severity: 'mixed',
    desc: _r => `Lektvar funguje, ale s polovičním efektem a na poloviční dobu trvání. Léčivé lektvary obnoví jen polovinu HP, buff lektvary trvají ½ doby.`,
  },
  {
    min: 15, max: 15,
    title: 'Zpoždění účinku', severity: 'mixed',
    desc: r => `Lektvar je funkční, ale účinek nastane až za ${r}k10 minut po vypití. Do té doby žádný efekt — a nevíš přesně kdy zabere.`,
  },
  {
    min: 16, max: 16,
    title: 'Vedlejší efekt', severity: 'mixed',
    desc: r => `Lektvar funguje správně! Ale má vedlejší efekt (hod k6): 1 Otrávení 1 hod. • 2 Spánek ${r} kol • 3 Halucinace ${r} hod. • 4 Zmenšení 1 hod. • 5 Zápach 6 sáhů ${r} hod. • 6 Kůže zmodrá ${r * 24} hod.`,
  },
  {
    min: 17, max: 17,
    title: 'Dvojitá dávka, dvojité riziko', severity: 'good',
    desc: _r => `Vyrobil jsi dvě dávky místo jedné! Ale obě jsou nestabilní — při použití jedné musíš hodit k20: na 1-5 se obě znehodnotí.`,
  },
  {
    min: 18, max: 18,
    title: 'Šťastná nehoda', severity: 'good',
    desc: _r => `Selhal jsi na zamýšlený lektvar — ale omylem syntetizoval jiný náhodný lektvar stejné vzácnosti. PH určí který.`,
  },
  {
    min: 19, max: 19,
    title: 'Bonusový vedlejší efekt', severity: 'good',
    desc: r => `Lektvar je hotový a funguje podle plánu, navíc má drobný bonus: +${r} dočasné HP na 1 hodinu po vypití, nebo trvání prodlouženo o 50%.`,
  },
  {
    min: 20, max: 20,
    title: 'Geniální omyl!', severity: 'great',
    desc: _r => `Omylem jsi vyrobil vylepšenou verzi — lektvar má DVOJNÁSOBNÝ efekt a DVOJNÁSOBNOU dobu trvání. Někdy se génius projeví náhodou.`,
  },
];

@Component({
  selector: 'potions-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="pt-wrap">
      <header class="pt-header">
        <h2 class="pt-title">Lektvary & Jedy – Receptář</h2>
        <p class="pt-subtitle">Přísady, ceny a čas vaření • Výroba vždy levnější než nákup</p>
      </header>

      <div class="pt-filters">
        <div class="pt-filter-row">
          <span class="pt-filter-label">Typ:</span>
          @for (cat of categories; track cat.key) {
            <button class="pt-filter-btn" [class.active]="activeCategory() === cat.key"
              (click)="activeCategory.set(cat.key)">{{ cat.label }}</button>
          }
        </div>
        <div class="pt-filter-row">
          <span class="pt-filter-label">Vzácnost:</span>
          @for (r of rarities; track r.key) {
            <button class="pt-filter-btn pt-rarity-btn" [class.active]="activeRarity() === r.key"
              [attr.data-rarity]="r.key" (click)="activeRarity.set(r.key)">{{ r.label }}</button>
          }
        </div>
      </div>

      <div class="pt-search-row">
        <input class="pt-search" placeholder="Hledat lektvar nebo přísadu…"
          [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)"/>
      </div>

      <!-- ═══ Potions Table (collapsible) ═══ -->
      <details class="pt-collapsible" open>
        <summary class="pt-collapsible-header">Tabulka lektvarů ({{ filteredPotions().length }})</summary>
        <div class="pt-table-wrap">
          <table class="pt-table">
            <thead>
              <tr>
                <th class="col-name">Lektvar</th>
                <th class="col-rarity">Vzácnost</th>
                <th class="col-ingr">Přísady</th>
                <th class="col-price">Cena / Výroba</th>
                <th class="col-time">Čas</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredPotions(); track p.name) {
                <tr class="pt-row">
                  <td class="col-name">
                    <div class="pt-name">{{ p.name }}</div>
                    <div class="pt-effect">{{ p.effect }}</div>
                  </td>
                  <td class="col-rarity"><span class="pt-tag" [attr.data-rarity]="p.rarity">{{ p.rarity }}</span></td>
                  <td class="col-ingr">
                    <div class="pt-ingr">
                      @for (ingItem of p.ingredients; track ingItem.name) {
                        <span class="pt-ingr-item">
                          <span class="pt-ingr-name" [innerHTML]="highlightIngredient(ingItem.name)"></span>
                          <span class="pt-ingr-price">{{ ingItem.price }} zl</span>
                        </span>
                      }
                    </div>
                  </td>
                  <td class="col-price">
                    <div class="pt-price-buy">{{ p.priceBuy }}</div>
                    <div class="pt-price-craft">{{ p.priceCraft }}</div>
                  </td>
                  <td class="col-time">{{ p.craftTime }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="pt-empty">Žádné lektvary neodpovídají filtru.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </details>

      <!-- ═══ Crafting Rules & d20 Fail Table (collapsible) ═══ -->
      <details class="pt-collapsible">
        <summary class="pt-collapsible-header">Pravidla výroby & Tabulka selhání</summary>
        <section class="craft-section">
          <h3 class="craft-title">Pravidla výroby</h3>

          <!-- SO summary -->
          <div class="craft-intro">
            <p>Postava musí mít zdatnost v <strong>Alchymistické soupravě</strong>. Hodí si na <strong>INT (Arkána)</strong> nebo <strong>MDR (Lékařství)</strong> proti SO dle vzácnosti.</p>
            <p>Při selhání neztratíš jen suroviny — hodíš si na <strong>Tabulku selhání (k20)</strong> níže a zjistíš, jak moc se to pokazilo.</p>
          </div>

          <!-- SO table -->
          <div class="so-table-wrap">
            <table class="so-table">
              <thead>
                <tr>
                  <th>Vzácnost</th>
                  <th>SO vaření</th>
                  <th>Při selhání</th>
                </tr>
              </thead>
              <tbody>
                @for (row of craftSoRows; track row.rarity) {
                  <tr>
                    <td><span class="pt-tag" [attr.data-rarity]="row.rarity">{{ row.rarity }}</span></td>
                    <td class="so-value">{{ row.so }}</td>
                    <td class="so-fail-hint">Hod k20 na tabulku selhání</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- d20 Fail Table interactive -->
          <div class="fail-section">
            <div class="fail-header">
              <h4 class="fail-title">Tabulka selhání (k20)</h4>
              <div class="fail-controls">
                <span class="fail-label">Vzácnost lektvaru:</span>
                @for (r of rarityOnly; track r.key) {
                  <button class="pt-filter-btn pt-rarity-btn fail-rar-btn"
                    [class.active]="failRarity() === r.key"
                    [attr.data-rarity]="r.key"
                    (click)="failRarity.set(r.key)">{{ r.label }}</button>
                }
                <button class="roll-btn" (click)="rollD20()">Hodit k20</button>
              </div>
            </div>

            <div class="fail-table-wrap">
              <table class="fail-table">
                <thead>
                  <tr>
                    <th class="col-roll">k20</th>
                    <th class="col-result">Výsledek</th>
                    <th class="col-desc">Popis (škáluje dle vzácnosti)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of failTable; track entry.min) {
                    <tr [attr.data-sev]="entry.severity">
                      <td class="col-roll">
                        <span class="roll-badge" [attr.data-sev]="entry.severity">
                          {{ entry.min }}
                        </span>
                      </td>
                      <td class="col-result">
                        <span class="fail-name">{{ entry.title }}</span>
                      </td>
                      <td class="col-desc">{{ entry.desc(failRarityScale()) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </details>
    </div>
  `,
  styles: `
    :host { display: block; overflow-y: auto; height: calc(100svh - 165px); min-height: 400px; }
    .pt-wrap { padding: 20px 28px 40px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; color: #d4c9a0; }
    .pt-header { margin-bottom: 16px; }
    .pt-title { font-size: 20px; color: #e8c96a; margin: 0 0 4px; font-weight: 600; }
    .pt-subtitle { font-size: 12px; color: #9a8a6a; margin: 0; }

    /* ─── Collapsible ─── */
    .pt-collapsible { margin-bottom: 16px; border: 1px solid rgba(200,160,60,.18); border-radius: 10px; overflow: hidden; }
    .pt-collapsible-header {
      cursor: pointer; padding: 12px 18px; font-size: 14px; font-weight: 700; color: #e8c96a;
      background: rgba(200,160,60,.06); border-bottom: 1px solid rgba(200,160,60,.12);
      list-style: none; display: flex; align-items: center; gap: 8px;
      user-select: none; transition: background .15s;
    }
    .pt-collapsible-header:hover { background: rgba(200,160,60,.12); }
    .pt-collapsible-header::before { content: '▶'; font-size: 10px; transition: transform .2s; }
    .pt-collapsible[open] > .pt-collapsible-header::before { transform: rotate(90deg); }
    .pt-collapsible-header::-webkit-details-marker { display: none; }

    /* ─── Filters ─── */
    .pt-filters { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .pt-filter-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .pt-filter-label { font-size: 11px; color: #7a6a58; min-width: 62px; text-transform: uppercase; letter-spacing: .06em; }
    .pt-filter-btn {
      background: rgba(200,160,60,.08); border: 1px solid rgba(200,160,60,.2); border-radius: 6px;
      padding: 4px 12px; font-size: 11px; color: #9a8a6a; cursor: pointer; transition: all .15s;
      font-family: sans-serif;
    }
    .pt-filter-btn:hover { background: rgba(200,160,60,.15); color: #d4c9a0; border-color: rgba(200,160,60,.4); }
    .pt-filter-btn.active { background: rgba(200,160,60,.25); color: #e8c96a; border-color: rgba(200,160,60,.6); }

    /* Rarity-specific active colors */
    .pt-filter-btn.active[data-rarity="Běžný"] { background: rgba(100,180,60,.2); color: #8fc95a; border-color: rgba(100,180,60,.5); }
    .pt-filter-btn.active[data-rarity="Neobvyklý"] { background: rgba(80,160,220,.2); color: #6ab8e8; border-color: rgba(80,160,220,.5); }
    .pt-filter-btn.active[data-rarity="Vzácný"] { background: rgba(220,160,40,.2); color: #d4a830; border-color: rgba(220,160,40,.5); }
    .pt-filter-btn.active[data-rarity="Velmi vzácný"] { background: rgba(200,60,60,.2); color: #d46a6a; border-color: rgba(200,60,60,.5); }
    .pt-filter-btn.active[data-rarity="Legendární"] { background: rgba(160,80,200,.2); color: #b880d8; border-color: rgba(160,80,200,.5); }

    .pt-search-row { margin-bottom: 14px; }
    .pt-search {
      width: 100%; max-width: 320px; padding: 7px 12px; font-size: 13px;
      background: rgba(200,160,60,.06); border: 1px solid rgba(200,160,60,.2); border-radius: 6px;
      color: #d4c9a0; outline: none; font-family: sans-serif;
    }
    .pt-search::placeholder { color: #7a6a58; }
    .pt-search:focus { border-color: rgba(200,160,60,.5); background: rgba(200,160,60,.1); }

    /* ─── Table ─── */
    .pt-table-wrap { overflow-x: auto; padding: 12px 12px 12px; }
    .pt-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .pt-table thead tr th {
      text-align: left; padding: 8px 10px; font-weight: 500; font-size: 11px;
      color: rgba(200,160,60,.7); letter-spacing: .06em; text-transform: uppercase;
      border-bottom: 1px solid rgba(200,160,60,.25); background: rgba(200,160,60,.06);
    }
    .pt-table tbody tr td {
      padding: 10px 10px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: top;
    }
    .pt-table tbody tr:hover td { background: rgba(200,160,60,.04); }
    .pt-table tbody tr:last-child td { border-bottom: none; }

    .col-name { width: 22%; }
    .col-rarity { width: 11%; }
    .col-ingr { width: 37%; }
    .col-price { width: 15%; }
    .col-time { width: 10%; white-space: nowrap; color: #9a8a6a; font-size: 12px; }

    .pt-name { font-weight: 600; font-size: 13px; color: #e0cfa0; }
    .pt-effect { font-size: 11px; color: #9a8a6a; margin-top: 2px; }

    .pt-tag {
      display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 500; white-space: nowrap;
    }
    .pt-tag[data-rarity="Běžný"] { background: rgba(100,180,60,.15); color: #8fc95a; }
    .pt-tag[data-rarity="Neobvyklý"] { background: rgba(80,160,220,.15); color: #6ab8e8; }
    .pt-tag[data-rarity="Vzácný"] { background: rgba(220,160,40,.15); color: #d4a830; }
    .pt-tag[data-rarity="Velmi vzácný"] { background: rgba(200,60,60,.15); color: #d46a6a; }
    .pt-tag[data-rarity="Legendární"] { background: rgba(160,80,200,.15); color: #b880d8; }

    .pt-ingr { display: flex; flex-direction: column; gap: 3px; }
    .pt-ingr-item { display: flex; align-items: baseline; gap: 6px; font-size: 12px; color: #b0a080; }
    .pt-ingr-item::before { content: "· "; color: rgba(200,160,60,.5); flex-shrink: 0; }
    .pt-ingr-name { flex: 1; }
    .pt-ingr-price { font-size: 10px; color: #9a8a6a; white-space: nowrap; font-style: italic; }

    :host ::ng-deep .search-hl { color: #f06060; font-weight: 700; background: rgba(240,60,60,.1); border-radius: 2px; padding: 0 1px; }

    .pt-price-buy { font-size: 12px; color: #d4c9a0; white-space: nowrap; }
    .pt-price-craft { font-size: 11px; color: #8fc95a; white-space: nowrap; margin-top: 2px; }

    .pt-empty { text-align: center; color: #7a6a58; padding: 32px 0 !important; font-style: italic; }


    /* ─── Crafting Section ─── */
    .craft-section { padding: 20px 18px 24px; }
    .craft-title { font-size: 16px; font-weight: 700; color: #e8c96a; margin: 0 0 14px; }
    .craft-intro { margin-bottom: 18px; }
    .craft-intro p { font-size: 13px; color: #b0a080; margin: 0 0 6px; line-height: 1.55; }
    .craft-intro strong { color: #d4c9a0; }
    .so-table-wrap { margin-bottom: 28px; overflow-x: auto; }
    .so-table { border-collapse: collapse; font-size: 12.5px; }
    .so-table th { text-align: left; padding: 6px 14px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: rgba(200,160,60,.6); border-bottom: 1px solid rgba(200,160,60,.2); background: rgba(200,160,60,.06); }
    .so-table td { padding: 7px 14px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
    .so-table tr:last-child td { border-bottom: none; }
    .so-value { font-weight: 700; font-size: 15px; color: #e8c96a; }
    .so-fail-hint { font-size: 11px; color: #7a6a58; font-style: italic; }
    .fail-section { margin-top: 4px; }
    .fail-title { font-size: 14px; font-weight: 700; color: #d4c9a0; margin: 0 0 10px; }
    .fail-header { margin-bottom: 14px; }
    .fail-controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .fail-label { font-size: 11px; color: #7a6a58; text-transform: uppercase; letter-spacing: .06em; margin-right: 4px; }
    .fail-rar-btn { font-size: 10.5px; padding: 3px 10px; }
    .roll-btn { padding: 6px 18px; font-size: 13px; font-weight: 700; font-family: sans-serif; background: linear-gradient(135deg, rgba(200,120,20,.35), rgba(160,80,0,.25)); border: 1.5px solid rgba(220,150,40,.5); border-radius: 8px; color: #f0c040; cursor: pointer; transition: all .18s; margin-left: 8px; box-shadow: 0 2px 10px rgba(200,120,20,.2); }
    .roll-btn:hover { background: linear-gradient(135deg, rgba(220,140,30,.5), rgba(180,90,0,.4)); border-color: rgba(240,170,50,.7); transform: translateY(-1px); }
    .roll-btn:active { transform: translateY(0); }
    .fail-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid rgba(200,160,60,.15); }
    .fail-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .fail-table thead tr th { text-align: left; padding: 8px 12px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: rgba(200,160,60,.6); border-bottom: 1px solid rgba(200,160,60,.2); background: rgba(200,160,60,.06); }
    .fail-table tbody tr td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: top; }
    .fail-table tbody tr:last-child td { border-bottom: none; }
    .fail-table tbody tr[data-sev="doom"]     td { background: rgba(160,20,20,.08); }
    .fail-table tbody tr[data-sev="terrible"] td { background: rgba(180,80,20,.06); }
    .fail-table tbody tr[data-sev="bad"]      td { background: rgba(160,130,20,.05); }
    .fail-table tbody tr[data-sev="mixed"]    td { background: rgba(60,100,160,.04); }
    .fail-table tbody tr[data-sev="good"]     td { background: rgba(60,160,80,.04); }
    .fail-table tbody tr[data-sev="great"]    td { background: rgba(160,120,220,.06); }
    .fail-table tbody tr:hover td { filter: brightness(1.15); }
    .fail-highlighted td { outline: 2px solid rgba(240,200,60,.65) !important; outline-offset: -2px; animation: hl-pulse .5s ease; }
    @keyframes hl-pulse { 0%,100% { filter: brightness(1.2); } 50% { filter: brightness(1.65); } }
    .col-roll { width: 60px; text-align: center; }
    .col-result { width: 180px; white-space: nowrap; }
    .col-desc { font-size: 12px; color: #b0a080; line-height: 1.55; }
    .roll-badge { display: inline-block; min-width: 32px; text-align: center; padding: 3px 6px; border-radius: 6px; font-weight: 800; font-size: 13px; }
    .roll-badge[data-sev="doom"]    { background: rgba(180,20,20,.35);   color: #f06060; border: 1px solid rgba(200,40,40,.4); }
    .roll-badge[data-sev="terrible"]{ background: rgba(200,80,20,.3);    color: #e08040; border: 1px solid rgba(200,100,40,.4); }
    .roll-badge[data-sev="bad"]     { background: rgba(180,140,20,.25);  color: #d0b030; border: 1px solid rgba(180,140,20,.4); }
    .roll-badge[data-sev="mixed"]   { background: rgba(60,100,180,.25);  color: #80a8e0; border: 1px solid rgba(80,120,200,.4); }
    .roll-badge[data-sev="good"]    { background: rgba(40,160,80,.2);    color: #60c870; border: 1px solid rgba(60,180,80,.4); }
    .roll-badge[data-sev="great"]   { background: rgba(140,100,220,.25); color: #b080e8; border: 1px solid rgba(160,120,220,.4); }
    .fail-name { font-weight: 700; font-size: 12.5px; color: #d4c9a0; vertical-align: middle; }
  `,
})
export class PotionsTabComponent {
  private readonly diceRollerService = inject(DiceRollerService);

  readonly categories = CATEGORY_LABELS;
  readonly rarities = RARITY_LABELS;
  readonly activeCategory = signal<PotionCategory>('vse');
  readonly activeRarity = signal<RarityFilter>('vse');
  readonly searchQuery = signal('');

  readonly rarityOnly = RARITY_LABELS.filter(r => r.key !== 'vse') as { key: Rarity; label: string }[];
  readonly failRarity = signal<Rarity>('Běžný');
  readonly failRarityScale = computed(() => RARITY_SCALE.get(this.failRarity()) ?? 1);
  readonly failTable = FAIL_TABLE;
  readonly craftSoRows = Array.from(CRAFT_SO.entries()).map(([rarity, so]) => ({
    rarity, so,
  }));

  rollD20(): void {
    this.diceRollerService.rollD20WithModifier('Selhání výroby lektvaru', 0);
  }

  /** Highlight matched search chars in ingredient name (diacritics-insensitive) */
  highlightIngredient(ingredientName: string): string {
    const q = this.searchQuery().trim();
    if (q.length < 2) return this._escapeHtml(ingredientName);

    const qNorm = normSearch(q);
    const nameNorm = normSearch(ingredientName);
    const idx = nameNorm.indexOf(qNorm);
    if (idx === -1) return this._escapeHtml(ingredientName);

    // Map normalized index back to original string using char-by-char walk
    const origChars = [...ingredientName];
    let ni = 0;
    let startOrig = 0;
    for (let oi = 0; oi < origChars.length && ni < idx; oi++) {
      ni += normSearch(origChars[oi]).length;
      startOrig = oi + 1;
    }

    let endOrig = startOrig;
    let matchedNorm = 0;
    for (let oi = startOrig; oi < origChars.length && matchedNorm < qNorm.length; oi++) {
      matchedNorm += normSearch(origChars[oi]).length;
      endOrig = oi + 1;
    }

    const beforeStr = this._escapeHtml(origChars.slice(0, startOrig).join(''));
    const matchStr = this._escapeHtml(origChars.slice(startOrig, endOrig).join(''));
    const afterStr = this._escapeHtml(origChars.slice(endOrig).join(''));

    return `${beforeStr}<span class="search-hl">${matchStr}</span>${afterStr}`;
  }

  private _escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  readonly filteredPotions = computed(() => {
    const cat = this.activeCategory();
    const rar = this.activeRarity();
    const q = normSearch(this.searchQuery().trim());
    let result = POTIONS;
    if (cat !== 'vse') result = result.filter(p => p.category === cat);
    if (rar !== 'vse') result = result.filter(p => p.rarity === rar);
    if (q.length >= 2) {
      result = result.filter(p => {
        const s = normSearch(p.name + ' ' + p.effect + ' ' + p.ingredients.map(i => i.name).join(' ') + ' ' + p.rarity);
        return s.includes(q);
      });
    }
    return result;
  });
}

