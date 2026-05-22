import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

// ── Search helpers ────────────────────────────────────────────────────────────

function normSearch(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// ── Reference data ─────────────────────────────────────────────────────────────

interface Section {
  id: string;
  category: string;
  title: string;
  html: string;
  search: string; // plain-text for filtering
}

const SECTIONS: Section[] = [
  // ──────────────────────────────── KOSTKY & HODY
  {
    id: 'dc-table',
    category: 'Hody kostkami',
    title: 'Stupně obtíže (SO)',
    search: 'stupen obtiznosti SO lehky stredni tezky nerozhodni mozny',
    html: `
<table class="sc-table">
  <thead><tr><th>Obtížnost</th><th>SO</th></tr></thead>
  <tbody>
    <tr><td>Velmi lehká</td><td>5</td></tr>
    <tr><td>Lehká</td><td>10</td></tr>
    <tr><td>Střední</td><td class="sc-accent">15</td></tr>
    <tr><td>Těžká</td><td>20</td></tr>
    <tr><td>Velmi těžká</td><td>25</td></tr>
    <tr><td>Téměř nemožná</td><td>30</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'advantage',
    category: 'Hody kostkami',
    title: 'Výhoda a nevýhoda',
    search: 'vyhoda nevyhoda 2k20 vybrat vyssi nizsi rusi navzajem',
    html: `
<div class="sc-box">
  <p><strong>Výhoda:</strong> hod 2k20, použij <em>vyšší</em> výsledek.</p>
  <p><strong>Nevýhoda:</strong> hod 2k20, použij <em>nižší</em> výsledek.</p>
  <p class="sc-note">Výhody a nevýhody se <strong>nesčítají</strong> — jedna Výhoda a jedna (nebo více) Nevýhoda se navzájem zcela ruší; nezáleží na počtu.</p>
</div>`,
  },
  {
    id: 'proficiency',
    category: 'Hody kostkami',
    title: 'Zdatnostní bonus',
    search: 'zdatnost bonus uroven level pricitani',
    html: `
<table class="sc-table">
  <thead><tr><th>Úroveň</th><th>Bonus zdatnosti</th></tr></thead>
  <tbody>
    <tr><td>1–4</td><td>+2</td></tr>
    <tr><td>5–8</td><td>+3</td></tr>
    <tr><td>9–12</td><td>+4</td></tr>
    <tr><td>13–16</td><td>+5</td></tr>
    <tr><td>17–20</td><td>+6</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'passive-check',
    category: 'Hody kostkami',
    title: 'Pasivní ověření',
    search: 'pasivni overeni vnimani 10 bonus dovednost',
    html: `
<div class="sc-box">
  <p><strong>Pasivní ověření = 10 + všechny opravy a bonusy k danému hodu</strong></p>
  <p class="sc-note">Výhoda přidá +5, nevýhoda odečte −5.</p>
</div>`,
  },
  // ──────────────────────────────── AKCE V BOJI
  {
    id: 'combat-actions',
    category: 'Akce v boji',
    title: 'Přehled akcí',
    search: 'akce utok kouzlit sprint huybani pomoc schovat priprva',
    html: `
<table class="sc-table">
  <thead><tr><th>Akce</th><th>Popis</th></tr></thead>
  <tbody>
    <tr><td><strong>Útok</strong></td><td>Jeden nebo více útoků zbraní (dle schopnosti Útok navíc).</td></tr>
    <tr><td><strong>Sesílání kouzla</strong></td><td>Sesli kouzlo s dobou seslání 1 Akce.</td></tr>
    <tr><td><strong>Sprint</strong></td><td>Pohyb se zdvojnásobí do konce kola.</td></tr>
    <tr><td><strong>Uhýbání</strong></td><td>Všechny útoky na tebe mají nevýhodu; záchranné hody na Obratnost se zdarem.</td></tr>
    <tr><td><strong>Pomoc</strong></td><td>Cíl získá Výhodu k dalšímu ověření dovednosti nebo útoku.</td></tr>
    <tr><td><strong>Skrytí</strong></td><td>Ověření Nenápadnosti — při úspěchu jsi Skrytý.</td></tr>
    <tr><td><strong>Příprava</strong></td><td>Urči reakci + spouštěcí podmínku; provedení jako Reakce.</td></tr>
    <tr><td><strong>Hledání</strong></td><td>Ověření Vnímání nebo Pátrání.</td></tr>
    <tr><td><strong>Použití předmětu</strong></td><td>Interakce s předmětem nebo prostředím (nad rámec volné interakce).</td></tr>
    <tr><td><strong>Pomocník</strong></td><td>Přivolání nebo řízení pomocníka/jezdce.</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'bonus-action',
    category: 'Akce v boji',
    title: 'Bonusová akce a reakce',
    search: 'bonusova akce reakce prikouzelni prisliba',
    html: `
<div class="sc-box">
  <p><strong>Bonusová akce:</strong> Pouze pokud ji uděluje konkrétní schopnost, kouzlo nebo pravidlo. Každé kolo max 1 bonusová akce.</p>
  <p><strong>Reakce:</strong> Max 1 za kolo. Příklady: Příležitostný útok, Zachycení kouzla, Připravená akce.</p>
</div>`,
  },
  {
    id: 'opportunity-attack',
    category: 'Akce v boji',
    title: 'Příležitostný útok',
    search: 'prilezitostny utok reakece opustit dosah',
    html: `
<div class="sc-box">
  <p>Spustí se, když nepřítel <strong>dobrovolně opustí tvůj dosah</strong>.</p>
  <p>Utracena Reakce. Jeden útok na útěkající cíl.</p>
  <p class="sc-note">Výjimky: teleportace, unošení, Sprint při ústupu se Sprintem.</p>
</div>`,
  },
  {
    id: 'grapple-shove',
    category: 'Akce v boji',
    title: 'Uchopení a strčení',
    search: 'uchopeni strceni graple shove akrobacie atletika',
    html: `
<table class="sc-table">
  <thead><tr><th>Manévr</th><th>Útočník</th><th>Obránce</th><th>Efekt při úspěchu</th></tr></thead>
  <tbody>
    <tr><td><strong>Uchopení</strong></td><td>Atletika</td><td>Atletika nebo Akrobacie</td><td>Rychlost cíle 0</td></tr>
    <tr><td><strong>Strčení</strong></td><td>Atletika</td><td>Atletika nebo Akrobacie</td><td>Sražen nebo odtlačen 1,5 m</td></tr>
  </tbody>
</table>`,
  },
  // ──────────────────────────────── POHYB
  {
    id: 'movement',
    category: 'Pohyb a vzdálenosti',
    title: 'Pohyb v boji',
    search: 'pohyb rychlost kolo rozdeleni tezky teren',
    html: `
<div class="sc-box">
  <p>Pohyb můžeš <strong>rozdělit</strong> okolo útoků a akcí v libovolném pořadí.</p>
  <p><strong>Těžký terén:</strong> každý metr stojí 2 m pohybu.</p>
  <p><strong>Plazení / lezení:</strong> každý metr stojí 2 m pohybu (+ těžký terén dává 3 m za metr).</p>
  <p><strong>Skákání:</strong> dálkový skok = body Síly (s rozeběhem) nebo polovina body Síly (bez rozeběhu).</p>
  <p><strong>Pád:</strong> 1k6 drtivého za každých 3 m (max 20k6), rychlost 60 m/kolo.</p>
</div>`,
  },
  {
    id: 'cover',
    category: 'Pohyb a vzdálenosti',
    title: 'Krytí',
    search: 'krytí cover sklon polokrytí celkové bonus OČ záchrana',
    html: `
<table class="sc-table">
  <thead><tr><th>Typ krytí</th><th>Bonus OČ</th><th>Záchranné hody na Obr</th></tr></thead>
  <tbody>
    <tr><td><strong>Poloviční</strong> (1/2)</td><td>+2</td><td>+2</td></tr>
    <tr><td><strong>Tříčtvrtinové</strong> (3/4)</td><td>+5</td><td>+5</td></tr>
    <tr><td><strong>Úplné</strong></td><td colspan="2">Cíl nelze přímo zasáhnout</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'vision',
    category: 'Pohyb a vzdálenosti',
    title: 'Viditelnost a světlo',
    search: 'viditelnost svetlo tma stin neviditelny zasazeny skryt',
    html: `
<table class="sc-table">
  <thead><tr><th>Prostředí</th><th>Efekt</th></tr></thead>
  <tbody>
    <tr><td><strong>Slabé osvětlení</strong></td><td>Nevýhoda k Vnímání spoléhajícímu na zrak</td></tr>
    <tr><td><strong>Tma</strong> (bez tmavozraku)</td><td>Prakticky slepý (nevýhoda k útoku, výhoda nepřítele k útoku)</td></tr>
    <tr><td><strong>Neviditelný útočník</strong></td><td>Výhoda k útoku; obránce má nevýhodu</td></tr>
    <tr><td><strong>Skrytý</strong></td><td>Útok odtajní pozici; poté výhoda k prvnímu útoku</td></tr>
  </tbody>
</table>`,
  },
  // ──────────────────────────────── ÚTOK
  {
    id: 'attack-roll',
    category: 'Útok',
    title: 'Hod na útok',
    search: 'utok hod k20 bonus zbrane sila obratnost zasah OC',
    html: `
<div class="sc-box sc-box--formula">
  <p><strong>Útok na blízko:</strong> k20 + Oprava Síly + Zdatnostní bonus (pokud zdatný)</p>
  <p><strong>Útok na dálku:</strong> k20 + Oprava Obratnosti + Zdatnostní bonus</p>
  <p><strong>Útok kouzlem:</strong> k20 + Sesílací oprava vlastnosti + Zdatnostní bonus</p>
  <p class="sc-note">Přirozený 20 = vždy Zásah (kritický). Přirozená 1 = vždy minutí.</p>
</div>`,
  },
  {
    id: 'critical-hit',
    category: 'Útok',
    title: 'Kritický zásah',
    search: 'kriticky zasah k20 padne dvakrat kostky zasah',
    html: `
<div class="sc-box">
  <p>Při kritickém zásahu (přirozená 20) hoď <strong>dvakrát</strong> všechny kostky zásahu a přidej opravy jako obvykle.</p>
  <p class="sc-note">Některé schopnosti rozšiřují rozmezí kritického zásahu (např. na 19–20).</p>
</div>`,
  },
  {
    id: 'two-weapon',
    category: 'Útok',
    title: 'Boj dvěma zbraněmi',
    search: 'boj dvema zbranemi lehka ruka bonusova akce druha zbran',
    html: `
<div class="sc-box">
  <p>Pokud útočíš <strong>lehkou zbraní</strong> v jedné ruce, můžeš jako Bonusovou akci zaútočit druhou <strong>lehkou zbraní</strong> v druhé ruce.</p>
  <p class="sc-note">K zásahu druhé zbraně se <strong>nepřičítá</strong> oprava vlastnosti (pokud není záporná).</p>
</div>`,
  },
  {
    id: 'ranged-in-melee',
    category: 'Útok',
    title: 'Útok na dálku v těsném boji',
    search: 'utoky dalku tesnoboj nevyhoda luk kuše hod',
    html: `
<div class="sc-box">
  <p>Útok na dálku nebo hozenou zbraní <strong>v dosahu nepřítele</strong> má nevýhodu.</p>
</div>`,
  },
  // ──────────────────────────────── PODMÍNKY
  {
    id: 'condition-blinded',
    category: 'Podmínky',
    title: 'Oslepení',
    search: 'oslepeni nevyhoda utok nemuze videt',
    html: `<div class="sc-card"><div class="sc-card-header">Oslepení</div><ul class="sc-list"><li>Nemůže vidět; automaticky neúspěšné ověření vyžadující zrak.</li><li>Nevýhoda k hodům na útok; útočníci mají výhodu.</li></ul></div>`,
  },
  {
    id: 'condition-charmed',
    category: 'Podmínky',
    title: 'Zmámení',
    search: 'zmameni charmed nemuze utocit vyhoda interakce',
    html: `<div class="sc-card"><div class="sc-card-header">Zmámení</div><ul class="sc-list"><li>Zmámený tvor nemůže útočit na zmámatele ani ho vybírat jako cíl kouzla.</li><li>Zmamatel má výhodu k ověření dovedností v sociálních interakcích s tvorem.</li></ul></div>`,
  },
  {
    id: 'condition-frightened',
    category: 'Podmínky',
    title: 'Vystrašení',
    search: 'vystrašeny strach nevyhoda blizkoste zdroje',
    html: `<div class="sc-card"><div class="sc-card-header">Vystrašení</div><ul class="sc-list"><li>Nevýhoda k hodům na schopnosti a útokům, pokud je zdroj strachu v dohledu.</li><li>Tvor se nesmí dobrovolně blížit ke zdroji strachu.</li></ul></div>`,
  },
  {
    id: 'condition-grappled',
    category: 'Podmínky',
    title: 'Uchopení',
    search: 'uchopeni rychlost 0 eliminace',
    html: `<div class="sc-card"><div class="sc-card-header">Uchopení</div><ul class="sc-list"><li>Rychlost tvora je 0 (nelze ji žádným způsobem zvýšit).</li><li>Stav skončí, pokud uchopitel vyřazen nebo tvor vymanění (Atletika / Akrobacie).</li></ul></div>`,
  },
  {
    id: 'condition-incapacitated',
    category: 'Podmínky',
    title: 'Neschopný',
    search: 'neschopny akce bonusova akce nemuze provest',
    html: `<div class="sc-card"><div class="sc-card-header">Neschopný</div><ul class="sc-list"><li>Nemůže provádět akce ani bonusové akce.</li></ul></div>`,
  },
  {
    id: 'condition-invisible',
    category: 'Podmínky',
    title: 'Neviditelný',
    search: 'neviditelny skryty vyhoda utok skrytí',
    html: `<div class="sc-card"><div class="sc-card-header">Neviditelný</div><ul class="sc-list"><li>Nelze ho spatřit bez speciálních smyslů; pozice lze odhalit hlukem nebo stopami.</li><li>Výhoda k útoku; útočníci mají nevýhodu.</li></ul></div>`,
  },
  {
    id: 'condition-paralyzed',
    category: 'Podmínky',
    title: 'Paralýza',
    search: 'paralyzovany neschopny nemuze pohybovat automaticky kriticke zasahy',
    html: `<div class="sc-card"><div class="sc-card-header">Paralýza</div><ul class="sc-list"><li>Je Neschopný a nemůže se pohybovat ani mluvit.</li><li>Automaticky neúspěšné záchranné hody na Sílu a Obratnost.</li><li>Útočníci mají výhodu; zásahy na dosah do 1,5 m jsou automaticky kritické.</li></ul></div>`,
  },
  {
    id: 'condition-petrified',
    category: 'Podmínky',
    title: 'Zkamenění',
    search: 'zkamenely zkameneni transformace neorganicka nemuze pohybovat',
    html: `<div class="sc-card"><div class="sc-card-header">Zkamenění</div><ul class="sc-list"><li>Proměněn v tuhý neorganický materiál; je Neschopný, nemůže se pohybovat ani mluvit.</li><li>Imunní vůči jedu a nemoci; odolný vůči všem poškozením; nemůže hromadit nemoci ani jed.</li><li>Automaticky neúspěšné záchranné hody na Sílu a Obratnost; útočníci mají výhodu.</li></ul></div>`,
  },
  {
    id: 'condition-poisoned',
    category: 'Podmínky',
    title: 'Otravení',
    search: 'otraveny nevyhoda utoky overeni vlastnosti',
    html: `<div class="sc-card"><div class="sc-card-header">Otravení</div><ul class="sc-list"><li>Nevýhoda k hodům na útok a ověřením vlastností.</li></ul></div>`,
  },
  {
    id: 'condition-prone',
    category: 'Podmínky',
    title: 'Sražení / Ležící',
    search: 'sraze lezel prone vzprimat nevyhoda utok dosah dalku',
    html: `<div class="sc-card"><div class="sc-card-header">Sražení / Ležící</div><ul class="sc-list"><li>Nevýhoda k hodům na útok.</li><li>Útočník na dosah má výhodu; útok na dálku má nevýhodu.</li><li>Vzpřímení stojí polovinu pohybu kola.</li></ul></div>`,
  },
  {
    id: 'condition-restrained',
    category: 'Podmínky',
    title: 'Zadržení',
    search: 'zadrzeny rychlost 0 nevyhoda utok zachrana obratnost',
    html: `<div class="sc-card"><div class="sc-card-header">Zadržení</div><ul class="sc-list"><li>Rychlost 0 (nelze ji zvýšit).</li><li>Nevýhoda k hodům na útok; útočníci mají výhodu.</li><li>Nevýhoda k záchranným hodům na Obratnost.</li></ul></div>`,
  },
  {
    id: 'condition-stunned',
    category: 'Podmínky',
    title: 'Omráčení',
    search: 'omraceny neschopny nemuze pohybovat automaticky neuspesne sila obratnost',
    html: `<div class="sc-card"><div class="sc-card-header">Omráčení</div><ul class="sc-list"><li>Je Neschopný a nemůže se pohybovat; může jen slabě mluvit.</li><li>Automaticky neúspěšné záchranné hody na Sílu a Obratnost.</li><li>Útočníci mají výhodu.</li></ul></div>`,
  },
  {
    id: 'condition-unconscious',
    category: 'Podmínky',
    title: 'Bezvědomí',
    search: 'bezvedomi neschopny sraze automaticky kriticke zasahy',
    html: `<div class="sc-card"><div class="sc-card-header">Bezvědomí</div><ul class="sc-list"><li>Je Neschopný, nemůže se pohybovat ani mluvit; neví o svém okolí.</li><li>Upustí vše, co drží; je Sražený.</li><li>Automaticky neúspěšné záchranné hody na Sílu a Obratnost.</li><li>Zásahy z dosahu do 1,5 m jsou automaticky kritické.</li></ul></div>`,
  },
  // ──────────────────────────────── ŽIVOTY & LÉČENÍ
  {
    id: 'death-saves',
    category: 'Životy & Léčení',
    title: 'Záchranné hody na smrt',
    search: 'zachrana smrt 0 zivotu vyrazeni tri uspechy neuspechy',
    html: `
<div class="sc-box">
  <p>Po pádu na 0 ŽB: na začátku tahu hod k20.</p>
  <ul class="sc-list">
    <li><strong>10 a více</strong> = 1 úspěch <span class="sc-ok">✓</span></li>
    <li><strong>9 a méně</strong> = 1 neúspěch <span class="sc-fail">✗</span></li>
    <li><strong>Přirozená 20</strong> = obnovit 1 ŽB a vstát</li>
    <li><strong>Přirozená 1</strong> = 2 neúspěchy</li>
    <li><strong>3 úspěchy</strong> = stabilizace; <strong>3 neúspěchy</strong> = smrt</li>
    <li>Zasaženost = +1 neúspěch; zásah z dosahu z blízka = kritický +2 neúspěchy</li>
  </ul>
</div>`,
  },
  {
    id: 'healing',
    category: 'Životy & Léčení',
    title: 'Léčení a stabilizace',
    search: 'leceni stabilizace druh obnova zivotu',
    html: `
<div class="sc-box">
  <p><strong>Použi akci</strong> + ověření Lékařství SO 10 → stabilizace (zastaví záchranné hody na smrt).</p>
  <p>Jakékoliv léčení při 0 ŽB okamžitě obnoví ŽB a tvor vstane (je-li vědom).</p>
  <p><strong>Krátký odpočinek:</strong> Utracení Kostek životů k obnově ŽB (hod + oprava Odolnosti).</p>
  <p><strong>Dlouhý odpočinek:</strong> Plná obnova ŽB + polovina max Kostek životů zpět.</p>
</div>`,
  },
  {
    id: 'resting',
    category: 'Životy & Léčení',
    title: 'Odpočinek',
    search: 'kratky dlouhy odpocinke kostek zivotu magie kouzla obnova',
    html: `
<table class="sc-table">
  <thead><tr><th>Odpočinek</th><th>Délka</th><th>Obnova</th></tr></thead>
  <tbody>
    <tr><td><strong>Krátký</strong></td><td>min. 1 hodina</td><td>Utracení Kostek životů k léčení</td></tr>
    <tr><td><strong>Dlouhý</strong></td><td>min. 8 hodin (z toho max 2 h hlídka)</td><td>Plné ŽB; polovina max Kostek životů zpět; kouzla dle třídy</td></tr>
  </tbody>
</table>`,
  },
  // ──────────────────────────────── MAGIE
  {
    id: 'spell-casting',
    category: 'Magie',
    title: 'Základy sesílání kouzel',
    search: 'kouzlo sesilani slot stupen doba sesilani akce bonus reakce minuta',
    html: `
<div class="sc-box">
  <p><strong>SO záchranného hodu kouzla</strong> = 8 + Zdatnostní bonus + Sesílací oprava vlastnosti</p>
  <p><strong>Hod na útok kouzlem</strong> = k20 + Zdatnostní bonus + Sesílací oprava vlastnosti</p>
  <p class="sc-note">Sesilatel nemůže sesílat kouzla vyšší než 5. stupně při nasazené Těžké zbroji bez zdatnosti.</p>
</div>`,
  },
  {
    id: 'concentration',
    category: 'Magie',
    title: 'Soustředění',
    search: 'soustredeni koncentrace prerusit zasah zachrana odolnost polovina',
    html: `
<div class="sc-box">
  <p>Soustředění přerušuje:</p>
  <ul class="sc-list">
    <li>Nové kouzlo vyžadující soustředění.</li>
    <li>Zásah → záchranný hod na Odolnost SO = max(10; polovina přijatého poškození).</li>
    <li>Neschopnost nebo smrt.</li>
    <li>Dobrovolné přerušení (zdarma kdykoliv).</li>
  </ul>
</div>`,
  },
  {
    id: 'spell-components',
    category: 'Magie',
    title: 'Složky kouzel',
    search: 'slozky kouzlo verbalni somaticke materialn ohnisko vak',
    html: `
<table class="sc-table">
  <thead><tr><th>Složka</th><th>Potřeba</th><th>Blokováno</th></tr></thead>
  <tbody>
    <tr><td><strong>V</strong> – verbální</td><td>Schopnost mluvit</td><td>Ztišení, roubík</td></tr>
    <tr><td><strong>S</strong> – somatická</td><td>Volná ruka</td><td>Spoutání, Paralýza</td></tr>
    <tr><td><strong>M</strong> – materiální</td><td>Komponenta nebo ohnisko v ruce</td><td>Ztráta komponent</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'spell-areas',
    category: 'Magie',
    title: 'Oblasti účinku kouzel',
    search: 'oblast kuzela kupa cyvalec line vlna koule krychle',
    html: `
<table class="sc-table">
  <thead><tr><th>Oblast</th><th>Popis (příklad)</th></tr></thead>
  <tbody>
    <tr><td><strong>Kužel</strong></td><td>Rozšiřuje se od bodu v ruce: 60° do dané délky.</td></tr>
    <tr><td><strong>Krychle</strong></td><td>Krychlový prostor; hrana určena v popisu.</td></tr>
    <tr><td><strong>Válec</strong></td><td>Střed + poloměr + výška.</td></tr>
    <tr><td><strong>Linie</strong></td><td>Přímý pruh: délka × šířka dány kouzlem.</td></tr>
    <tr><td><strong>Koule</strong></td><td>Poloměr od bodu, ve vzduchu nebo na zemi.</td></tr>
  </tbody>
</table>`,
  },
  // ──────────────────────────────── SKUPINOVÉ ZÁCHRANNÉ HODY
  {
    id: 'group-saves',
    category: 'Záchranné hody',
    title: 'Skupinový záchranný hod',
    search: 'skupinovy zachranný hod polovina uspechu',
    html: `
<div class="sc-box">
  <p>Pokud celá skupina má provést záchranný hod, PH může vyžadovat jediný „skupinový" výsledek:</p>
  <p>Pokud alespoň <strong>polovina</strong> skupiny uspěje, celá skupina uspěje.</p>
</div>`,
  },
  {
    id: 'saving-throws-overview',
    category: 'Záchranné hody',
    title: 'Přehled záchranných hodů',
    search: 'zachrana sila obratnost odolnost inteligence moudrost charisma pouziti',
    html: `
<table class="sc-table">
  <thead><tr><th>Vlastnost</th><th>Typický příklad</th></tr></thead>
  <tbody>
    <tr><td><strong>Síla</strong></td><td>Odolání tlakovému efektu, uchvácení, povalení</td></tr>
    <tr><td><strong>Obratnost</strong></td><td>Plocha účinku (Ohnivá koule), past, padat z výšky</td></tr>
    <tr><td><strong>Odolnost</strong></td><td>Jed, nemoc, soustředění kouzla</td></tr>
    <tr><td><strong>Inteligence</strong></td><td>Iluzorní magie, mentální útoky</td></tr>
    <tr><td><strong>Moudrost</strong></td><td>Kouzlo strachu, zmámení, ovládání mysli</td></tr>
    <tr><td><strong>Charisma</strong></td><td>Vymítání, sféry, teleportace</td></tr>
  </tbody>
</table>`,
  },
  // ──────────────────────────────── PROSTŘEDÍ
  {
    id: 'hazards',
    category: 'Prostředí a nebezpečí',
    title: 'Pád, udušení, hladovění',
    search: 'pad udusen hladoveni voda tonout zima vedro',
    html: `
<table class="sc-table">
  <thead><tr><th>Nebezpečí</th><th>Pravidlo</th></tr></thead>
  <tbody>
    <tr><td><strong>Pád</strong></td><td>1k6 drtivého za každé 3 m pádu (max 20k6).</td></tr>
    <tr><td><strong>Udušení</strong></td><td>Zadržení dechu: 1 + oprava Odolnosti minut. Poté záchrana Odol DC 10 (+5 každé kolo); při neúspěchu 0 ŽB.</td></tr>
    <tr><td><strong>Hladovění</strong></td><td>Max Vyčerpání 3, pak smrt. 1 úroveň po dni bez jídla (nad ½ denní normy).</td></tr>
    <tr><td><strong>Extrémní chlad</strong></td><td>Záchrana Odolnosti DC 10 (+1 každou hodinu); při neúspěchu 1 úroveň Vyčerpání. S odolností na mráz imunní.</td></tr>
    <tr><td><strong>Extrémní teplo</strong></td><td>Záchrana Odolnosti DC 5 (+1 každou hodinu); při neúspěchu 1 úroveň Vyčerpání.</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'exhaustion',
    category: 'Prostředí a nebezpečí',
    title: 'Vyčerpání',
    search: 'vycerpani uroven efekty kumulativni',
    html: `
<table class="sc-table">
  <thead><tr><th>Úroveň</th><th>Efekt</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Nevýhoda k ověřením dovedností</td></tr>
    <tr><td>2</td><td>Rychlost snížena na polovinu</td></tr>
    <tr><td>3</td><td>Nevýhoda k hodům na útok a záchranným hodům</td></tr>
    <tr><td>4</td><td>Maximální ŽB snížena na polovinu</td></tr>
    <tr><td>5</td><td>Rychlost snížena na 0</td></tr>
    <tr><td>6</td><td>Smrt</td></tr>
  </tbody>
</table>
<p class="sc-note" style="margin-top:6px">Efekty jsou kumulativní. Každý dlouhý odpočinek sníží úroveň Vyčerpání o 1.</p>`,
  },
  {
    id: 'travel-pace',
    category: 'Prostředí a nebezpečí',
    title: 'Tempo cestování',
    search: 'cestovani tempo pohyb km hodina pomale normalni rychle',
    html: `
<table class="sc-table">
  <thead><tr><th>Tempo</th><th>Za minutu</th><th>Za hodinu</th><th>Za den</th><th>Penalizace</th></tr></thead>
  <tbody>
    <tr><td><strong>Pomalé</strong></td><td>60 m</td><td>3 km</td><td>24 km</td><td>Lze použít Nenápadnost</td></tr>
    <tr><td><strong>Normální</strong></td><td>90 m</td><td>4,5 km</td><td>36 km</td><td>—</td></tr>
    <tr><td><strong>Rychlé</strong></td><td>120 m</td><td>6 km</td><td>48 km</td><td>−5 k pasivnímu Vnímání</td></tr>
  </tbody>
</table>`,
  },
];

// ── Helper: flatten sections into searchable chunks (one per section) ─────────

function matchesQuery(s: Section, q: string): boolean {
  if (!q) return true;
  const haystack = normSearch(s.title + ' ' + s.category + ' ' + s.search);
  return haystack.includes(q);
}

@Component({
  selector: 'dm-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  styles: `
    :host {
      display: flex; flex-direction: column;
      height: 100%; font-family: sans-serif; color: #d4c9a0;
      background: rgba(8,5,18,.98);
    }

    /* ── Search bar ── */
    .ds-header {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px 9px; flex-shrink: 0;
      border-bottom: 1px solid rgba(200,160,60,.22);
      background: linear-gradient(180deg, rgba(18,12,4,.97) 0%, rgba(12,8,2,.98) 100%);
    }
    .ds-title {
      font-size: 13px; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(200,160,60,.55); white-space: nowrap; flex-shrink: 0;
      mat-icon { font-size: 17px; width: 17px; height: 17px; vertical-align: middle; margin-right: 5px; }
    }
    .ds-search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
    .ds-search-icon { position: absolute; left: 9px; font-size: 17px; width: 17px; height: 17px; color: rgba(200,160,60,.4); pointer-events: none; }
    .ds-search {
      width: 100%; background: rgba(5,3,12,.75); border: 1px solid rgba(200,160,60,.28);
      border-radius: 4px; color: #d4c9a0; font-size: 13px; padding: 7px 32px 7px 34px;
      outline: none; transition: border-color .18s, box-shadow .18s;
      &::placeholder { color: rgba(200,160,60,.28); font-style: italic; }
      &:focus { border-color: rgba(200,160,60,.55); box-shadow: 0 0 10px rgba(200,160,60,.1); }
    }
    .ds-clear {
      position: absolute; right: 6px; background: none; border: none; cursor: pointer;
      color: rgba(200,160,60,.4); display: flex; align-items: center; padding: 2px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { color: #e8c96a; }
    }
    .ds-count { font-size: 11px; color: rgba(200,160,60,.3); white-space: nowrap; flex-shrink: 0; }

    /* ── Category filter chips ── */
    .ds-cats {
      display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 16px;
      border-bottom: 1px solid rgba(200,160,60,.12); flex-shrink: 0;
      background: rgba(6,4,14,.7);
    }
    .ds-chip {
      padding: 2px 10px; border: 1px solid rgba(200,160,60,.22); border-radius: 12px;
      background: none; color: rgba(200,160,60,.45); font-size: 11px; cursor: pointer;
      transition: all .14s; white-space: nowrap;
      &:hover { border-color: rgba(200,160,60,.5); color: #d4c9a0; background: rgba(200,160,60,.07); }
      &.active { background: rgba(200,160,60,.14); border-color: #c8a03c; color: #e8c96a; }
    }

    /* ── Scroll area ── */
    .ds-scroll {
      flex: 1; overflow-y: auto; padding: 12px 16px 32px;
      scrollbar-width: thin; scrollbar-color: rgba(200,160,60,.25) transparent;
    }

    /* ── Category group ── */
    .ds-group { margin-bottom: 20px; }
    .ds-group-title {
      font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
      color: rgba(200,160,60,.4); border-bottom: 1px solid rgba(200,160,60,.14);
      padding: 0 2px 5px; margin-bottom: 10px;
    }
    .ds-sections { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }

    /* ── Single section ── */
    .ds-section {
      background: rgba(18,12,4,.7); border: 1px solid rgba(200,160,60,.12);
      border-radius: 4px; overflow: hidden;
      transition: border-color .18s;
      &:hover { border-color: rgba(200,160,60,.25); }
    }
    .ds-section-title {
      font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
      color: rgba(200,160,60,.75); background: rgba(0,0,0,.2);
      padding: 6px 10px; border-bottom: 1px solid rgba(200,160,60,.1);
    }
    .ds-section-body {
      padding: 8px 10px;
      /* nested HTML rendered by innerHTML */
      p { margin: 4px 0; font-size: 12px; line-height: 1.55; color: #c8b896; }
      strong { color: #e0cfa0; }
      em { color: rgba(200,185,140,.8); }
      ul.sc-list { margin: 4px 0; padding-left: 16px; }
      ul.sc-list li { font-size: 12px; line-height: 1.55; color: #c8b896; margin-bottom: 2px; }
    }

    /* ── Shared reference HTML element styles ── */
    ::ng-deep .sc-table {
      width: 100%; border-collapse: collapse; font-size: 12px; margin: 4px 0;
    }
    ::ng-deep .sc-table thead tr th {
      background: rgba(200,160,60,.1); color: rgba(200,160,60,.75);
      text-align: left; padding: 4px 8px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
      border-bottom: 1px solid rgba(200,160,60,.2);
    }
    ::ng-deep .sc-table tbody tr td {
      padding: 4px 8px; color: #c8b896; border-bottom: 1px solid rgba(255,255,255,.04);
      vertical-align: top;
    }
    ::ng-deep .sc-table tbody tr:last-child td { border-bottom: none; }
    ::ng-deep .sc-table .sc-accent { color: #e8c96a; font-weight: 700; }
    ::ng-deep .sc-box {
      background: rgba(5,3,12,.4); border-left: 2px solid rgba(200,160,60,.3);
      padding: 6px 10px; border-radius: 0 3px 3px 0; margin: 2px 0;
    }
    ::ng-deep .sc-box p { margin: 3px 0; font-size: 12px; line-height: 1.55; color: #c8b896; }
    ::ng-deep .sc-box strong { color: #e0cfa0; }
    ::ng-deep .sc-box.sc-box--formula { border-color: rgba(80,160,220,.35); background: rgba(4,8,18,.5); }
    ::ng-deep .sc-box.sc-box--formula p { color: #b8c8e8; }
    ::ng-deep .sc-box.sc-box--formula strong { color: #90c0f0; }
    ::ng-deep .sc-note { color: rgba(200,185,140,.55) !important; font-size: 11px !important; font-style: italic; }
    ::ng-deep .sc-ok { color: #60e880; }
    ::ng-deep .sc-fail { color: #e86060; }
    ::ng-deep .sc-card {
      background: rgba(5,3,12,.4); border: 1px solid rgba(200,160,60,.12); border-radius: 3px; overflow: hidden;
    }
    ::ng-deep .sc-card-header {
      font-size: 11px; text-transform: uppercase; letter-spacing: .1em;
      color: rgba(200,160,60,.7); background: rgba(0,0,0,.2);
      padding: 4px 8px; border-bottom: 1px solid rgba(200,160,60,.1);
    }
    ::ng-deep .sc-list {
      margin: 4px 0; padding-left: 16px;
      li { font-size: 12px; line-height: 1.55; color: #c8b896; margin-bottom: 2px; }
      strong { color: #e0cfa0; }
    }

    /* ── Empty state ── */
    .ds-empty {
      padding: 60px 24px; text-align: center; font-size: 13px; color: rgba(200,160,60,.25); font-style: italic;
      mat-icon { display: block; font-size: 36px; width: 36px; height: 36px; margin: 0 auto 12px; color: rgba(200,160,60,.15); }
    }
  `,
  template: `
    <div class="ds-header">
      <span class="ds-title"><mat-icon>menu_book</mat-icon>Zásteňa PH</span>
      <div class="ds-search-wrap">
        <mat-icon class="ds-search-icon">search</mat-icon>
        <input
          class="ds-search"
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
          placeholder="Hledat v pravidlech — podmínky, útok, magie…"
          autocomplete="off" spellcheck="false"
        />
        @if (searchQuery()) {
          <button class="ds-clear" type="button" (click)="searchQuery.set('')" title="Vymazat">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
      <span class="ds-count">{{ visibleCount() }}&thinsp;/&thinsp;{{ allSections.length }}</span>
    </div>

    <!-- Category chips -->
    <div class="ds-cats">
      <button class="ds-chip" [class.active]="selectedCategory() === null" type="button" (click)="selectedCategory.set(null)">Vše</button>
      @for (cat of categories; track cat) {
        <button class="ds-chip" [class.active]="selectedCategory() === cat" type="button" (click)="toggleCat(cat)">{{ cat }}</button>
      }
    </div>

    <!-- Content -->
    <div class="ds-scroll">
      @if (grouped().length === 0) {
        <div class="ds-empty"><mat-icon>search_off</mat-icon>Nic neodpovídá hledanému výrazu.</div>
      } @else {
        @for (g of grouped(); track g.category) {
          <div class="ds-group">
            <div class="ds-group-title">{{ g.category }}</div>
            <div class="ds-sections">
              @for (s of g.sections; track s.id) {
                <div class="ds-section">
                  <div class="ds-section-title">{{ s.title }}</div>
                  <div class="ds-section-body" [innerHTML]="s.html"></div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DmScreenComponent {
  readonly allSections = SECTIONS;
  readonly categories = [...new Set(SECTIONS.map(s => s.category))];

  readonly searchQuery = signal('');
  readonly selectedCategory = signal<string | null>(null);

  readonly grouped = computed(() => {
    const q = normSearch(this.searchQuery());
    const cat = this.selectedCategory();
    const map = new Map<string, Section[]>();

    for (const s of SECTIONS) {
      if (cat && s.category !== cat) continue;
      if (!matchesQuery(s, q)) continue;
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }

    return [...map.entries()].map(([category, sections]) => ({ category, sections }));
  });

  readonly visibleCount = computed(() => this.grouped().reduce((n, g) => n + g.sections.length, 0));

  toggleCat(cat: string): void {
    this.selectedCategory.update(c => (c === cat ? null : cat));
  }
}
