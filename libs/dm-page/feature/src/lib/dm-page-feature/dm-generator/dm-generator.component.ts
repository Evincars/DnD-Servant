import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

// ── Random tables ─────────────────────────────────────────────────────────────

const MALE_NAMES = ['Aldric', 'Torvin', 'Bregan', 'Radovan', 'Dobromir', 'Záviš', 'Vladek', 'Ctirad', 'Ratibor', 'Dragomir', 'Borek', 'Miloslav', 'Přibor', 'Svetobor', 'Kazimír', 'Ondřej', 'Vojtěch', 'Stanko', 'Vítoslav', 'Bratumil', 'Grondar', 'Silvorn', 'Eldath', 'Mirko', 'Ranulf'];
const FEMALE_NAMES = ['Radana', 'Milena', 'Dobrava', 'Drahuše', 'Krasava', 'Slavěna', 'Světlana', 'Zora', 'Vlasta', 'Drahomíra', 'Lubomíra', 'Čestmíra', 'Bohdana', 'Přibylena', 'Radoslava', 'Bratlava', 'Serafína', 'Elowen', 'Morrigan', 'Sylvara', 'Thalindra', 'Věra', 'Dobroslava', 'Mirena', 'Liška'];
const EPITHETS = ['ze Stříbrné Hory', 'Krvavý', 'Moudrý', 'Lstivý', 'Temný', 'Věrný', 'Zlomený', 'Slepý', 'Rudý', 'Tichý', 'Hromobití', 'Zlatý', 'Chrabrý', 'ze Smolné Vesnice', 'Kamenotváří', 'Jarní', 'Šedý', 'Dvorní', 'z Popelového Hradu', 'Bláznivý', 'Dvoulicí', 'Věčný', 'Bezejmenný', 'Prokletý', 'Osudový'];
const RACES = ['Člověk', 'Elf', 'Trpaslík', 'Půlelf', 'Tiefling', 'Gnóm', 'Půlork', 'Drakorozený', 'Hobbit', 'Aasimar', 'Lesní elf', 'Skalní trpaslík'];
const ROLES = ['Obchodník', 'Kovář', 'Alchymista', 'Strážný', 'Šlechtic', 'Žebrák', 'Bard', 'Kněz', 'Čaroděj', 'Lovec', 'Sedlák', 'Zloděj', 'Hospodský', 'Žoldák', 'Průzkumník', 'Mág', 'Léčitelka', 'Námořník', 'Poutník', 'Inkvizitor'];
const MOTIVATIONS = ['hledá pomstu za smrt rodiny', 'snaží se splatit dluh', 'skrývá temné tajemství', 'touží po moci', 'chrání slabé', 'pronásleduje starou lásku', 'slouží tajné organizaci', 'přísahal věrnost zlomené přísaze', 'hledá ztracený artefakt', 'byl proklet a hledá lék', 'shromažďuje vědomosti o starobylé magii', 'je špion s dvojím životem', 'tají svůj skutečný původ', 'utekl z vězení a skrývá se', 'snaží se o vykoupení minulých zločinů'];
const QUIRKS = ['nervózně mrkají', 'pořád pošukávají minci v prstech', 'nikdy nekouká přímo do očí', 'mluví výhradně v příslovích', 'neustále si brumlají píseň', 'mají zvláštní šrám nebo tetování', 'vždy opakují poslední slovo věty', 'nikdy nepijí alkohol', 'jsou posedlí čistotou', 'smějí se i ve vážných chvílích', 'nosí starý lék v amuletu', 'dotekem se vyhýbají všemu kovu'];

const WEATHER = [
  '☀️ Jasná obloha, slunečný bezvětrný den. Výhled do dálky na kilometry.',
  '🌤 Lehké mraky, příjemné počasí. Teplý vánek ze západ.',
  '⛅ Zataženo, šedé nebe. Světlo je tupé a depresivní.',
  '🌦 Lehký déšť, mokrá půda. Stopy jsou dobře viditelné.',
  '🌧 Silný déšť s gustem. Cesty jsou rozblácené, viditelnost omezena.',
  '⛈ Bouřka s blesky a duněním hromu. Venkovní pohyb je nebezpečný.',
  '🌫 Hustá mlha sahající po kolena. Viditelnost jen 9 m.',
  '❄️ Sněhová přeháňka. Terén je kluzký (DC 10 Atletika/Akrobacie).',
  '💨 Silný vítr. Střelba postihem −2. Světla a ohně se obtížně udržují.',
  '🌡 Abnormální vedro — dusno, bez větru. Každou hodinu záchrana Odolnosti DC 10.',
  '🧊 Abnormální chlad — rty fialové, dech je vidět. Záchrana Odolnosti DC 12 každou hodinu.',
  '🔴 Tajemná červená obloha jako krev. Zvířata jsou neklidná, ptáci mlčí.',
  '🌈 Silné duhy po průtrži. Vidět je i zvláštní dvojitá duha na severu.',
  '⚡ Elektrostatický výboj ve vzduchu. Kovové předměty jiskří. Všichni cítí mravenčení.',
  '🌑 Přirozené zatmění slunce — den na hodinu potemněl jako noc.',
];

const ENCOUNTERS = [
  'Skupina 1k4+1 lupičů v záloze za balvany — čekají na osamělé cestovatele.',
  'Osamělý poutník s obvázanou nohou prosí o pomoc. (Skutečně zraněný, nebo past?)',
  'Obchodní karavana zastavila — jedno kolo vozu se zlomilo. Obchodník nabídne malou odměnu za pomoc.',
  'Zraněný voják v carských barvách lapá po dechu. Má u sebe zašifrovanou zprávu.',
  'Stádo 2k6 divokých koní prchá krajinou v panice — za nimi je slyšet vzdálené řvaní.',
  'Putující bard — hraje v přístřešku u cesty. Nabídne informaci za jeden zlatý nebo příběh.',
  'Skupina dětí hraje poblíž opuštěné věže. Říkají, že viděly světlo za oknem.',
  'Zbloudilý tvor z jiné sféry stojí zmateně uprostřed cesty. Neslyšitelně volá o pomoc.',
  'Starý lesní mudrc sbírá bylinky — hledá vzácnou složku, zaplatí cennou informací.',
  '1k4 kultistů provádí rituál v lese. Kdyby je hráči rušili, budou bojovat na smrt.',
  'Elfský průzkumník sleduje skupinu ze stromů — nechce být objeven.',
  'Skupina trpasličích prospektorů — vracejí se prázdní. Přišli o vše při přepadu v minách.',
  'Nekromantův asistent utekl s grimoárem — peníze si nese v vaku za zády.',
  'Místní farmář zoufalý: jeho dobytek byl nalezen mrtvý, vysátý. Bez ran.',
  'Skupinka 3 goblínů se hádá u rozdělané hranice. Zdá se, že mají ukradený předmět.',
];

const PLOT_HOOKS = [
  'Ve vesnici se pravidelně každý úplněk ztrácí jedno dítě. Místní mluví o "daní z lesů".',
  'Starý pergamen nalezený v zaprášené knihovně ukazuje mapu podzemních katakomb pod městem.',
  'Šlechtic nabídne velkou odměnu za hlavu outlawa — ale outlaw je ve skutečnosti nevinný.',
  'Chrám starého boha byl nalezen zdánlivě nedotčen — přesto všichni kněží zmizeli beze stopy.',
  'Kupec přijal zásilku, která "nemůže být otevřena". Nikdo neví, co je uvnitř.',
  'Řeka začala téct pozpátku. Zvířata přestala pít vodu. Druidský kruh žádá o pomoc.',
  'Král zemřel bez dědice — tři šlechtici si dělají nárok na trůn. Každý nabízí odměnu za podporu.',
  'Ve starém hradu byla nalezena místnost plná soch — všechny v postoji zděšení.',
  'Obchodník tvrdí, že mu byl ukraden vzorek mrtvého draka. Nyní je napaden vrahy.',
  'Slavný rytíř byl nalezen živý 10 let po své "smrti" — ale nevzpomíná si na nic.',
  'Hvězda na obloze zmizela. Astronomové říkají, že to je špatné znamení — a mají pravdu.',
  'Kult slibuje věčný život. Jejich členové se nestarají, co je třeba "obětovat".',
  'Mlýnský kamen se sám od sebe otáčí. Mouka, kterou mele, je černá jako uhlí.',
  'Nová silnice skrz Temný les — stavitelé jeden po druhém mizejí nebo se vrací šílení.',
  'Dopis adresovaný jednomu z hráčů čeká ve vesnické krčmě. Podepisuje se "Tvůj mrtvý příbuzný".',
];

const ROOMS = [
  'Nízká klenutá místnost zapáchající plísní a stojatou vodou. Na stropě visí netopýři.',
  'Velká síň s rozbitými sloupy. Podlaha je mozaiková, zobrazující bitvu bohů. Část chybí.',
  'Úzká chodba s šipkovými pastmi (spouštěcí plát v každém třetím dlaždici).',
  'Kruhová místnost s kruhovým oltářem uprostřed. Na oltáři leží čerstvé ovoce.',
  'Zásobárna s rozloženými přepravkami — vše dávno zhnilé. Svítí z kouta temná záře.',
  'Strážnice s dřevěnou tabulí. Na ní jsou jména stráží — poslední zápisek je 47 let starý.',
  'Dílna alchymisty. Na stole rozbitý retort, hnědá skvrna, stopy bot vedoucí ke zdi.',
  'Hrobka šlechtice — kamenný sarkofág, prázdný. Víko je odlomeno zevnitř.',
  'Knihovna s pobořenými regály. Knihy jsou beze slov — každá stránka prázdná.',
  'Komnata s ohromným zrcadlem. Odraz je zpožděný o vteřinu — a říká jiná slova.',
  'Nora vykopána do hlíny. Na stěnách škrábance — přesné znaky, ne zvířecí.',
  'Místnost plná zmrzlých vojáků. Tváře mají zkřivené v nadšeném úsměvu.',
  'Laboratoř s klecemi. Klece jsou prázdné, ale dveře jsou zamčeny zevnitř.',
  'Svatyně s fresky zobrazující "konec světa v šesti krocích". Jsme na 4. kroku.',
  'Průsečík čtyř chodeb. Uprostřed sedí kostra v meditační poloze s mincí v ruce.',
];

const COMPLICATIONS = [
  'Terén se zhroutí — jáma 3m hluboká se otevře pod jedním bojovníkem (záchrana Obratnosti DC 13).',
  'Ze stropu spadne krápník na náhodný cíl (1k6 drtivého poškození, záchrana DC 12).',
  'Přibyde posila! 1k4 dalších nepřátel dorazí z vedlejší místnosti ve 2. kole.',
  'Oheň! Jiskra zapálí suché seno — šíří se 1,5 m za kolo. Do 3 kol zaplní místnost dýmem.',
  'Jeden nepřítel vytáhne roh a přivolá posilu (dorazí za 3 kola, pokud není zastaven).',
  'Magická past se aktivuje — válec ohně projede 3m pásmem (záchrana Obratnosti DC 14, 3k6).',
  'Podlaha je kluzká (olej, led, sliz) — pohyb stojí 2× více pohybu.',
  'Jeden spojenec je sražen blíže k okraji srázu nebo hluboké jámy.',
  'Zbraň nebo předmět spadne do trhliny, průrvy nebo louže (Athletika DC 12 pro záchranu).',
  'Kovová mříž se spouští a rozdělí bojové pole na dvě části.',
  'Magická oblast potlačí kouzla na 1 kolo (antimagické pulzování z runy na zemi).',
  'Bitevní hluk přiláká 1k3 dalších monster z okolí (přijdou na konci kola 3).',
  'Jeden nepřítel najednou použije lektvar nebo zásobu, kterou jsme netušili.',
  'Strop se začíná pomalu propadat — za 5 kol celá místnost.',
  'Hostitel situace — nevinný svědek či zajatec utíká bojovým polem v panice.',
];

const LOOT_WEAPONS = [
  'Dýka — dobře udržovaná, kožený pochev',
  'Krátký meč — vyřezávaná rukojeť, drobné rýhy na čepeli',
  'Dlouhý meč — poškrábaný, ale plně funkční',
  'Ruční sekera — mírně otupená, dá se nabrousit',
  'Krátký luk + 1k6+3 šípů v kožené toulci',
  'Dlouhý luk (toulec prázdný)',
  'Lehká kuše + 1k6 šrotů v krabičce',
  'Válečné kladivo — otlučené, pevná rukojeť',
  'Kopí — dřevec prasklý, hrot neporušený (opravitelné)',
  'Palcát — ocelová hlava s malými ostny',
  'Šestipák — vhodný pro boj zblízka',
  'Sada 3 vrhacích nožů — dobré vyvážení',
  'Dřevěný štít s kovaným okrajem — pár škrábanců',
  'Prošívaná zbroj — potřebuje vyčistit',
  'Kožená zbroj — stará, ale funkční',
  'Hůl dubová okovaná železem',
  'Šavle s ozdobnou záštitou — bojová i dekorativní',
  'Luk lovecký střední — bez šípů, tetiva neporušena',
  'Těžká kuše — pomalá, ale silná střela (záchrana DC 14)',
  'Trident — tříhrotová zbraň, jedna zbroušena',
];

const LOOT_POTIONS_COMMON = [
  'Lektvar léčení 🧪 — obnoví 2k4+2 ŽB',
  'Lektvar protijed 🧪 — neutralizuje jeden jed (1 hodina)',
  'Lektvar skalního lezce 🧪 — šplhání bez rukou (1 hodina)',
  'Lektvar dýchání pod vodou 🧪 — 1 hodina',
  'Lektvar odolnosti vůči ohni 🧪 — odolnost vůči ohnivému zásahu (1 hodina)',
  'Lektvar tmavého vidění 🧪 — vidí ve tmě 18 m (8 hodin)',
  'Lektvar odolnosti vůči jedu 🧪 — výhoda na záchranné hody proti jedu (1 hodina)',
  'Lektvar dlouhého dechu 🧪 — zadržení dechu + bonus na Atletiku pod vodou (1 hodina)',
];

const LOOT_POTIONS_RARE = [
  'Lektvar vyššího léčení ✨ — obnoví 4k4+4 ŽB',
  'Lektvar neviditelnosti ✨ — trvá dokud nezaútočíš nebo nesešleš kouzlo',
  'Lektvar létání ✨ — rychlost letu 18 m (1 hodina)',
  'Lektvar obří síly (kopcová) ✨ — Síla 21 (1 hodina)',
  'Lektvar rychlosti ✨ — efekt Chvatu (1 minuta)',
  'Lektvar mistra léčení ✨ — obnoví 8k4+8 ŽB',
  'Lektvar nehmotnosti ✨ — procházej zdmi (1 min, záchrana Odolnosti DC 13 každé kolo)',
  'Lektvar přátelství se zvířaty ✨ — zvířata tě považují za přítele (24 hodin)',
  'Lektvar hrdinství ✨ — 10 dočasných ŽB + efekt Požehnání (1 minuta)',
];

const LOOT_MISC = [
  'Starý pergamen s mapou neznámého území',
  'Polodrahokam: tyrkys nebo granát — hodnota 15–25 zl',
  'Bronzový klíč s neznámou runou — k čemu patří?',
  'Šifrovaný dopis adresovaný „Poslednímu Strážci"',
  'Balíček exotického koření (30 zl pro správného kupce)',
  'Otrhaná kniha s ručně psanými kouzly — jedno je nečitelné',
  'Malovaný miniaturní portrét ušlechtilé osoby',
  'Kostka z kosti s vyrytými runami — při každém hodu padá 6?',
  'Trofej ze vzácného zvířete (parohy, šupiny, pírko) — 15–40 zl',
  'Obsidiánová figurka boha — kdo ho uctívá, pochopí hodnotu',
  'Zapečetěná schránka bez klíče (záchrana Obratnosti DC 13 na vypáčení)',
  'Stříbrná brož se znakem zapomenutého rodu — 20 zl',
  'Svazek kouzelných bylin — alchymistická surovina',
  'Prsten levného kovu s falešným drahokamem — ale co když je prokletý?',
  'Láhev neznámého nápoje — zelená, voní po hřebíčku a zemi',
];

const GEM_TABLE = [
  'tyrkys (10 zl)', 'ametyst (20 zl)', 'granát (25 zl)',
  'nefrit (50 zl)', 'opál (50 zl)', 'rubín (100 zl)', 'safír (100 zl)',
];

/** Returns a Czech-language gold description with a rolled amount */
function rollGoldEntry(): string {
  const r = Math.random();
  if (r < 0.35) {
    const gp = Math.floor(Math.random() * 12) + 1;
    const sp = Math.floor(Math.random() * 15);
    return `💰 ${gp} zlatých${sp > 0 ? ` a ${sp} stříbrných` : ''} v roztrhaném vaku`;
  } else if (r < 0.70) {
    const gp = Math.floor(Math.random() * 20) + 5;
    return `💰 ${gp} zlatých v kožené tobolce`;
  } else if (r < 0.90) {
    const gp = Math.floor(Math.random() * 30) + 15;
    return `💰 ${gp} zlatých v dřevěné krabičce`;
  } else {
    const gp = Math.floor(Math.random() * 40) + 20;
    return `💰 ${gp} zlatých + drahokam: ${rand(GEM_TABLE)}`;
  }
}

/**
 * Weighted loot roll:
 *  30 % → gold (computed amount)
 *  25 % → weapon / equipment
 *  18 % → common potion
 *  15 % → misc item / curiosity
 *  10 % → rare potion
 *   2 % → rare potion + bonus gold (jackpot)
 */
function rollLootWeighted(): string {
  const r = Math.random() * 100;
  if (r < 30)  return rollGoldEntry();
  if (r < 55)  return `⚔️ ${rand(LOOT_WEAPONS)}`;
  if (r < 73)  return rand(LOOT_POTIONS_COMMON);
  if (r < 88)  return rand(LOOT_MISC);
  if (r < 98)  return rand(LOOT_POTIONS_RARE);
  // 2 % jackpot
  const bonusGp = Math.floor(Math.random() * 30) + 10;
  return `🌟 ${rand(LOOT_POTIONS_RARE)} + ${bonusGp} zlatých jako bonus`;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

@Component({
  selector: 'dm-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatTooltip],
  styles: `
    :host { display: block; height: 100%; overflow-y: auto; padding: 24px 32px 40px; box-sizing: border-box; font-family: 'Mikadan', sans-serif; }

    /* ── Header ─────────────────────────────────── */
    .gen-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 14px; margin-bottom: 28px; padding-bottom: 14px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, transparent, rgba(60,140,200,.6) 20%, rgba(80,180,240,.8) 50%, rgba(60,140,200,.6) 80%, transparent) 1;
    }
    .gen-title {
      font-size: 22px; letter-spacing: .12em; text-transform: uppercase;
      color: #80c8f0; text-shadow: 0 0 18px rgba(60,140,200,.4), 0 0 4px rgba(60,140,200,.2);
      display: flex; align-items: center; gap: 10px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #4080c0; }
    }
    .gen-subtitle { font-size: 11px; color: rgba(60,140,200,.4); letter-spacing: .05em; margin-top: 5px; font-family: sans-serif; font-style: italic; text-transform: none; }

    .gen-reroll-all {
      font-family: 'Mikadan', sans-serif; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid rgba(60,140,200,.3); border-radius: 3px; background: rgba(60,140,200,.08);
      color: rgba(80,160,220,.8); padding: 6px 16px; cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      transition: background .18s, border-color .18s, color .18s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(60,140,200,.18); border-color: rgba(80,180,240,.5); color: #90d0f8; }
    }

    /* ── Grid of generator cards ─────────────────── */
    .gen-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }

    /* ── Single card ─────────────────────────────── */
    .gen-card {
      background: linear-gradient(160deg, rgba(28,22,14,.97) 0%, rgba(18,14,8,.99) 100%);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(0,0,0,.5);
      transition: border-color .2s, box-shadow .2s;
      position: relative;
      &:hover { border-color: rgba(255,255,255,.1); box-shadow: 0 6px 26px rgba(0,0,0,.6); }
      &::before { content: '◆'; position: absolute; top: 5px; left: 8px; font-size: 6px; color: rgba(255,255,255,.1); pointer-events: none; }

      // Per-card accent colour set as CSS custom property via a class (not Angular binding)
      &--npc          { --c: rgba(200,160,60,.85); }
      &--weather      { --c: rgba(80,160,220,.85); }
      &--encounter    { --c: rgba(200,80,60,.85);  }
      &--plot         { --c: rgba(100,180,80,.85); }
      &--room         { --c: rgba(160,100,200,.85);}
      &--complication { --c: rgba(200,120,40,.85); }
      &--loot         { --c: rgba(220,200,60,.85); }
    }

    .gen-card-rule {
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--c) 40%, var(--c) 60%, transparent);
      opacity: .5;
    }

    .gen-card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px 8px;
      border-bottom: 1px solid rgba(255,255,255,.05);
      background: rgba(0,0,0,.1);
    }
    .gen-card-icon {
      font-size: 17px !important; width: 17px !important; height: 17px !important;
      flex-shrink: 0; color: var(--c);
    }
    .gen-card-title {
      font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
      color: var(--c); flex: 1;
    }

    .gen-btn {
      font-family: 'Mikadan', sans-serif; font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
      border: 1px solid var(--c); border-radius: 2px;
      background: rgba(0,0,0,.2); color: var(--c);
      padding: 4px 12px; cursor: pointer;
      display: flex; align-items: center; gap: 4px;
      transition: background .15s, opacity .15s;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
      &:hover { background: rgba(255,255,255,.06); }
      &:active { opacity: .7; }
    }

    .gen-card-body { padding: 12px 14px 14px; min-height: 64px; }

    .gen-result {
      font-family: sans-serif; font-size: 12px; line-height: 1.6;
      color: #c0b8a8; transition: opacity .15s;
      &--empty { color: rgba(255,255,255,.18); font-style: italic; font-size: 11px; }
      &--fresh { animation: gen-fadein .25s ease; }
    }

    /* ── NPC special ─────────────────────────────── */
    .gen-npc-result {
      display: flex; flex-direction: column; gap: 4px;
    }
    .gen-npc-name {
      font-family: 'Mikadan', sans-serif; font-size: 15px; letter-spacing: .08em;
      color: #e8c96a; text-shadow: 0 0 8px rgba(200,160,60,.3);
    }
    .gen-npc-meta { font-family: sans-serif; font-size: 11px; color: rgba(200,180,120,.7); }
    .gen-npc-motivation { font-family: sans-serif; font-size: 11px; color: rgba(180,170,140,.75); font-style: italic; line-height: 1.5; }
    .gen-npc-quirk {
      font-family: sans-serif; font-size: 10px; color: rgba(160,160,140,.6);
      font-style: italic; border-top: 1px solid rgba(255,255,255,.05); margin-top: 4px; padding-top: 4px;
    }

    @keyframes gen-fadein {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: none; }
    }
  `,
  template: `
    <div class="gen-header">
      <div>
        <div class="gen-title"><mat-icon>casino</mat-icon>Generátor PH</div>
        <div class="gen-subtitle">Náhodné tabulky pro Pána Hry — jméno, počasí, setkání, zápletka a více</div>
      </div>
      <button class="gen-reroll-all" type="button" (click)="rerollAll()" matTooltip="Přegenerovat všechny tabulky">
        <mat-icon>refresh</mat-icon>Generovat vše
      </button>
    </div>

    <div class="gen-grid">

      <!-- NPC Card -->
      <div class="gen-card gen-card--npc">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">person</mat-icon>
          <span class="gen-card-title">Jméno NPC</span>
          <button class="gen-btn" type="button" (click)="rollNpc()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (npc()) {
            <div class="gen-npc-result gen-result--fresh">
              <span class="gen-npc-name">{{ npc()!.name }}</span>
              <span class="gen-npc-meta">{{ npc()!.race }} · {{ npc()!.role }}</span>
              <span class="gen-npc-motivation">„{{ npc()!.motivation }}"</span>
              <span class="gen-npc-quirk">Zvláštnost: {{ npc()!.quirk }}</span>
            </div>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

      <!-- Weather Card -->
      <div class="gen-card gen-card--weather">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">wb_cloudy</mat-icon>
          <span class="gen-card-title">Počasí</span>
          <button class="gen-btn" type="button" (click)="rollWeather()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (weather()) {
            <span class="gen-result gen-result--fresh">{{ weather() }}</span>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

      <!-- Encounter Card -->
      <div class="gen-card gen-card--encounter">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">warning</mat-icon>
          <span class="gen-card-title">Náhodné setkání</span>
          <button class="gen-btn" type="button" (click)="rollEncounter()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (encounter()) {
            <span class="gen-result gen-result--fresh">{{ encounter() }}</span>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

      <!-- Plot Hook Card -->
      <div class="gen-card gen-card--plot">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">psychology</mat-icon>
          <span class="gen-card-title">Zápletka</span>
          <button class="gen-btn" type="button" (click)="rollPlot()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (plot()) {
            <span class="gen-result gen-result--fresh">{{ plot() }}</span>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

      <!-- Room Description Card -->
      <div class="gen-card gen-card--room">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">door_back</mat-icon>
          <span class="gen-card-title">Popis místnosti</span>
          <button class="gen-btn" type="button" (click)="rollRoom()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (room()) {
            <span class="gen-result gen-result--fresh">{{ room() }}</span>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

      <!-- Combat Complication Card -->
      <div class="gen-card gen-card--complication">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">bolt</mat-icon>
          <span class="gen-card-title">Bojová komplikace</span>
          <button class="gen-btn" type="button" (click)="rollComplication()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (complication()) {
            <span class="gen-result gen-result--fresh">{{ complication() }}</span>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

      <!-- Loot Card -->
      <div class="gen-card gen-card--loot">
        <div class="gen-card-rule"></div>
        <div class="gen-card-header">
          <mat-icon class="gen-card-icon">auto_awesome</mat-icon>
          <span class="gen-card-title">Kořist</span>
          <button class="gen-btn" type="button" (click)="rollLoot()"><mat-icon>shuffle</mat-icon>Generovat</button>
        </div>
        <div class="gen-card-body">
          @if (loot()) {
            <span class="gen-result gen-result--fresh">{{ loot() }}</span>
          } @else {
            <span class="gen-result gen-result--empty">Klikni Generovat…</span>
          }
        </div>
      </div>

    </div>
  `,
})
export class DmGeneratorComponent {
  npc         = signal<{ name: string; race: string; role: string; motivation: string; quirk: string } | null>(null);
  weather     = signal<string | null>(null);
  encounter   = signal<string | null>(null);
  plot        = signal<string | null>(null);
  room        = signal<string | null>(null);
  complication = signal<string | null>(null);
  loot        = signal<string | null>(null);

  rollNpc(): void {
    const isMale = Math.random() < .5;
    const firstName = rand(isMale ? MALE_NAMES : FEMALE_NAMES);
    const epithet   = rand(EPITHETS);
    const name      = `${firstName} ${epithet}`;
    this.npc.set({
      name,
      race:       rand(RACES),
      role:       rand(ROLES),
      motivation: rand(MOTIVATIONS),
      quirk:      rand(QUIRKS),
    });
  }

  rollWeather():      void { this.weather.set(rand(WEATHER)); }
  rollEncounter():    void { this.encounter.set(rand(ENCOUNTERS)); }
  rollPlot():         void { this.plot.set(rand(PLOT_HOOKS)); }
  rollRoom():         void { this.room.set(rand(ROOMS)); }
  rollComplication(): void { this.complication.set(rand(COMPLICATIONS)); }
  rollLoot():         void { this.loot.set(rollLootWeighted()); }

  rerollAll(): void {
    this.rollNpc();
    this.rollWeather();
    this.rollEncounter();
    this.rollPlot();
    this.rollRoom();
    this.rollComplication();
    this.rollLoot();
  }
}

