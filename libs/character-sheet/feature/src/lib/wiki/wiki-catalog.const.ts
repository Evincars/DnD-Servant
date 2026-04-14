export interface WikiChapter {
  /** Unique id derived from file path */
  id: string;
  /** Path relative to the book folder (may contain sub-dirs / Czech chars / spaces) */
  file: string;
  /** Human-readable label shown in the sidebar */
  label: string;
}

export interface WikiBook {
  id: string;
  label: string;
  icon: string;
  chapters: WikiChapter[];
}

function ch(file: string, label: string): WikiChapter {
  return { id: file.replace(/[\s/]/g, '-'), file, label };
}

/** Auto-derive a nice label from a bare filename (no ext, no path). */
function labelOf(filename: string): string {
  return filename
    .replace(/\.md$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Build chapters from a flat array of filenames (best for large directories). */
function fromFiles(files: string[]): WikiChapter[] {
  return files.map(f => ch(f, labelOf(f)));
}

// ─── Catalogs ────────────────────────────────────────────────────────────────

export const WIKI_CATALOG: WikiBook[] = [
  {
    id: 'prirucka-hrace',
    label: 'Příručka hráče',
    icon: 'menu_book',
    chapters: [
      ch('predmluva.md', 'Předmluva'),
      ch('uvod.md', 'Úvod'),
      ch('1-kapitola.md', '1. Postavy krok za krokem'),
      ch('2-kapitola.md', '2. Rasy'),
      ch('3-kapitola-a.md', '3a. Povolání'),
      ch('3-kapitola-b.md', '3b. Povolání (pokr.)'),
      ch('4-kapitola.md', '4. Osobnost a zázemí'),
      ch('5-kapitola.md', '5. Vybavení'),
      ch('6-kapitola.md', '6. Schopnosti'),
      ch('7-kapitola.md', '7. Hodnoty vlastností'),
      ch('8-kapitola.md', '8. Dobrodružství'),
      ch('9-kapitola.md', '9. Boj'),
      ch('10-kapitola.md', '10. Sesílání kouzel'),
      ch('11-kapitola-a.md', '11a. Kouzla'),
      ch('11-kapitola-b.md', '11b. Kouzla (pokr.)'),
      ch('dodatek-a.md', 'Dodatek A'),
      ch('dodatek-b.md', 'Dodatek B'),
      ch('dodatek-c.md', 'Dodatek C'),
      ch('dodatek-d.md', 'Dodatek D'),
      ch('dodatek-e.md', 'Dodatek E'),
    ],
  },
  {
    id: 'pruvodce-pana-jeskyne',
    label: 'Průvodce Pána Jeskyně',
    icon: 'auto_stories',
    chapters: [
      ch('uvod.md', 'Úvod'),
      ch('1-kapitola.md', '1. Svět dobrodružství'),
      ch('2-kapitola.md', '2. Vytváření světa'),
      ch('3-kapitola.md', '3. Tvorba podzemí'),
      ch('4-kapitola.md', '4. Tvorba dobrodružství'),
      ch('5-kapitola.md', '5. Vedení hry'),
      ch('6-kapitola.md', '6. Kouzelné předměty'),
      ch('7-kapitola-a.md', '7a. Poklady'),
      ch('7-kapitola-b.md', '7b. Poklady (pokr.)'),
      ch('8-kapitola.md', '8. Vedení dobrodružství'),
      ch('9-kapitola.md', '9. Herní materiály PJ'),
      ch('dodatek-A.md', 'Dodatek A'),
      ch('dodatek-B.md', 'Dodatek B'),
      ch('dodatek-C.md', 'Dodatek C'),
      ch('dodatek-D.md', 'Dodatek D'),
    ],
  },
  {
    id: 'jeskyne-a-draci',
    label: 'Jeskyně a draci',
    icon: 'castle',
    chapters: [
      ch('0-uvod.md', 'Úvod'),
      ch('1-zaklady.md', '1. Základy'),
      ch('2-tvorba-postavy.md', '2. Tvorba postavy'),
      ch('3-rasy.md', '3. Rasy'),
      ch('4a-povolani-po-kouz.md', '4a. Povolání'),
      ch('4b-povolani-od-kouz.md', '4b. Povolání (pokr.)'),
      ch('5-detaily-postavy.md', '5. Detaily postavy'),
      ch('6-vybaveni.md', '6. Vybavení'),
      ch('7-organizace-hry-a-pomucky.md', '7. Organizace hry'),
      ch('8a-hrani-hry-po-boj.md', '8a. Hraní hry'),
      ch('8b-hrani-hry-od-boj.md', '8b. Hraní hry (pokr.)'),
      ch('9-vedeni-hry.md', '9. Vedení hry'),
      ch('10a-magie-po-kouzla.md', '10a. Magie'),
      ch('10b-magie-dostupna-kouzla.md', '10b. Dostupná kouzla'),
      ch('10c-magie-kouzla-0-3.md', '10c. Kouzla 0–3'),
      ch('10d-magie-kouzla-4-9.md', '10d. Kouzla 4–9'),
      ch('11-kouzelne-predmety.md', '11. Kouzelné předměty'),
      ch('12-protivnici-a-netvori.md', '12. Protivníci a netvoři'),
      ch('13-stavy-a-nemoci.md', '13. Stavy a nemoci'),
    ],
  },
  {
    id: 'jeskyne-a-draci-doplnky',
    label: 'J&D doplňky',
    icon: 'extension',
    chapters: [
      ch('hvezdne-obory.md', 'Hvězdné obory'),
    ],
  },
  {
    id: 'xanathar',
    label: 'Xanatharův průvodce',
    icon: 'visibility',
    chapters: [
      ch('Uvod.md', 'Úvod'),
      ch('1-kapitola.md', '1. Možnosti povolání'),
      ch('2-kapitola.md', '2. Rasy'),
      ch('3-kapitola.md', '3. Kouzla'),
      ch('dodatek-A-sdilene_kampane.md', 'Dodatek A – Sdílené kampaně'),
      ch('dodatek-B-jmena.md', 'Dodatek B – Jména'),
    ],
  },
  {
    id: 'tasha',
    label: 'Tashina kotel',
    icon: 'science',
    chapters: [
      ch('Úvod a Kapitola 1 - Použití knihy (Úvod).md', 'Úvod a Kapitola 1'),
      ch('Kapitola 2 - Patroni.md', 'Kapitola 2 – Patroni'),
      ch('Kapitola 3 - Kouzla.md', 'Kapitola 3 – Kouzla'),
      ch('Kapitola 4 - Nástroje PJe.md', 'Kapitola 4 – Nástroje PJe'),
      ch('Odbornosti/Kapitola 1 - Odbornosti.md', 'Odbornosti – Kapitola 1'),
      ch('Jednotlivá povolání/Kapitola 1 - Barbar.md', 'Povolání – Barbar'),
      ch('Jednotlivá povolání/Kapitola 1 - Bard.md', 'Povolání – Bard'),
      ch('Jednotlivá povolání/Kapitola 1 - Bojovník.md', 'Povolání – Bojovník'),
      ch('Jednotlivá povolání/Kapitola 1 - Druid.md', 'Povolání – Druid'),
      ch('Jednotlivá povolání/Kapitola 1 - Hraničář.md', 'Povolání – Hraničář'),
      ch('Jednotlivá povolání/Kapitola 1 - Klerik.md', 'Povolání – Klerik'),
      ch('Jednotlivá povolání/Kapitola 1 - Kouzelník.md', 'Povolání – Kouzelník'),
      ch('Jednotlivá povolání/Kapitola 1 - Monk.md', 'Povolání – Mnich'),
      ch('Jednotlivá povolání/Kapitola 1 - Paladin.md', 'Povolání – Paladin'),
      ch('Jednotlivá povolání/Kapitola 1 - Tulák.md', 'Povolání – Tulák'),
      ch('Jednotlivá povolání/Kapitola 1 - Čaroděj.md', 'Povolání – Čaroděj'),
      ch('Jednotlivá povolání/Kapitola 1 - Čarotvůrce.md', 'Povolání – Čarotvůrce'),
      ch('Jednotlivá povolání/Kapitola 1 - Černokněžník.md', 'Povolání – Černokněžník'),
    ],
  },
  {
    id: 'dobrodruhuv-pruvodce',
    label: 'Dobrodruhův průvodce',
    icon: 'explore',
    chapters: [
      ch('kapitola-4-povolani.md', 'Kapitola 4 – Povolání'),
    ],
  },
  {
    id: 'voluv-pruvodce-netvory',
    label: 'Volův průvodce netvory',
    icon: 'pest_control',
    chapters: [
      ch('1-kapitola.md', '1. Kapitola'),
      ch('2-kapitola.md', '2. Kapitola'),
      ch('3-kapitola.md', '3. Kapitola'),
      ch('Dodatek-A.md', 'Dodatek A'),
      ch('Dodatek-B.md', 'Dodatek B'),
      ch('Dodatek-C.md', 'Dodatek C'),
      ...fromFiles([
        'Bandrhob.md','Bargest.md','Bodak.md','Chitinove.md','Demoni.md','Dinosauri.md',
        'Draeglot.md','Giralon.md','Gnolove.md','Grungove.md','Hlubinny-dedic.md',
        'Jeskynni-rybar.md','Jezibaby.md','Katoblepas.md','Ki-rin.md','Klouzavy-stopar.md',
        'Koboldi.md','Kored.md','Kraniokrysy.md','Krvokap.md','Kyjuv-zplozenec.md',
        'Lesni-kostal.md','Leukrota.md','Matucha.md','Mentalni-svedek.md','Minlok.md',
        'Morkot.md','Morsky-zplozenec.md','Mozkozrouti.md','Neogi.md','Neothelid.md',
        'Nilbog.md','Obri.md','Ohnemloci.md','Orci.md','Pastivec.md','Pozirac.md',
        'Prchlik.md','Proklety-ohar.md','Remdisnek.md','Skuruti.md','Stinovy-mastif.md',
        'Strazny-jester.md','Temnici.md','Tlinkal.md','Varguj.md','Vegepygmejove.md',
        'Xvarti.md','Yuan-tiove.md','Zabomot.md','Zrici.md',
      ]),
    ],
  },
  {
    id: 'bestiar',
    label: 'Bestiář',
    icon: 'cruelty_free',
    chapters: [
      ch('uvod.md', 'Úvod'),
      ch('dodate-a.md', 'Dodatek A'),
      ch('dodatek-b.md', 'Dodatek B'),
      ch('dodatek-c.md', 'Dodatek C'),
      ...fromFiles([
        'abolet.md','andele.md','ankheg.md','arakokra.md','azer.md','bazilisek.md',
        'behir.md','blekotajici-tlamac.md','bludicka.md','bulta.md','chimera.md',
        'chrlic.md','chuul.md','dablove.md','demoni.md','diblik.md','dinosauri.md',
        'divous.md','draci-zelva.md','draci.md','drak-stinovy.md','drakostej.md',
        'dravouk.md','dryada.md','duch.md','duergar.md','dvojnik.md','elementalove.md',
        'elfove-drowove.md','empyrean.md','ent.md','etin.md','fext.md','flamp.md',
        'fomorian.md','galeb-dur.md','geniove.md','ghulove.md','githove.md','gnolove.md',
        'gnom-hlubinny.md','goblini.md','gobri.md','golemove.md','gorgon.md','grel.md',
        'gryf.md','gryk.md','hakovec.md','harpyje.md','hipogryf.md','homunkulus.md',
        'houby.md','hrotoun.md','hydra.md','jednorozec.md','jesterci.md','jezibaby.md',
        'kambion.md','kenku.md','kentaur.md','klamopard.md','klepetnatec.md','koboldi.md',
        'kokatrice.md','kostej.md','kostlivci.md','kovatl.md','kraken.md','krapnitec.md',
        'kuo-toove.md','kyklop.md','lamie.md','litice.md','lykantropove.md','magmar.md',
        'mantikora.md','meduza.md','mefiti.md','mimik.md','minotaurus.md','modroni.md',
        'moran.md','morian.md','mozkozrout.md','mrchodravec.md','mstitel.md','mumie.md',
        'mykonidi.md','nagy.md','neviditelny-stopar.md','nocni-mura.md','noh.md','notik.md',
        'obri.md','obrneny-des.md','ohniva-lebka.md','on.md','orkove.md','otyugh.md',
        'ozivle-predmety.md','pavoucnatec.md','pegas.md','pekelny-ohar.md','peryton.md',
        'plastnik.md','plazivy-parat.md','poletucha.md','polodrak.md','polokostej.md',
        'prizrak.md','pseudodrak.md','purpurovy-cerv.md','quagot.md','raksaza.md',
        'remorazove.md','ropusak.md','rozumhlt.md','rytir-smrti.md','rzivy-netvor.md',
        'sahuagini.md','sakalodlak.md','salamandri.md','satyr.md','sfingy.md','skuruti.md',
        'sladi.md','slizy.md','sneti.md','sovodved.md','spektra.md','stin.md',
        'stitovy-strazce.md','strasak.md','striga.md','sukuba-nebo-inkubus.md','tarask.md',
        'temnoplast.md','thri-kreen.md','tlejici-valivec.md','troglodyt.md','troll.md',
        'upiri.md','vili-dracek.md','vodni-div.md','vyverna.md','xorn.md','yettiove.md',
        'yuan-tiove.md','yugoloti.md','zlobri.md','zombie.md','zrici.md',
      ]),
    ],
  },
  {
    id: 'snippets',
    label: 'Snippety a doplňky',
    icon: 'library_books',
    chapters: [
      // Povolání
      ...fromFiles([
        'povolani/barbar-zaklad-charakteristika.md','povolani/barbar-zaklad-schopnosti.md',
        'povolani/barbar-zaklad-prvotni-cesty.md','povolani/bard-zaklad-charakteristika.md',
        'povolani/bard-zaklad-schopnosti.md','povolani/bard-zaklad-koleje.md',
        'povolani/bojovnik-zaklad-charakteristika.md','povolani/bojovnik-zaklad-schopnosti.md',
        'povolani/bojovnik-zaklad-archetypy.md','povolani/car-zaklad-charakteristika.md',
        'povolani/car-zaklad-schopnosti.md','povolani/car-zaklad-puvody.md',
        'povolani/cern-zaklad-charakteristika.md','povolani/cern-zaklad-schopnosti.md',
        'povolani/cern-zaklad-patroni.md','povolani/cern-zaklad-vzyvani.md',
        'povolani/druid-zaklad-charakteristika.md','povolani/druid-zaklad-schopnosti.md',
        'povolani/druid-zaklad-kruhy.md','povolani/hranicar-zaklad-charakteristika.md',
        'povolani/hranicar-zaklad-schopnosti.md','povolani/hranicar-zaklad-archetypy.md',
        'povolani/klerik-zaklad-charakteristika.md','povolani/klerik-zaklad-schopnosti.md',
        'povolani/klerik-zaklad-domeny.md','povolani/kouzelnik-zaklad-charakteristika.md',
        'povolani/kouzelnik-zaklad-schopnosti.md','povolani/kouzelnik-zaklad-tradice.md',
        'povolani/lovec-jad-schopnosti.md','povolani/mnich-zaklad-charakteristika.md',
        'povolani/mnich-zaklad-schopnosti.md','povolani/mnich-zaklad-cesty.md',
        'povolani/paladin-zaklad-charakteristika.md','povolani/paladin-zaklad-schopnosti.md',
        'povolani/paladin-zaklad-prisahy.md','povolani/tulak-zaklad-charakteristika.md',
        'povolani/tulak-zaklad-schopnosti.md','povolani/tulak-zaklad-archetypy.md',
      ]),
      // Obory
      ...fromFiles([
        'obory/barbar-cesta-berserkra.md','obory/barbar-cesta-totemoveho-valecnika.md',
        'obory/bard-kolej-znalosti.md','obory/bard-kolej-odvahy.md',
        'obory/bojovnik-archetyp-sampion.md','obory/bojovnik-archetyp-caroknecht.md',
        'obory/klerik-domena-zivot.md','obory/klerik-domena-svetlo.md',
        'obory/klerik-domena-valka.md','obory/klerik-domena-priroda.md',
        'obory/druid-kruh-mesice.md','obory/druid-kruh-zeme.md',
        'obory/hranicar-archetyp-lovec.md','obory/hranicar-archetyp-pan-zvirat.md',
        'obory/kouzelnik-tradice-zaklinani.md','obory/kouzelnik-tradice-iluze.md',
        'obory/kouzelnik-tradice-nekromancie.md','obory/kouzelnik-tradice-vyvolani.md',
        'obory/paladin-prisaha-oddanosti.md','obory/paladin-prisaha-pomsty.md',
        'obory/tulak-archetyp-zlodej.md','obory/tulak-archetyp-vrah.md',
        'obory/tulak-archetyp-vykradac-hrobek.md',
      ]),
    ],
  },
];

