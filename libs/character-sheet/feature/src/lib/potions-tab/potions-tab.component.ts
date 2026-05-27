import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

// ── Data model ──────────────────────────────────────────────────────────────

type PotionCategory = 'vse' | 'leceni' | 'boj' | 'pohyb' | 'mysl' | 'jedy' | 'ostatni';
type Rarity = 'Běžný' | 'Neobvyklý' | 'Vzácný' | 'Velmi vzácný' | 'Legendární';

interface Potion {
  name: string;
  effect: string;
  category: PotionCategory;
  rarity: Rarity;
  ingredients: string[];
  priceBuy: string;
  priceCraft: string;
  craftTime: string;
}

const POTIONS: Potion[] = [
  // ─── LÉČENÍ ───────────────────────────────────────────
  {
    name: 'Lektvar léčení',
    effect: 'Obnoví 2k4+2 HP',
    category: 'leceni',
    rarity: 'Běžný',
    ingredients: ['Červená jetelina (bylina, louky)', 'Včelí med (obchod / úl)', 'Čistá pramenitá voda'],
    priceBuy: '50 zl',
    priceCraft: '25 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar většího léčení',
    effect: 'Obnoví 4k4+4 HP',
    category: 'leceni',
    rarity: 'Běžný',
    ingredients: ['Solný květ (skalní bylina)', 'Trollí krev (z trola)', 'Zlatý mech (les, SO 13)'],
    priceBuy: '100 zl',
    priceCraft: '50 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar vynikajícího léčení',
    effect: 'Obnoví 8k4+8 HP',
    category: 'leceni',
    rarity: 'Neobvyklý',
    ingredients: ['Fénixí pero (z fénixe / obchod)', 'Stříbrná kapradina (SO 15)', 'Roztavený jantar (minerál)'],
    priceBuy: '500 zl',
    priceCraft: '200 zl',
    craftTime: '3 dny',
  },
  {
    name: 'Lektvar nejvyššího léčení',
    effect: 'Obnoví 10k4+20 HP',
    category: 'leceni',
    rarity: 'Vzácný',
    ingredients: ['Dračí žluč (z draka)', 'Měsíční orchidej (SO 18, noc úplňku)', 'Prach z unicorn rohu'],
    priceBuy: '5 000 zl',
    priceCraft: '1 000 zl',
    craftTime: '7 dní',
  },
  {
    name: 'Lektvar proti jedu',
    effect: 'Vyléčí Otrávení, imunita 1 hod.',
    category: 'leceni',
    rarity: 'Běžný',
    ingredients: ['Bílý bez (bylina, okraje lesů)', 'Hadí svlak (z hada)', 'Citrónová šťáva'],
    priceBuy: '100 zl',
    priceCraft: '50 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar zotavení',
    effect: 'Odstraní jednu nemoc nebo stav',
    category: 'leceni',
    rarity: 'Neobvyklý',
    ingredients: ['Světluška (chycená za úsvitu)', 'Krev kněze (dobrovolná, 1k4 HP)', 'Šafrán (vzácné koření)'],
    priceBuy: '300 zl',
    priceCraft: '150 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar regenerace',
    effect: 'Obnovuje 1 HP/kolo po 1 minutu (10 HP celkem)',
    category: 'leceni',
    rarity: 'Vzácný',
    ingredients: ['Trollí srdce (z trola, čerstvé)', 'Salamandří olej (z ohnivého salamandra)', 'Diamantový prach (50 zl)'],
    priceBuy: '2 000 zl',
    priceCraft: '600 zl',
    craftTime: '5 dní',
  },
  // ─── BOJ ──────────────────────────────────────────────
  {
    name: 'Lektvar síly obra',
    effect: 'Síla 21 po 1 hodinu',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ['Obrova kost (prach z kosti obra)', 'Železný kořen (SO 14, hory)', 'Červené víno (staré, min. 10 let)'],
    priceBuy: '500 zl',
    priceCraft: '200 zl',
    craftTime: '3 dny',
  },
  {
    name: 'Lektvar síly kopcového obra',
    effect: 'Síla 21 po 1 hodinu',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ['Kopcový kořen (SO 14)', 'Obrova svalovina (kopcový obr)', 'Kamenný prach'],
    priceBuy: '500 zl',
    priceCraft: '200 zl',
    craftTime: '3 dny',
  },
  {
    name: 'Lektvar síly ledového obra',
    effect: 'Síla 23 po 1 hodinu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ['Srdce ledového obra', 'Ledovcový krystal (SO 16)', 'Medvědí tuk (polární medvěd)'],
    priceBuy: '2 000 zl',
    priceCraft: '600 zl',
    craftTime: '5 dní',
  },
  {
    name: 'Lektvar síly ohnivého obra',
    effect: 'Síla 25 po 1 hodinu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ['Popel ohnivého obra', 'Magmatický kořen (SO 17, vulkán)', 'Obsidiánový prach (minerál)'],
    priceBuy: '3 000 zl',
    priceCraft: '900 zl',
    craftTime: '7 dní',
  },
  {
    name: 'Lektvar odolnosti',
    effect: 'Odolnost vůči jednomu typu poškození 1 hod.',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ['Šupina draka (odpovídá typu)', 'Kouřový kámen (minerál)', 'Popel z hromového dubu'],
    priceBuy: '400 zl',
    priceCraft: '150 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar hrdinství',
    effect: '10 dočasných HP + Inspirace po 1 hod.',
    category: 'boj',
    rarity: 'Neobvyklý',
    ingredients: ['Lví srdce (ze lva)', 'Červená rulíková semena (SO 14)', 'Jiskřivý pyrit (minerál)'],
    priceBuy: '200 zl',
    priceCraft: '100 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar rychlosti',
    effect: 'Jako kouzlo Haste po 1 minutu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ['Gepardí pazneht (z geparda)', 'Blesková kapradina (SO 16, bouřka)', 'Rtuť (minerál, nebezpečná)'],
    priceBuy: '2 000 zl',
    priceCraft: '500 zl',
    craftTime: '5 dní',
  },
  {
    name: 'Lektvar neviditelnosti',
    effect: 'Neviditelnost po 1 hodinu',
    category: 'boj',
    rarity: 'Vzácný',
    ingredients: ['Oko mimika (z mimika)', 'Stínový mech (SO 15, tmavé jeskyně)', 'Destilovaný alkohol (90%+)'],
    priceBuy: '2 000 zl',
    priceCraft: '600 zl',
    craftTime: '4 dny',
  },
  {
    name: 'Lektvar nezranitelnosti',
    effect: 'Odolnost vůči VŠEM typům poškození 1 min.',
    category: 'boj',
    rarity: 'Velmi vzácný',
    ingredients: ['Krev tarraska (z tarraska)', 'Adamantinový prach (50 zl)', 'Srdce goléma (z goléma)'],
    priceBuy: '10 000 zl',
    priceCraft: '3 000 zl',
    craftTime: '14 dní',
  },
  {
    name: 'Olej ostření',
    effect: 'Zbraň má +3 k zásahu a poškození na 1 hod.',
    category: 'boj',
    rarity: 'Velmi vzácný',
    ingredients: ['Prach z briliantu (500 zl)', 'Krev pláštníka (z pláštníka)', 'Éterická esence (SO 18)'],
    priceBuy: '8 000 zl',
    priceCraft: '2 500 zl',
    craftTime: '10 dní',
  },
  // ─── POHYB ────────────────────────────────────────────
  {
    name: 'Lektvar šplhání',
    effect: 'Rychlost šplhání = rychlost pohybu, 1 hod.',
    category: 'pohyb',
    rarity: 'Běžný',
    ingredients: ['Pavučina (z velkého pavouka)', 'Pryskyřice břízy', 'Mátový olej'],
    priceBuy: '75 zl',
    priceCraft: '30 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar vodního dechu',
    effect: 'Dýchání pod vodou po 1 hod.',
    category: 'pohyb',
    rarity: 'Běžný',
    ingredients: ['Rybí žábry (z velké ryby)', 'Říční řasa (SO 11)', 'Perleťový prach (z ústřice)'],
    priceBuy: '75 zl',
    priceCraft: '30 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar levitace',
    effect: 'Levitace po 10 minut',
    category: 'pohyb',
    rarity: 'Neobvyklý',
    ingredients: ['Peří gryfa (z gryfa)', 'Vzdušný křemen (minerál, hory)', 'Destilát oblačnice (SO 15)'],
    priceBuy: '400 zl',
    priceCraft: '150 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar létání',
    effect: 'Rychlost letu 18 m po 1 hod.',
    category: 'pohyb',
    rarity: 'Vzácný',
    ingredients: ['Pegasovo pero (z pegase)', 'Oblačný jantar (SO 17, bouřka)', 'Destilovaný vítr (magický proces)'],
    priceBuy: '3 000 zl',
    priceCraft: '800 zl',
    craftTime: '5 dní',
  },
  {
    name: 'Lektvar éteričnosti',
    effect: 'Přechod do Éterické sféry na 1 hod.',
    category: 'pohyb',
    rarity: 'Vzácný',
    ingredients: ['Éterická mlha (SO 17, místo s portálem)', 'Perla fázového pavouka', 'Duševní křišťál (minerál)'],
    priceBuy: '4 000 zl',
    priceCraft: '1 200 zl',
    craftTime: '7 dní',
  },
  {
    name: 'Lektvar plazivosti',
    effect: 'Svobodný pohyb po zdech a stropě na 1 hod.',
    category: 'pohyb',
    rarity: 'Neobvyklý',
    ingredients: ['Gekon í tlapka (z obřího gekona)', 'Lepivá pryskyřice (SO 13)', 'Alchymistická guma'],
    priceBuy: '350 zl',
    priceCraft: '130 zl',
    craftTime: '2 dny',
  },
  // ─── MYSL ─────────────────────────────────────────────
  {
    name: 'Lektvar přátelství zvířat',
    effect: 'Zvíře přátelské po 1 hod. (ZH 13)',
    category: 'mysl',
    rarity: 'Běžný',
    ingredients: ['Divoký med (z divokého úlu)', 'Levandule (bylina)', 'Zvířecí srst (odpovídá druhu)'],
    priceBuy: '100 zl',
    priceCraft: '40 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar charismatu',
    effect: 'Charisma 20 po 1 hodinu',
    category: 'mysl',
    rarity: 'Neobvyklý',
    ingredients: ['Jazyky slavíka (tři, ze slavíka)', 'Růžová růže (sbíraná za rozbřesku)', 'Rubínový prach (minerál)'],
    priceBuy: '400 zl',
    priceCraft: '180 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar jasnovidnosti',
    effect: 'Jako kouzlo Clairvoyance po 10 min.',
    category: 'mysl',
    rarity: 'Vzácný',
    ingredients: ['Oko basilišky (z basilišky)', 'Modrý lotosový květ (SO 16, noc)', 'Stříbrný prach (minerál)'],
    priceBuy: '1 500 zl',
    priceCraft: '500 zl',
    craftTime: '4 dny',
  },
  {
    name: 'Lektvar čtení myšlenek',
    effect: 'Jako kouzlo Detect Thoughts po 1 hod.',
    category: 'mysl',
    rarity: 'Vzácný',
    ingredients: ['Mozek mindflayera (z mindflayera)', 'Fialová iris (SO 15)', 'Destilát slz (magický proces)'],
    priceBuy: '2 000 zl',
    priceCraft: '700 zl',
    craftTime: '5 dní',
  },
  {
    name: 'Lektvar telepatie',
    effect: 'Telepatická komunikace do 36 m na 1 hod.',
    category: 'mysl',
    rarity: 'Neobvyklý',
    ingredients: ['Mozek flumfa (z flumfa)', 'Tyrkysový prach (minerál)', 'Ušní vosk obřího netopýra'],
    priceBuy: '400 zl',
    priceCraft: '160 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar inteligence',
    effect: 'Inteligence 19 po 1 hodinu',
    category: 'mysl',
    rarity: 'Neobvyklý',
    ingredients: ['Mozek aboleta (kousek)', 'Šedá ambra (velryba)', 'Inkoust z chobotnice (SO 12)'],
    priceBuy: '400 zl',
    priceCraft: '160 zl',
    craftTime: '2 dny',
  },
  // ─── JEDY ─────────────────────────────────────────────
  {
    name: 'Základní jed',
    effect: '1k4 jedového zranění (OČ povlečeného)',
    category: 'jedy',
    rarity: 'Běžný',
    ingredients: ['Had í jedový váček (z jedovatého hada)', 'Bolehlav (bylina, SO 11)', 'Alkohol (na konzervaci)'],
    priceBuy: '100 zl',
    priceCraft: '40 zl',
    craftTime: '1 den',
  },
  {
    name: 'Jed spánku',
    effect: 'Cíl musí uspět v ZH ODL (SO 13) nebo usne na 1 min.',
    category: 'jedy',
    rarity: 'Běžný',
    ingredients: ['Mák spánku (bylina, SO 12)', 'Sliny obřího žáby (SO 11)', 'Valeriánový kořen'],
    priceBuy: '150 zl',
    priceCraft: '60 zl',
    craftTime: '1 den',
  },
  {
    name: 'Drow jed',
    effect: 'ZH ODL SO 13 nebo Bezvědomí na 1 hod.',
    category: 'jedy',
    rarity: 'Neobvyklý',
    ingredients: ['Podzemní houba drow (Temné říše)', 'Temná lilie (SO 15, bez světla)', 'Pavouččí žlázový extrakt'],
    priceBuy: '600 zl',
    priceCraft: '200 zl',
    craftTime: '3 dny',
  },
  {
    name: 'Jed wyverna',
    effect: '7k6 jedového zranění (ZH ODL SO 15, ½ při úspěchu)',
    category: 'jedy',
    rarity: 'Vzácný',
    ingredients: ['Wyverní žihadlo (z wyverna, čerstvé)', 'Kyselina z ankhega (SO 14)', 'Tmavá melasa (konzervant)'],
    priceBuy: '1 200 zl',
    priceCraft: '400 zl',
    craftTime: '4 dny',
  },
  {
    name: 'Purpurový červí jed',
    effect: '12k6 jedového zranění (ZH ODL SO 19, ½ při úspěchu)',
    category: 'jedy',
    rarity: 'Velmi vzácný',
    ingredients: ['Žlázový vak purpurového červa', 'Černý lotos (SO 18, tropické bažiny)', 'Destilát arsenu (alchymický)'],
    priceBuy: '8 000 zl',
    priceCraft: '2 500 zl',
    craftTime: '10 dní',
  },
  {
    name: 'Jed paralýzy',
    effect: 'ZH ODL SO 14 nebo Paralyzovaný na 1 min. (opak. ZH)',
    category: 'jedy',
    rarity: 'Neobvyklý',
    ingredients: ['Carrion crawler sliz (z crawler)',  'Ghúlí dráp (z ghúla)', 'Octová esence'],
    priceBuy: '500 zl',
    priceCraft: '180 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Assassin Blood',
    effect: '1k12 jed. zranění + Otrávení 24 hod. (ZH ODL SO 10)',
    category: 'jedy',
    rarity: 'Běžný',
    ingredients: ['Belladonna (bylina, SO 12)', 'Krysa žluč (od obří krysy)', 'Řepkový olej'],
    priceBuy: '150 zl',
    priceCraft: '60 zl',
    craftTime: '1 den',
  },
  {
    name: 'Midnight Tears',
    effect: 'Bez efektu do půlnoci, pak 9k6 jed. (ZH ODL SO 17)',
    category: 'jedy',
    rarity: 'Vzácný',
    ingredients: ['Půlnoční květ (SO 17, čerstvý, kvete jen o půlnoci)', 'Stínová esence (SO 15)', 'Černý jantar (minerál)'],
    priceBuy: '3 000 zl',
    priceCraft: '900 zl',
    craftTime: '5 dní',
  },
  // ─── OSTATNÍ ──────────────────────────────────────────
  {
    name: 'Lektvar zmenšení',
    effect: 'Zmenšení na Tiny po 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ['Prach z víly (od víly dobrovolně)', 'Mravenčí kyselina (z obřího mravence)', 'Borůvkový extrakt'],
    priceBuy: '300 zl',
    priceCraft: '120 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar růstu',
    effect: 'Zvětšení na Large po 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ['Obří houba (SO 13, temné lesy)', 'Kost obra (prach)', 'Dubová pryskyřice'],
    priceBuy: '300 zl',
    priceCraft: '120 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar iluzorního vzhledu',
    effect: 'Jako kouzlo Disguise Self po 1 hod.',
    category: 'ostatni',
    rarity: 'Běžný',
    ingredients: ['Chameleoní kůže (z chameleona)', 'Rtuťový květ (SO 12)', 'Popel z černého dřeva'],
    priceBuy: '150 zl',
    priceCraft: '60 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar vitality',
    effect: 'Odstraní vyčerpání, obnoví max HP na 1 den',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ['Ženšenový kořen (SO 13, vzácný)', 'Srdce vrány (ze starého havrana)', 'Zlatý prach (minerál, 10 zl)'],
    priceBuy: '500 zl',
    priceCraft: '200 zl',
    craftTime: '3 dny',
  },
  {
    name: 'Lektvar dlouhého dechu',
    effect: 'Nepotřebuje dýchat po 1 hod.',
    category: 'ostatni',
    rarity: 'Běžný',
    ingredients: ['Vzdušná houba (SO 12, jeskyně)', 'Medúzí extrakt (z medúzy)', 'Máta peprná'],
    priceBuy: '100 zl',
    priceCraft: '40 zl',
    craftTime: '1 den',
  },
  {
    name: 'Elixír zdraví',
    effect: 'Vyléčí všechny nemoci, jedy a stavy',
    category: 'ostatni',
    rarity: 'Velmi vzácný',
    ingredients: ['Slza draka (z živého draka)', 'Světluška jitřenky (SO 19, úsvit)', 'Prach z andělského pera'],
    priceBuy: '10 000 zl',
    priceCraft: '2 000 zl',
    craftTime: '14 dní',
  },
  {
    name: 'Lektvar odolnosti ohni',
    effect: 'Odolnost vůči ohnivému poškození 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ['Salamandří šupina (ohnivý salam.)', 'Červený korál (minerál)', 'Popel z ohnivého elementála'],
    priceBuy: '400 zl',
    priceCraft: '150 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar odolnosti chladu',
    effect: 'Odolnost vůči chladnému poškození 1 hod.',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ['Ledový mech (SO 14, arktické jeskyně)', 'Yetí srst (z yetiho)', 'Mentolový krystal'],
    priceBuy: '400 zl',
    priceCraft: '150 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar ohnivého dechu',
    effect: 'Výdech ohně: 4k6 v kuželu 4,5 m (3× za 1 hod.)',
    category: 'ostatni',
    rarity: 'Neobvyklý',
    ingredients: ['Dračí pepř (SO 14, sopečné oblasti)', 'Síra (minerál)', 'Alkohol (vysokoprocentní)'],
    priceBuy: '400 zl',
    priceCraft: '150 zl',
    craftTime: '2 dny',
  },
  {
    name: 'Lektvar tmavozraku',
    effect: 'Tmavozrak 18 m na 1 hodinu',
    category: 'ostatni',
    rarity: 'Běžný',
    ingredients: ['Oči jeskynní ryby', 'Houba temnosvitu (SO 11, jeskyně)', 'Odvar z kořene mrkve'],
    priceBuy: '120 zl',
    priceCraft: '50 zl',
    craftTime: '1 den',
  },
  {
    name: 'Lektvar mládí',
    effect: 'Sníží fyzický věk o 1k6+6 let (nevyléčí)',
    category: 'ostatni',
    rarity: 'Velmi vzácný',
    ingredients: ['Slza nymfy (dobrovolný dar)', 'Jablko ze stromu života (SO 20)', 'Diamantový prach (500 zl)'],
    priceBuy: '15 000 zl',
    priceCraft: '5 000 zl',
    craftTime: '21 dní',
  },
  {
    name: 'Univerzální rozpouštědlo',
    effect: 'Rozpustí jakékoli lepidlo (Sovereign Glue aj.)',
    category: 'ostatni',
    rarity: 'Legendární',
    ingredients: ['Sliz z vousatého ďábla', 'Kyselina z černého pudinka', 'Éterická sůl (SO 20)'],
    priceBuy: '50 000 zl',
    priceCraft: '15 000 zl',
    craftTime: '30 dní',
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

@Component({
  selector: 'potions-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="pt-wrap">
      <header class="pt-header">
        <h2 class="pt-title">🧪 Lektvary & Jedy – Receptář</h2>
        <p class="pt-subtitle">Přísady, ceny a čas vaření • Výroba je vždy levnější než nákup</p>
      </header>

      <div class="pt-filters">
        @for (cat of categories; track cat.key) {
          <button
            class="pt-filter-btn"
            [class.active]="activeCategory() === cat.key"
            (click)="activeCategory.set(cat.key)"
          >{{ cat.label }}</button>
        }
      </div>

      <div class="pt-search-row">
        <input
          class="pt-search"
          placeholder="Hledat lektvar…"
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
        />
      </div>

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
              <tr>
                <td class="col-name">
                  <div class="pt-name">{{ p.name }}</div>
                  <div class="pt-effect">{{ p.effect }}</div>
                </td>
                <td class="col-rarity"><span class="pt-tag" [attr.data-rarity]="p.rarity">{{ p.rarity }}</span></td>
                <td class="col-ingr">
                  <div class="pt-ingr">
                    @for (ing of p.ingredients; track ing) {
                      <span>{{ ing }}</span>
                    }
                  </div>
                </td>
                <td class="col-price">
                  <div class="pt-price-buy">{{ p.priceBuy }}</div>
                  <div class="pt-price-craft">⚗️ {{ p.priceCraft }}</div>
                </td>
                <td class="col-time">{{ p.craftTime }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="pt-empty">Žádné lektvary neodpovídají filtru.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <footer class="pt-footer">
        <p><strong>Pravidla výroby:</strong> Postava musí mít zdatnost v Alchymistické soupravě. Hod INT (Arkána) nebo MDR (Lékařství) proti SO dle vzácnosti. Neúspěch = ztráta ½ surovin.</p>
        <p><strong>SO vaření:</strong> Běžný = 10 • Neobvyklý = 15 • Vzácný = 20 • Velmi vzácný = 25 • Legendární = 30</p>
      </footer>
    </div>
  `,
  styles: `
    :host { display: block; overflow-y: auto; height: calc(100svh - 165px); min-height: 400px; }
    .pt-wrap { padding: 20px 28px 40px; max-width: 1200px; margin: 0 auto; font-family: sans-serif; color: #d4c9a0; }
    .pt-header { margin-bottom: 16px; }
    .pt-title { font-size: 20px; color: #e8c96a; margin: 0 0 4px; font-weight: 600; }
    .pt-subtitle { font-size: 12px; color: #9a8a6a; margin: 0; }

    .pt-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .pt-filter-btn {
      background: rgba(200,160,60,.08); border: 1px solid rgba(200,160,60,.2); border-radius: 6px;
      padding: 5px 14px; font-size: 12px; color: #9a8a6a; cursor: pointer; transition: all .15s;
      font-family: sans-serif;
    }
    .pt-filter-btn:hover { background: rgba(200,160,60,.15); color: #d4c9a0; border-color: rgba(200,160,60,.4); }
    .pt-filter-btn.active { background: rgba(200,160,60,.25); color: #e8c96a; border-color: rgba(200,160,60,.6); }

    .pt-search-row { margin-bottom: 14px; }
    .pt-search {
      width: 100%; max-width: 320px; padding: 7px 12px; font-size: 13px;
      background: rgba(200,160,60,.06); border: 1px solid rgba(200,160,60,.2); border-radius: 6px;
      color: #d4c9a0; outline: none; font-family: sans-serif;
    }
    .pt-search::placeholder { color: #7a6a58; }
    .pt-search:focus { border-color: rgba(200,160,60,.5); background: rgba(200,160,60,.1); }

    .pt-table-wrap { overflow-x: auto; }
    .pt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
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

    .pt-ingr { display: flex; flex-direction: column; gap: 2px; }
    .pt-ingr span { font-size: 12px; color: #b0a080; }
    .pt-ingr span::before { content: "· "; color: rgba(200,160,60,.5); }

    .pt-price-buy { font-size: 12px; color: #d4c9a0; white-space: nowrap; }
    .pt-price-craft { font-size: 11px; color: #8fc95a; white-space: nowrap; margin-top: 2px; }

    .pt-empty { text-align: center; color: #7a6a58; padding: 32px 0 !important; font-style: italic; }

    .pt-footer {
      margin-top: 20px; padding: 14px 16px; border-radius: 8px;
      background: rgba(200,160,60,.05); border: 1px solid rgba(200,160,60,.15);
    }
    .pt-footer p { margin: 4px 0; font-size: 12px; color: #9a8a6a; }
    .pt-footer strong { color: #d4c9a0; }
  `,
})
export class PotionsTabComponent {
  readonly categories = CATEGORY_LABELS;
  readonly activeCategory = signal<PotionCategory>('vse');
  readonly searchQuery = signal('');

  readonly filteredPotions = computed(() => {
    const cat = this.activeCategory();
    const q = this.searchQuery().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

    let result = POTIONS;

    if (cat !== 'vse') {
      result = result.filter(p => p.category === cat);
    }

    if (q.length >= 2) {
      result = result.filter(p => {
        const searchable = (p.name + ' ' + p.effect + ' ' + p.ingredients.join(' ') + ' ' + p.rarity)
          .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        return searchable.includes(q);
      });
    }

    return result;
  });
}

