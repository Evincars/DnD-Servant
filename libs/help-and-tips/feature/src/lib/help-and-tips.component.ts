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
        title: '6 hlavních vlastností',
        badge: 'Karta',
        description:
          'Na levé straně jsou 6 hlavních vlastností (SIL, OBR, ODL, INT, MDR, CHA). ' +
          'Do horního pole vyplň opravu (bonus), do dolního základní hodnotu vlastnosti. ' +
          'Opravy vlastností ovlivňují ostatní výpočty jako dovednosti a záchranné hody.',
      },
      {
        title: 'Dovednosti a zdatnosti',
        badge: 'Karta',
        description:
          'U každé dovednosti je checkbox pro zdatnost. Jedno kliknutí = zdatnost (modré podbarvení), ' +
          'druhé kliknutí = odbornost/expertíza (červený kroužek = dvojný bonus zdatnosti), ' +
          'třetí kliknutí = reset. Čísla vpravo jsou výsledné bonusy.',
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
        title: 'Záchranné hody a obranné číslo',
        badge: 'Karta',
        description:
          'Zaškrtni checkbox u záchranného hodu pro přidání zdatnostního bonusu. ' +
          'OČ (obranné číslo) se skládá ze tří polí: Zbroj, Bez zbroje (10 + OBR) a Jiné (štít, kouzla). ' +
          'Klikni na ℹ️ u OČ pro tabulku zbrojí a jejich hodnot.',
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
          'Na druhé záložce karty můžeš nahrát obrázek své postavy (max. 500 kB). ' +
          'Obrázek je uložen jako Base64 přímo v databázi. ' +
          'Klikni na pole obrázku nebo přetáhni soubor pro nahrání.',
      },
      {
        title: 'Třetí stránka — poznámky',
        badge: 'Karta',
        description:
          'Třetí záložka obsahuje rich-text editor pro poznámky a popis postavy. ' +
          'Podporuje tučný text, kurzívu, odrážky, nadpisy a barevné formátování textu.',
      },
    ],
  },
  {
    id: 'initiative',
    title: 'Iniciativní tabulka (PH zástěna)',
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
