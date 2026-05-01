import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

interface TipSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  tips: Tip[];
}

interface Tip {
  title: string;
  description: string;
  gif?: string;
  badge?: string;
}

const SECTIONS: TipSection[] = [
  {
    id: 'start',
    title: 'Začínáme',
    icon: 'play_circle',
    color: '#c8a03c',
    tips: [
      {
        title: 'Přihlášení a registrace',
        badge: 'Základ',
        description:
          'Pro ukládání dat se musíš přihlásit nebo zaregistrovat. Klikni na tlačítko "Přihlásit" v pravém horním rohu lišty. ' +
          'Bez přihlášení jsou data uložena pouze dočasně v prohlížeči a po refreshi zmizí.',
        gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWx4eWV5eXF5eXB4eHh4eHh4eHh4/giphy.gif',
      },
      {
        title: 'Navigace v aplikaci',
        badge: 'Základ',
        description:
          'Pomocí ikony menu ☰ v levém horním rohu otevřeš postranní navigaci. ' +
          'Odtud se dostaneš na Kartu postavy, PH Zástěnu, Databázi D&D a tuto stránku Nápovědy.',
      },
      {
        title: 'Uložení změn',
        badge: 'Důležité',
        description:
          'Data se neukládají automaticky! Pro uložení klikni na tlačítko "Uložit [enter]" nebo stiskni Enter. ' +
          'Uložení probíhá do Firebase — po přihlášení jsou data dostupná odkudkoliv.',
      },
    ],
  },
  {
    id: 'character-sheet',
    title: 'Karta postavy',
    icon: 'person_edit',
    color: '#8b6caf',
    tips: [
      {
        title: 'Hlavní informace o postavě',
        badge: 'Karta',
        description:
          'V horní části karty vyplň základní info: rasa, povolání, zázemí, přesvědčení, jméno postavy, hráč, úroveň a zkušenosti. ' +
          'Pole "Zázemí" a "Přesvědčení" mají ikonu ℹ️ pro nápovědu s dostupnými hodnotami.',
      },
      {
        title: 'Automatické vyplňování vlastností',
        badge: 'Autofill ✨',
        description:
          'Stačí vyplnit 6 hlavních vlastností (SIL, OBR, ODL, INT, MDR, CHA) — opravy se vypočítají samy podle pravidel JaD. ' +
          'Například hodnota 14–15 = oprava +2. ' +
          'Opravy se okamžitě propíší do Dovedností, Záchranných hodů a Pasivních dovedností. ' +
          'Iniciativa se automaticky rovná opravě Obratnosti.',
        gif: 'autofill-of-abilities.gif',
      },
      {
        title: 'Úroveň postavy a zdatnostní bonus',
        badge: 'Autofill ✨',
        description:
          'Po vyplnění pole "Úroveň" se automaticky aktualizuje Zdatnostní bonus (ZB) podle tabulky JaD. ' +
          'Úroveň 1–4 = +2, 5–8 = +3, 9–12 = +4, 13–16 = +5, 17–20 = +6. ' +
          'Všechny dovednosti, záchranné hody a pasivní dovednosti kde máš zaškrtnutou zdatnost se přepočítají automaticky.',
      },
      {
        title: 'Zdatnosti a kvalifikace (hvězdičky)',
        badge: 'Dovednosti',
        description:
          '1. kliknutí na hvězdičku = zdatnost → přičte se ZB k hodnotě. ' +
          '2. kliknutí = kvalifikace → přičtou se 2× ZB. ' +
          '3. kliknutí = reset na výchozí hodnotu. ' +
          'Stejný systém platí pro Záchranné hody a Pasivní dovednosti.',
      },
      {
        title: 'Hod kostkou přímo z vlastnosti nebo dovednosti',
        badge: 'Kostky 🎲',
        description:
          'Najeď myší na pole Dovednosti (Atletika, Akrobacie…), Záchranného hodu nebo hlavní vlastnosti (SIL, OBR…). ' +
          'Zobrazí se ikona 🎲 — klikni na ni pro automatický hod k20 + hodnota daného pole. ' +
          'Výsledek se zobrazí v panelu kostek vlevo na obrazovce včetně historie hodů.',
      },
      {
        title: 'Záchranné hody a obranné číslo',
        badge: 'Karta',
        description:
          'Zaškrtni hvězdičku u záchranného hodu pro přidání zdatnostního bonusu. ' +
          'OČ (obranné číslo) se skládá ze tří polí: Zbroj, Bez zbroje (10 + OBR) a Jiné (štít, kouzla). ' +
          'Klikni na ℹ️ u OČ pro tabulku zbrojí a jejich hodnot.',
      },
      {
        title: 'Záchranné hody proti smrti (srdíčka a lebky)',
        badge: 'Karta',
        description:
          'Při 0 HP klikej na srdíčka (úspěch) nebo lebky (neúspěch). ' +
          'Srdíčko = zelené při úspěchu, lebka = červená při neúspěchu. ' +
          '3 úspěchy = stabilizace, 3 neúspěchy = smrt.',
      },
      {
        title: 'Nosnost a rychlost pohybu',
        badge: 'Karta',
        description:
          'Do kolonky "SIL oprava" zadej opravu Síly — aplikace automaticky vypočítá prahy nosnosti. ' +
          'Políčka inventáře se zbarví: zelená = lehká, žlutá = střední, červená = těžká nosnost. ' +
          'Příslušná rychlost pohybu se automaticky zvýrazní podle počtu zaplněných řádků inventáře.',
      },
      {
        title: 'Sloty kouzel',
        badge: 'Karta',
        description:
          'Vyplň "Úroveň Sesilatele" pro aktivaci správného počtu slotů. ' +
          'Každý slot má 3 stavy: prázdný → přeškrtnutý (utracený) → vyplněný (obnovený). ' +
          'Šedé šrafované sloty jsou pro danou úroveň nedostupné. ' +
          'Černokněžník má speciální sloty označené tmavě červeně — vyplň "Úroveň Černokněžníka".',
      },
      {
        title: 'Alchymistická truhla',
        badge: 'Karta',
        description:
          'Vyplň "Úroveň Alchymisty" pro aktivaci správného počtu použití truhly. ' +
          'Funguje stejně jako sloty kouzel — 3 stavy pro každé políčko. ' +
          'Klikni na ℹ️ pro kompletní pravidla alchymistické truhly.',
      },
      {
        title: 'Zbraně a útoky',
        badge: 'Karta',
        description:
          'Máš k dispozici 5 řádků pro zbraně/útoky. Každý řádek obsahuje: název, útočný bonus, zásah, typ poškození, dosah a OČ. ' +
          'Klikni na ℹ️ pro tabulku zbraní, manévry a speciální situace v boji.',
      },
      {
        title: 'Záloha postavy',
        badge: 'Tip',
        description:
          'Tlačítko 📷 "Záloha" v horní liště pořídí screenshot celé karty postavy a uloží ho jako PNG soubory. ' +
          'Záloha je rozdělena do více souborů pro tisk na A4. Skvělé jako pojistka před ztrátou dat!',
      },
      {
        title: 'Druhá stránka — obrázek postavy',
        badge: 'Karta',
        description:
          'Na druhé záložce karty můžeš nahrát obrázek své postavy (max. 500 kB, doporučeno GIF). ' +
          'Obrázek je uložen jako Base64 přímo v databázi. ' +
          'Klikni na pole obrázku nebo přetáhni soubor pro nahrání. ' +
          'Pro převod a zmenšení obrázku použij záložku "Konvertor Obrázků".',
      },
      {
        title: 'Třetí stránka — poznámky',
        badge: 'Karta',
        description:
          'Třetí záložka obsahuje rich-text editor pro poznámky a popis postavy. ' +
          'Podporuje tučný text, kurzívu, odrážky, nadpisy a barevné formátování textu.',
      },
      {
        title: 'Stavy & Podmínky — tlačítko na kartě',
        badge: 'Stavy 🩺',
        description:
          'V levém horním rohu karty postavy (strana 1) najdeš tlačítko "Stavy". ' +
          'Kliknutím otevřeš dialog se všemi dostupnými herními stavy a stopovačem vyčerpání. ' +
          'Aktivní stavy se zobrazují jako barevné ikonky přímo pod tlačítkem — přejetím myší uvidíš název a popis stavu.',
      },
    ],
  },
  {
    id: 'dice-roller',
    title: 'Hod kostkami',
    icon: 'casino',
    color: '#a840ff',
    tips: [
      {
        title: 'Otevření panelu kostek',
        badge: 'Kostky 🎲',
        description:
          'Panel kostek je přichycen na levé straně obrazovky — klikni na záložku "🎲 Kostky" pro otevření. ' +
          'Panel je vždy viditelný bez ohledu na to, na které stránce se nacházíš.',
      },
      {
        title: 'Přidání kostek a hod',
        badge: 'Kostky 🎲',
        description:
          'Klikni na kostku (k4, k6, k8, k10, k12, k20) pro přidání do fronty. ' +
          'Klikni vícekrát pro přidání více kostek stejného typu. ' +
          'Tlačítka + a − mění počet kostek ve frontě. ' +
          'Dvakrát klikni na kostku pro okamžitý hod bez fronty.',
      },
      {
        title: 'Hod přímo z karty postavy',
        badge: 'Kostky 🎲',
        description:
          'Najeď myší na pole Dovednosti, Záchranného hodu nebo hlavní vlastnosti (SIL, OBR…). ' +
          'Zobrazí se ikona 🎲 — klikni pro automatický hod k20 s přičtením bonusu daného pole. ' +
          'Výsledek se ihned zobrazí v panelu (např. "Atletika k20 8+3 = 11").',
      },
      {
        title: 'Historie hodů',
        badge: 'Kostky 🎲',
        description:
          'Poslední hody jsou zobrazeny v dolní části panelu ve dvou řadách. ' +
          'Nejaktuálnější hod je zvýrazněn zlatě. ' +
          'NAT 20 = zlaté zvýraznění s textem "NAT 20!", kritický neúspěch (1) = červené zvýraznění. ' +
          'Najeď myší na zkrácený výsledek pro zobrazení celého textu v tooltipu. ' +
          'Historie se ukládá do localStorage a zachová se po refreshi.',
      },
      {
        title: 'Vymazání výsledků',
        badge: 'Kostky 🎲',
        description:
          'Tlačítko "Vymazat" v horní části panelu smaže frontu, aktuální výsledky i celou historii hodů. ' +
          'Data jsou smazána i z localStorage.',
      },
    ],
  },
  {
    id: 'initiative',
    title: 'Tabulka iniciativy (PH zástěna)',
    icon: 'full_coverage',
    color: '#af5555',
    tips: [
      {
        title: 'Přidání bojovníka do tabulky',
        badge: 'Iniciativa',
        description:
          'Klikni na tlačítko "+ Přidat" pro přidání nového řádku. Každý řádek obsahuje: ' +
          'iniciativu (číslo), jméno (s automatickým doplňováním z databáze příšer), životy a životy maximum.',
      },
      {
        title: 'Automatické doplňování jmen příšer',
        badge: 'Iniciativa',
        description:
          'Pole pro jméno obsahuje autofill z databáze 5e příšer (2014). ' +
          'Začni psát jméno příšery v angličtině a zobrazí se návrhy. ' +
          'Pokud jméno neodpovídá žádné příšeře, prostě ho ponech — funguje i pro hráče.',
      },
      {
        title: 'Zvýraznění aktuálního bojovníka',
        badge: 'Iniciativa',
        description:
          'Tlačítko "Další ›" posune zvýraznění na dalšího bojovníka v pořadí. ' +
          'Aktuální bojovník je zvýrazněn zlatým rámečkem. ' +
          'Seřaď tabulku tlačítkem "Seřadit ↓" pro správné pořadí iniciativy.',
      },
      {
        title: 'Karta příšery',
        badge: 'Iniciativa',
        description:
          'Každý řádek má tlačítko 🐉 pro načtení karty příšery z D&D databáze. ' +
          'Jméno se automaticky převede na API formát (mezery → pomlčky, malá písmena). ' +
          'Karta zobrazí statistiky, schopnosti, akce a vše ostatní dostupné v D&D 5e API.',
      },
      {
        title: 'Uložení iniciativy',
        badge: 'Iniciativa',
        description:
          'Data iniciativní tabulky jsou uložena lokálně v prohlížeči (localStorage). ' +
          'Po refreshi stránky se tabulka obnoví. ' +
          'Tlačítko "Vymazat" smaže celou tabulku pro nové kolo/setkání.',
      },
    ],
  },
  {
    id: 'dnd-database',
    title: 'Databáze D&D',
    icon: 'menu_book',
    color: '#4a8c5c',
    tips: [
      {
        title: 'Vyhledávání v databázi',
        badge: 'Databáze',
        description:
          'Zadej název v angličtině do vyhledávacího pole. Aplikace automaticky prohledá všechny kategorie: ' +
          'příšery, kouzla, rasy, poddruhry ras, povolání a podpovolání. ' +
          'Výsledky se zobrazí jako karty vedle sebe.',
      },
      {
        title: 'Filtrování kategorií',
        badge: 'Databáze',
        description:
          'Pomocí tlačítek kategorií (Příšery, Kouzla, Rasy, Povolání…) filtruj vyhledávání. ' +
          'Výchozí je "Vše" — prohledá všechny kategorie najednou. ' +
          'Kliknutí na konkrétní kategorii zrychlí vyhledávání.',
      },
      {
        title: 'Karty výsledků',
        badge: 'Databáze',
        description:
          'Každý výsledek se zobrazí jako karta. Karty lze zavřít tlačítkem ✕. ' +
          'Otevřené karty jsou uloženy v localStorage — po refreshi se obnoví. ' +
          'Lze mít otevřeno více karet různých typů najednou.',
      },
      {
        title: 'Karta příšery',
        badge: 'Databáze',
        description:
          'Karta příšery zobrazuje: typ, velikost, zarovnání, OČ, životy, rychlosti, statistiky (STR/DEX…), ' +
          'imunity, smysly, jazyky, nebezpečnost, schopnosti a akce. ' +
          'Data pochází z D&D 5e API (2014 verze).',
      },
      {
        title: 'Karta kouzla',
        badge: 'Databáze',
        description:
          'Karta kouzla zobrazuje: úroveň, školu magie, čas vyvolání, dosah, složky, trvání, třídy a popis. ' +
          'Vyhledávej anglickými názvy kouzel (např. "fireball", "magic missile").',
      },
      {
        title: 'Karta rasy a povolání',
        badge: 'Databáze',
        description:
          'Karty ras zobrazují bonusy vlastností, věk, velikost, rychlost a rasové rysy. ' +
          'Karty povolání zobrazují kostku životů, zdatnosti, záchrany a vybavení. ' +
          'Pro poddruh rasy použij kategorii "Poddruh".',
      },
      {
        title: 'Data jsou z roku 2014',
        badge: 'Poznámka',
        description:
          'Databáze používá D&D 5e API z roku 2014 (základní příručky). ' +
          "Obsah z novějších doplňků (Tasha's, Xanathar's, 2024 PHB) není dostupný. " +
          'Odkaz na kompletní seznam příšer: aidedd.org/dnd-filters/monsters.php',
      },
    ],
  },
  {
    id: 'item-vault',
    title: 'Trezor předmětů',
    icon: 'inventory_2',
    color: '#5c7caf',
    tips: [
      {
        title: 'Přidání předmětu',
        badge: 'Trezor',
        description:
          'Na třetí záložce karty postavy najdeš Trezor předmětů. ' +
          'Klikni na "+" pro přidání nového předmětu. Každý předmět má: název, popis (rich text) a obrázek (max. 200 kB).',
      },
      {
        title: 'Nahrání obrázku předmětu',
        badge: 'Trezor',
        description:
          'Klikni na pole pro obrázek nebo přetáhni soubor. ' +
          'Po nahrání se zobrazí náhled obrázku. ' +
          'Klikni na náhled pro zobrazení v plné velikosti v dialogu.',
      },
      {
        title: 'Smazání předmětu',
        badge: 'Trezor',
        description:
          'Klikni na ikonu 🗑️ pro smazání předmětu. ' +
          'Zobrazí se potvrzovací dialog — potvrď smazání. ' +
          'Akce je nevratná — data jsou smazána ze serveru.',
      },
    ],
  },
  {
    id: 'rich-text',
    title: 'Rich Text Editor',
    icon: 'format_color_text',
    color: '#7c5caf',
    tips: [
      {
        title: 'Formátování textu',
        badge: 'Editor',
        description:
          'Všechna textová pole s formátováním podporují: ' +
          'Tučný (B), Kurzíva (I), Nadpisy (H1/H2/H3), Odrážky (•), Číslované odrážky (1.) a barvy textu.',
      },
      {
        title: 'Barvy textu',
        badge: 'Editor',
        description:
          'Pro obarvení textu použij tlačítka barev v nástrojové liště editoru. ' +
          'Barvy jsou vkládány jako speciální tagy — text je uložen jako čitelný řetězec. ' +
          'Příklad: [red]Červený text[/red] se zobrazí červeně.',
      },
      {
        title: 'Klávesové zkratky',
        badge: 'Editor',
        description:
          'Ctrl+B = tučný text, Ctrl+I = kurzíva. ' +
          'Ctrl+Z = zpět (undo). ' +
          'Enter = nový řádek, Shift+Enter = odřádkování bez nového odstavce.',
      },
    ],
  },
  {
    id: 'conditions',
    title: 'Stavy & Podmínky',
    icon: 'health_and_safety',
    color: '#9840c0',
    tips: [
      {
        title: 'Otevření přehledu stavů',
        badge: 'Stavy 🩺',
        description:
          'Na první stránce Karty postavy je v levém horním rohu tlačítko "Stavy". ' +
          'Kliknutím otevřeš dialog se všemi 18 dostupnými stavy (Oslepení, Paralýza, Zuřivost…) a stopovačem vyčerpání. ' +
          'Počet aktivních stavů je zobrazen červeným číslem přímo na tlačítku.',
      },
      {
        title: 'Aktivace a deaktivace stavu',
        badge: 'Stavy 🩺',
        description:
          'Klikni na kartu stavu pro jeho aktivaci — karta se rozsvítí charakteristickou barvou s efektem záře. ' +
          'Klikni znovu pro deaktivaci. ' +
          'Stav "Soustředění" je vhodný pro sledování kouzel vyžadujících soustředění. ' +
          'Tlačítko "Vymazat vše" deaktivuje všechny stavy najednou.',
      },
      {
        title: 'Popis stavů (tooltip)',
        badge: 'Stavy 🩺',
        description:
          'Najetím myší na kartu stavu v dialogu se zobrazí jeho herní popis s mechanickými efekty. ' +
          'Například: Paralýza = "Neschopný a nehybný. Automatické kritické zásahy z 1,5 m." ' +
          'Stejný popis se zobrazí i při najetí na ikonku aktivního stavu přímo na kartě postavy.',
      },
      {
        title: 'Aktivní stavy viditelné na kartě postavy',
        badge: 'Stavy 🩺',
        description:
          'Aktivní stavy se zobrazují jako malé barevné ikonky přímo pod tlačítkem "Stavy" — bez nutnosti otevírat dialog. ' +
          'Každá ikonka má barvu a záři příslušného stavu. ' +
          'Přejetím myší zobrazíš název stavu a jeho herní popis.',
      },
      {
        title: 'Stopovač vyčerpání',
        badge: 'Vyčerpání',
        description:
          'V dolní části dialogu je škála vyčerpání 1–6. ' +
          'Klikni na úroveň pro nastavení stupně vyčerpání tvé postavy. ' +
          'Přejetím myší nad každou úrovní se zobrazí herní efekt (např. úroveň 2 = Rychlost snížena na polovinu, úroveň 6 = Smrt). ' +
          'Klikni na aktuálně nastavenou úroveň pro snížení o 1.',
      },
      {
        title: 'Automatické ukládání stavů',
        badge: 'Stavy 🩺',
        description:
          'Všechny aktivní stavy a úroveň vyčerpání se automaticky ukládají v localStorage prohlížeče. ' +
          'Po zavření dialogu nebo refreshi stránky se stavy zachovají. ' +
          'Data jsou nezávislá na přihlášení — ukládají se lokálně v daném prohlížeči.',
      },
    ],
  },
  {
    id: 'image-converter',
    title: 'Konvertor Obrázků',
    icon: 'auto_fix_high',
    color: '#c8a03c',
    tips: [
      {
        title: 'K čemu konvertor slouží',
        badge: 'Konvertor',
        description:
          'Záložka "Konvertor Obrázků" převede libovolný obrázek (PNG, JPG, JPEG…) na formát GIF ' +
          'a automaticky ho zmenší pod 200 KB — to je limit pro nahrání portrétu postavy na stránce Karta postavy → Strana 2. ' +
          'GIF funguje nejlépe pro ilustrace a kreslené portréty; fotografie mohou ztratit kvalitu.',
      },
      {
        title: 'Nahrání obrázku',
        badge: 'Konvertor',
        description:
          'Obrázek lze nahrát přetažením (drag & drop) do vyznačené oblasti nebo kliknutím na "Vybrat soubor". ' +
          'Podporované formáty: PNG, JPG, JPEG a všechny standardní obrazové formáty. ' +
          'Po nahrání se zobrazí náhled originálu s jeho velikostí a rozměry.',
      },
      {
        title: 'Převod a automatická redukce',
        badge: 'Konvertor',
        description:
          'Po nahrání klikni na tlačítko "Převést na GIF". ' +
          'Aplikace automaticky zkouší zmenšovat obrázek v 7 krocích (100 % → 78 % → 60 % → 45 % → 32 % → 22 % → 15 %) ' +
          'dokud výsledný GIF nepřesáhne 200 KB. ' +
          'Počet potřebných pokusů je zobrazen v záhlaví výsledku.',
      },
      {
        title: 'Porovnání originál vs. výsledek',
        badge: 'Konvertor',
        description:
          'Po konverzi se zobrazí oba obrázky vedle sebe — originál vlevo, GIF výsledek vpravo. ' +
          'U každého je zobrazena velikost v KB a rozměry v pixelech. ' +
          'Zelené ✓ u výsledku znamená, že GIF je pod 200 KB a je vhodný pro nahrání jako portrét.',
      },
      {
        title: 'Stažení výsledného GIF',
        badge: 'Konvertor',
        description:
          'Klikni na tlačítko "Stáhnout GIF (X KB)" pro uložení souboru do počítače. ' +
          'Soubor se uloží pod stejným názvem jako originál s příponou .gif. ' +
          'Poté ho nahraj jako portrét na stránce Karta postavy → Strana 2 (klikni na pole obrázku).',
      },
      {
        title: 'Nový obrázek',
        badge: 'Konvertor',
        description:
          'Kliknutím na tlačítko "Nový obrázek" v pravém horním rohu resetuješ konvertor a můžeš nahrát další soubor. ' +
          'Konvertor lze také znovu spustit tlačítkem "Převést na GIF" na již nahraném obrázku — ' +
          'to je užitečné pro opakovaný pokus s jiným nastavením.',
      },
    ],
  },
];

@Component({
  selector: 'help-and-tips',
  templateUrl: './help-and-tips.component.html',
  styleUrl: './help-and-tips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class HelpAndTipsComponent {
  sections = SECTIONS;
  activeSection = signal<string>('start');
  expandedTip = signal<string | null>(null);

  selectSection(id: string) {
    this.activeSection.set(id);
    this.expandedTip.set(null);
  }

  toggleTip(key: string) {
    this.expandedTip.update(current => (current === key ? null : key));
  }

  get currentSection(): TipSection {
    return this.sections.find(s => s.id === this.activeSection())!;
  }
}
