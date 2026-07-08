import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface ReleaseEntry {
  type: 'fix' | 'improvement';
  text: string;
}

export interface ReleaseGroup {
  date: string;
  entries: ReleaseEntry[];
}

const i = (text: string): ReleaseEntry => ({ type: 'improvement', text });
const f = (text: string): ReleaseEntry => ({ type: 'fix', text });

const RELEASE_NOTES: ReleaseGroup[] = [
  {
    date: '5. července 2026',
    entries: [
      i('Vylepšená J&D wiki - lepší vyhledávání, scroll na pozici i pro podkapitoly, přizpůsobení mobilům a tabletům, zlepšení výkonu při dlouhých textech, Obsah Kapitoly s vyhledáváním, opraveny linky pro nadpisy.'),
      i('Lepší, jednodušší design tabů (změna pořadí stránek + Konvertor Obrázků přesunut na PH Nástroje), odstranění zbytečných nadpisů z daných stránek, změna barevné palety pro některé prvky.'),
      i('DM Qeusty a hráčské Questy - vylepšený a zjednodušený design karet, vč. odstranění obrázku.'),
      i('Tabulka Iniciativy - zjednodušený design.'),
    ],
  },
  {
    date: '25. června 2026',
    entries: [
      f('Login pomocí Google účtu, staré přihlašování je povolené, ale nově příchozí musí použít Google'),
      i('Možnost importovat všechna data (možnost si vybrat která data) z jiného loginu'),
      i('Přidáno donate tlačítko na horní liště s QR kódem'),
    ],
  },
  {
    date: '7. června 2026',
    entries: [
      f('Oprava karet monster v iniciativní tabulce (nyní lze házet na životy)'),
      i("Monstra s tzv. 'rodinou' jsou nyní rozdělena a vyhledatelná, s odkazem na popis dané rodiny"),
      i('Pokročilé filtry pro monstra a kouzla (kouzla dle typu a úrovně, monstra dle třídy CR)'),
      i("Stránka 'DM Screen' má nyní i obrázkovou verzi pro všechny případy"),
      i(
        'Nápovědné dialogy s pravidly nyní převedeny z obrázků na text (přepínač obrázek/text nahoře, výchozí je obrázek - část textů ještě není správně přeformátovaná, TODO)',
      ),
      i("Nová záložka 'Lektvary' s tabulkou ingrediencí pro výrobu lektvarů (základní filtrování)"),
      i(
        'Vylepšený dialog hodu kostkou (odkaz na celou historii hodů, úprava paddingu/margin, změna ikony minimalizace, zavření kliknutím mimo okno)',
      ),
      i('Nová tabulka Alchymie lektvarů s potřebnými surovinami'),
    ],
  },
  {
    date: '22. května 2026',
    entries: [
      i(
        'Implementace JaD monster do iniciativní tabulky (nové soubory /scripts/jad-monsters-output.txt a /util/jad-monsters-names.ts)',
      ),
      f('Oprava barvy textu v záložce poznámek PH (rich-textarea)'),
      i('Rychlá navigace má lepší font, zvýrazňuje zadané znaky, ignoruje mezery a umí najít i sloučené první znaky slov'),
      i('Sloučení tlačítek collapse/expand v obou záložkách Questů'),
      i(
        "Vylepšení iniciativní tabulky — zobrazení 'health bar' monster pro přehled odebraných životů, zobrazení vlastní J&D karty monstra (souběžně s klasickou D&D kartou), karty monster zobrazené pod tabulkou v mřížce (rozbalí se vždy aktivní monstrum na tahu), tlačítko Instantiate s volbou průměrných nebo kostkou hozených životů a automatickou přípravou karet monster (tlačítka collapse/expand a odstranit vše)",
      ),
      i(
        "Nová záložka 'Kouzla' (z J&D systému) na character-sheetu se třídění dle kategorií, tagů a pokročilým vyhledáváním (záložka 'Moje předměty' zrušena, nahrazena ikonou v sekci Inventář)",
      ),
      i("Nová záložka 'Monstra' v DM Tools (z J&D systému) se stejným třídění a možností přidání do iniciativní tabulky"),
      i('Aktualizace stránky Tipy a triky i rychlé navigace'),
    ],
  },
  {
    date: '8. května 2026',
    entries: [
      f("Oprava skrytého tlačítka 'Uložit [enter]' na PC verzi"),
      i('Nová funkce časové osy událostí na stránce DM Tools s ukládáním do databáze'),
      f('Oprava některých slov v názvové konvenci pro JaD'),
      i('Nahrání SVG obrázků postav a skupinových listů do /public'),
      i('Použití SVG namísto WEBP obrázků (opravena i pozice některých vstupních polí)'),
      i('Vytvořeno více tmavých témat (první testovací verze, čeká se na zpětnou vazbu)'),
    ],
  },
  {
    date: '1. května 2026',
    entries: [
      i(
        "Skládací (collapsible) zobrazení všech sekcí na character-sheetu i group-sheetu s uložením stavu do local-storage (drag&drop pořadí), sekce mají v titulku vlastní ikony, některá pole a textarea přesunuta do správné sekce (např. 'SO Záchrany kouzel' nyní pod záložkou Kouzla)",
      ),
      i('Plovoucí tlačítka scroll nahoru/dolů a Uložit'),
      i('Opravené responzivní světlé/tmavé téma'),
      i('Prázdná pole pro kouzla a další vstupy mají placeholdery pro mobil/tablet'),
      i('Horní lišta sloučila login/logout/registraci a další odkazy do jedné ikony na malých obrazovkách'),
      f("Oprava kouzla 'Dotek smrti', které nezobrazovalo detailní text v dialogu"),
      i('Tmavé téma (obrázek) pro Group Sheet'),
      i('Responzivní design Group Sheetu (včetně skládacích sekcí)'),
      i('Tlačítka collapse/expand all na obou listech'),
      i('Vylepšená rich-textarea pro mobil/tablet (podpora tmavého/světlého tématu)'),
      i('Automatické ukládání záložek Poznámky, Questy a Předměty hráčů po psaní'),
      i('Nový dialog Nastavení (přepínač tématu, export, klávesové zkratky)'),
      i('Vypnuté matTooltips na mobilu (blokovaly scrollování)'),
      i('Klávesové zkratky Alt+šipka vlevo/vpravo pro přepínání záložek a Ctrl+K pro rychlou navigaci'),
      i('Nový dialog Release Notes dostupný z horní lišty'),
    ],
  },
  {
    date: '27. dubna 2026',
    entries: [
      i('Vyhledávání v J&D SRD databázi — soubory *.md zkopírovány do /public'),
      i('Vyhledávání umístěno jako poslední záložka na /character-sheet'),
      i('Pokročilejší vyhledávání než na oficiální JaD wiki (filtrování dle podtitulků, bug #22)'),
      i('Každý nadpis má odkaz vytvářející unikátní URL'),
      i('Postranní panel se skládacími tématy a podtématy'),
      i('Správně vykreslené karty monster, info boxy pro doplňující informace'),
      i('Doplněny i oblasti, které nejsou v oficiální JaD SRD databázi (Příručka hráče, Tashin Kotel, ...)'),
      i('V záložce kouzel přidáno tlačítko pro detail kouzla v dialogu a vyhledávací combo box se všemi kouzly'),
      i(
        'Základní responzivní design pro mobily, zejména pro tabulky (požadavek z JaD Discordu) — nápovědné tooltips se nezobrazují, jinak je hra plně funkční včetně hodu kostkou',
      ),
      i('Vyřešena varování z Firebase konzole (i ta, která přibyla po doplnění JaD Wiki) — issue #13 vyřešeno'),
    ],
  },
  {
    date: '12. dubna 2026',
    entries: [
      f("Oprava varování v konzoli 'Calling Firebase APIs outside of an Injection context...'"),
      f("Oprava varování 'Firebase API called outside injection context: getDoc' v character-sheet-api.service.ts"),
      f('Oprava přepisování AC při vyhledávání monstra v iniciativní tabulce (např. při přidání krytů +5/+2)'),
      i('Alfa verze RPG inventáře s předměty'),
      i('Doplnění všech oblastí vyhledávání z Public D&D 5e API (např. vlastnosti/feats)'),
      i(
        'Odstranění zbytečných scrollbarů na některých stránkách a zmenšení/úprava bílé linky na spodním okraji stránky (černé pozadí)',
      ),
      i('Sjednocení všech klíčů local-storage do souboru local-storages.ts v /util'),
    ],
  },
  {
    date: '2. dubna 2026',
    entries: [
      i('Quest log pro hráče a speciální quest log pro DM (ukládáno do Firebase DB, ne do local-storage)'),
      i('Aktualizace záložek poznámek pro hráče a nová speciální stránka poznámek pro DM'),
      f('Oprava přepisování snížených HP plnými životy při opětovném vyhledání monstra v iniciativní tabulce'),
      f('Oprava hover oblasti tlačítek pro zvýšení/snížení HP v iniciativní tabulce'),
      i('Generátor událostí/jmen/situací/lootu pro DM'),
      i('Nové tlačítko Podmínky pro hráče (levý horní roh character-sheetu)'),
      i('Nový design obrázku postavy hráče (klasické nahrání obrázku jako např. na stránce předmětů)'),
      i('Konvertor obrázku na GIF na stránce character-sheet'),
      i('Aktualizace stránky Nápověda a tipy'),
    ],
  },
  {
    date: '22. března 2026',
    entries: [
      i(
        'Nová dedikovaná stránka DM s iniciativní tabulkou a vyhledáváním monster (vyhledávání monster na character-sheetu nyní zakázáno)',
      ),
      i(
        'Iniciativní tabulka má tlačítka pro kopírování řádků (přidává postfixy B, C, D... stále vyhledatelné v databázi, ale pouze s přesně přidaným postfixem) a tlačítka pro snadné přidání/odebrání HP',
      ),
      i('Automatické ukládání iniciativní tabulky do local-storage po 1500ms'),
      i('(TODO: unitTestRunner=jest by měl být v budoucnu nahrazen vitest)'),
    ],
  },
  {
    date: '8. března 2026',
    entries: [
      f('Automatické vyplnění HP a AC v iniciativní tabulce při vyhledání monstra'),
      f('Rozdělení character-sheet komponenty na menší komponenty (vyřešeno enhancement issue #8)'),
      i('Aktualizace verze Angularu v README badge na verzi 21'),
    ],
  },
  {
    date: '6. března 2026',
    entries: [
      i('Aktualizace URL aplikace v README'),
      i('Migrace Angular v20 na v21 a Nx v22.0.2 na v22.5.4'),
      i("Nové npm příkazy 'update' (nx migrate latest) a 'migrate' (nx migrate --run-migrations)"),
      i(
        'Vytvořen migrations.json (pozn. bootstrap-options-migration může způsobovat problémy, lze odstranit z migration souboru)',
      ),
      i('Instalován npm-check-updates (příkaz ncu --interactive pro výběr balíčků k aktualizaci)'),
      i("Aktualizace npm install příkazu na 'npm i --legacy-peer-deps' ve firebase-hosting workflow souborech"),
    ],
  },
  {
    date: '5. března 2026',
    entries: [
      i(
        'Automatické vyplnění formuláře dle zadaných hlavních vlastností — level je výchozí 1, bonus za zdatnost tedy výchozí +2, automaticky se přepočítá při změně levelu a aktualizuje navázaná pole (pole bonusu za zdatnost je nyní needitovatelné, ostatní vlastnosti zůstávají editovatelné)',
      ),
      i('Hody kostkou nyní dostupné pro všechny vlastnosti včetně záchranných hodů'),
      i('Dlouhé výsledky hodů mají tooltip (zatím základní prohlížečový)'),
      i(
        "Po přihlášení nápovědný dialog vysvětlující funkci 'autofill' a možnost házet kostkou na konkrétní vlastnost (lze vypnout zobrazování), včetně GIF videa s návodem na správné vyplnění formuláře",
      ),
      i('Zdatnost a expertíza nyní přes novou ikonu hvězdy místo checkboxů, s automatickým přičtením bonusu'),
      i('Checkboxy záchranných hodů na smrt nahrazeny ikonami srdce a lebky'),
      i('Aktualizace stránky Nápověda a tipy (včetně GIF videa)'),
      i('Historie hodů kostkou nyní uložena v local-storage s možností vymazání'),
      i(
        'Záloha (screenshot) z horního menu nyní stahuje pouze jeden dlouhý PNG obrázek (obě tlačítka zálohy včetně JSON zmenšena)',
      ),
      i('Vylepšený styl snackbarů pro informace o uložení'),
      i('Po odhlášení přesměrování na přihlašovací stránku'),
      i(
        '(Známý bug: stále problémy s automatickým reloadem a náhodným zobrazením snackbaru o ukládání po přihlášení — TODO: zvýraznit hlavní vstupní pole vlastností a levelu šipkou — TODO: rozdělit character-sheet.component na menší komponenty, protože má již několik tisíc řádků)',
      ),
    ],
  },
  {
    date: '3. března 2026',
    entries: [
      i('character-sheet.store nyní providedIn root a injektován v app.ts (potřeba dořešit)'),
      i('Aktualizace .firebaserc a firebase.json — aplikace by měla běžet na URL dnd-servant.web.app'),
      i(
        'Hody kostkou (nainstalován three.js, ale 3D modely nebyly dostatečné, zatím jen klasické 2D hody, funguje bez problémů)',
      ),
      i('Automatické vyplnění vlastností, záchranných hodů a pasivních schopností (chybí iniciativa z DEX)'),
      i('Ikony hvězdy namísto čtvercových checkboxů'),
      i(
        'Character sheet, group sheet a poznámky se po každém uložení ukládají i do local-storage jako záloha (automaticky každých 30s — užitečné při náhlém refreshi stránky, formulář se pak načte ze záložní kopie a vyšle se požadavek na uložení)',
      ),
      i(
        'Nová stránka Nápověda a tipy pro funkce/použití aplikace (nová knihovna /feature) — zatím neaktualizovaná o autofill a hody kostkou',
      ),
      i('Reálný překladač (Google Translate API) — odpovědi z DnD-5e-API se automaticky překládají přes translation pipe'),
      i('Aktualizace názvových konvencí pro vyhledávání v DnD API dle pravidel JaD'),
    ],
  },
  {
    date: '2. března 2026',
    entries: [
      i(
        'Vyhledávání v databázi DnD 5e 2014 přes více entit — monstra, rasy, podrasy, kouzla aj. (vlastní modely pro DnD 5e API, komponenty karet pro zobrazení entit, nová knihovna /dnd-rules-database)',
      ),
      f('Oprava slotů na kouzla po refreshi stránky a nový design checkboxů'),
      f('Oprava scrollování pod horním menu'),
      i(
        'Refactoring umístění souborů (API modely do /util, komponenty související s DnD databází do /dnd-rules-database, rich-textarea a autofill komponenty do /ui)',
      ),
      i('Vylepšení iniciativní tabulky, vyhledávání v dnd5e databázi a celkový refaktoring Nx knihoven'),
    ],
  },
];

const TYPE_LABELS: Record<ReleaseEntry['type'], string> = {
  fix: 'Fix',
  improvement: 'Vylepšení',
};

@Component({
  selector: 'app-release-notes-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatDialogModule],
  template: `
    <div class="rn-panel">
      <!-- Header -->
      <div class="rn-header">
        <mat-icon class="rn-header-icon">new_releases</mat-icon>
        <span class="rn-title">Co je nového</span>
        <button type="button" class="rn-close-btn" (click)="close()" aria-label="Zavřít">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Scrollable body -->
      <div class="rn-body">
        @for (group of notes; track group.date) {
          <div class="rn-group">
            <div class="rn-date">{{ group.date }}</div>
            <ul class="rn-list">
              @for (entry of group.entries; track entry.text) {
                <li class="rn-item">
                  <span class="rn-badge rn-badge--{{ entry.type }}">{{ typeLabel(entry.type) }}</span>
                  <span class="rn-entry-text">{{ entry.text }}</span>
                </li>
              }
            </ul>
          </div>
          <div class="rn-divider"></div>
        }
      </div>

      <!-- Footer -->
      <div class="rn-footer">
        <a
          href="https://github.com/Evincars/DnD-Servant"
          target="_blank"
          rel="noopener noreferrer"
          class="rn-gh-link"
        >
          <mat-icon class="rn-gh-icon">code_blocks</mat-icon>
          Evincars/DnD-Servant na GitHubu
        </a>
      </div>
    </div>
  `,
  styles: `
    /* ── Panel ─────────────────────────────────────────────── */
    .rn-panel {
      background: linear-gradient(180deg, rgba(8,5,18,.99) 0%, rgba(14,10,24,.99) 100%);
      border: 1px solid rgba(200,160,60,.4);
      border-radius: 10px;
      overflow: hidden;
      width: min(540px, 96vw);
      display: flex;
      flex-direction: column;
      max-height: 82vh;

      &::before {
        content: '';
        display: none;
      }
    }

    /* ── Header ────────────────────────────────────────────── */
    .rn-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px 12px;
      border-bottom: 1px solid rgba(200,160,60,.18);
      background: rgba(200,160,60,.04);
      flex-shrink: 0;
    }

    .rn-header-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(200,160,60,.7);
      flex-shrink: 0;
    }

    .rn-title {
      flex: 1;
      font-family: sans-serif;
      font-size: 14px;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 12px rgba(200,160,60,.4);
    }

    .rn-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      color: rgba(200,160,60,.45);
      transition: color .15s, background .15s;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover {
        background: rgba(200,160,60,.1);
        color: rgba(200,160,60,.9);
      }
    }

    /* ── Body ──────────────────────────────────────────────── */
    .rn-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(200,160,60,.25) transparent;
    }

    /* ── Date group ────────────────────────────────────────── */
    .rn-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rn-date {
      font-family: sans-serif;
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: rgba(200,160,60,.75);
      padding-bottom: 2px;
      font-weight: 600;
    }

    .rn-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,160,60,.2), transparent);
      margin: 12px 0;
    }

    .rn-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    /* ── Entry row ─────────────────────────────────────────── */
    .rn-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 5px 10px;
      border-radius: 6px;
      background: rgba(200,160,60,.025);
      transition: background .12s;

      &:hover { background: rgba(200,160,60,.06); }
    }

    /* ── Type badge ────────────────────────────────────────── */
    .rn-badge {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-family: sans-serif;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid;
      line-height: 1;
      height: 18px;
      margin-top: 1px;

      &--fix {
        color: rgba(220,100,80,.9);
        border-color: rgba(220,100,80,.35);
        background: rgba(220,100,80,.08);
      }

      &--improvement {
        color: rgba(100,160,240,.9);
        border-color: rgba(100,160,240,.35);
        background: rgba(100,160,240,.08);
      }
    }

    .rn-entry-text {
      flex: 1;
      font-family: sans-serif;
      font-size: 12px;
      color: rgba(200,185,155,.75);
      letter-spacing: .03em;
      line-height: 1.5;
    }


    /* ── Footer ────────────────────────────────────────────── */
    .rn-footer {
      flex-shrink: 0;
      padding: 10px 16px;
      border-top: 1px solid rgba(200,160,60,.12);
      background: rgba(200,160,60,.02);
      display: flex;
      justify-content: center;
    }

    .rn-gh-link {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: rgba(200,160,60,.4);
      font-size: 11px;
      letter-spacing: .06em;
      font-family: sans-serif;
      transition: color .15s;

      &:hover { color: rgba(200,160,60,.85); }
    }

    .rn-gh-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
    }
  `,
})
export class ReleaseNotesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ReleaseNotesDialogComponent>);

  readonly notes = RELEASE_NOTES;

  typeLabel(type: ReleaseEntry['type']): string {
    return TYPE_LABELS[type];
  }

  close(): void {
    this.dialogRef.close();
  }
}
