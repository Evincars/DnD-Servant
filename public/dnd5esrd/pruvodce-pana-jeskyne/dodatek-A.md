# Dodatek A: Náhodné jeskyně
  
Tento dodatek ti pomůže rychle vygenerovat jeskyni. Tabulky fungují iteračním způsobem. Prve si hoď na výchozí oblast, pak si hoď na určení chodeb a dveří, jež se v oblasti nachází. Jakmile máš počáteční chodby a dveře, urči umístění a povahu následných chodeb, dveří, místností, schodišť a tak dále — každé z nich se vygeneruje hody podle odlišných tabulek.
  
Následování těchto pokynů může vést k rozsáhlým komplexům, které pokrývají víc než jeden list čtverečkovaného papíru. Chceš-li jeskyni omezit, nastav předem limity, jak moc se může rozrůst.
  
Nejzjevnějším omezením velikosti jeskyně je čtverečkovaný papír, na který se kreslí. Pokud by rys přesáhl okraj papíru, zkrať ho. Chodba může zahnout, či se stát slepou na okraji mapy, nebo můžeš udělat místnost menší, aby se vešla do dostupného prostoru.
  
Případně můžeš rozhodnout, že chodby vedoucí mimo okraj mapy jsou další vstupy do jeskyně. Schodiště, šachty a jiné rysy, které by normálně vedly do pater, která neplánuješ zmapovat, mohou posloužit podobnému účelu.
  
## Výchozí oblast
  
Tabulka výchozí oblasti vytváří místnost nebo množinu chodeb u vstupu do tvé jeskyně. Když si házíš na náhodnou výchozí oblast, zvol jedny z dveří nebo chodeb vedoucích do výchozí oblasti jako vstup do celé jeskyně.
  
Jakmile zvolíš vstup, hoď si dle příslušné tabulky pro každou chodbu nebo dveře vedoucí z výchozí oblasti. Každou chodbu prodluž o 2 sáhy za výchozí oblast. Po tomto bodě si pro každou chodbu hoď dle Tabulky chodby, abys určil, co leží dál. Abys určil, co leží za dveřmi a tajnými dveřmi, použij Tabulku zádveří.
  
**Tabulka výchozí oblasti**


| k10 | Uspořádání |
| --- | --- |
| 1 | Čtverec, 4 × 4 s.; chodba v každé zdi |
| 2 | Čtverec, 4 × 4 s.; dveře ve dvou zdech, chod ba v třetí zdi |
| 3 | Čtverec, 8 × 8 s.; dveře ve třech zdech |
| 4 | Obdelník, 16 × 4 s., s řadou sloupů uprostřed; dvě chodby vedoucí z každé dlouhé zdi, dveře v každé krátké zdi |
| 5 | Obdelník, 4 × 8 s.; chodba v každé zdi |
| 6 | Kruh, 8 s. v průměru; jedna chodba na každou světovou stranu | 
| 7 | Kruh, 8 s. v průměru; jedna chodba na každou světovou stranu; studna uprostřed místnosti (může vést dolů do nižšího patra)|
| 8 | Čtverec, 4 × 4 s.; dveře ve dvou zdech, chod ba ve třetí zdi, tajné dveře ve čtvrté zdi |
| 9 | Chodba, 2 s. široká; křižovatka typu T |
| 10 | Chodba, 2 s. široká; křižovatka do kříže | 
  
## Chodby
  
Když generuješ chodby, hoď si několikrát dle Tabulky chodby a prodlužuj délku a větve jakékoli otevřené chodby na mapě, dokud nenarazíš na dveře nebo místnost.
  
Kdykoliv vytváříš novou chodbu, hoď si na určení její šířky. Když se chodba větví z jiné chodby, hoď si k12 dle Tabulky šířky chodby. Pokud vychází z místnosti, hoď si k20 dle této tabulky, ale šířka chodby musí být minimálně o 1 sáh menší než nejdelší rozměr místnosti.
  
**Tabulka chodby**


| k20 | Detail |
| --- | --- |
| 1–2 | Pokračuj rovně 6 s., žádné dveře ani postranní chodby |
| 3 | Pokračuj rovně 4 s., dveře vpravo a pak o 2 sáhy dál znovu |
| 4 | Pokračuj rovně 4 s., dveře vlevo a pak o 2 sáhy dál znovu |
| 5 | Pokračuj rovně 4 s., chodba končí dveřmi |
| 6–7 | Pokračuj rovně 4 s., postranní chodba vpravo a pak o 2 sáhy dál znovu |
| 8–9 | Pokračuj rovně 4 s., postranní chodba vlevo a pak o 2 sáhy dál znovu |
| 10 | Pokračuj rovně 4 s., slepá chodba; je 10% šance, že tam jsou tajné dveře |
| 11–12 | Pokračuj rovně 4 s. pak se chodba stáčí vlevo a pokračuje 2 s. |
| 13–14 | Pokračuj rovně 4 s. pak se chodba stáčí vpravo a pokračuje 2 s. |
| 15–19 | Místnost (hoď dle Tabulky místnosti) |
| 20 | Schodiště* (hoď dle Tabulky schodiště) |


\ * Existence schodiště předpokládá jeskyni s víc než jedním patrem. Nechceš-li vícepatrovou jeskyni, přehoď tento výsledek novým, použij schodiště jako alternativní vstup, nebo ho nahraď jiným rysem dle své volby.


**Tabulka šířky chodby**


| k12/k20 | Šířka | 
| --- | --- |
| 1–2 | 1 sáh |
| 3–12 | 2 sáhy |
| 13–14 | 4 sáhy |
| 15–16 | 6 sáhů |
| 17 | 8 sáhů, s řadou sloupů uprostřed |
| 18 | 8 sáhů, s dvojitou řadou sloupů |
| 19 | 8 sáhů široká, 4 sáhy vysoká |
| 20 | 8 sáhů široká, 4 sáhy vysoká, ochoz 2 sáhy nad zemí umožňuje vstup do vyššího patra |


## Dveře
  
Kdykoliv hod dle tabulky udává dveře, hoď si dle Tabulky typu dveří, abys určil jejich povahu, pak si hoď dle Tabulky zádveří, abys viděl, co leží na jejich opačné straně. Jsou-li dveře zavřené na petlici, rozhodni, na jaké straně dveří je petlice. Odemčené dveře mohou být i vzpříčené, dle tvého uvážení. Více informací o dveřích a padacích mřížích najdeš v 5. kapitole, „Dobrodružná prostředí“.
  
**Tabulka typu dveří**


| k20 | Typ dveří |
| --- | --- | 
| 1–10 | Dřevěné |
| 11–12 | Dřevěné, zavřené na petlici nebo zamčené |
| 13 | Kamenné |
| 14 | Kamenné, zavřené na petlici nebo zamčené |
| 15 | Železné |
| 16 | Železné, zavřené na petlici nebo zamčené |
| 17 | Padací mříž |
| 18 | Padací mříž, zamčená na místě |
| 19 | Tajné dveře |
| 20 | Tajné dveře, zavřené na petlici nebo zamčené |


**Tabulka zádveří**


| k20 | Rys |
| --- | --- |
| 1–2 | Chodba pokračující 2 s. a pak křižovatka typu T pokračující 2 s. doprava a doleva |
| 3–8 | Chodba 4 s. rovně |
| 9–18 | Místnost (hoď dle Tabulky místnosti) |
| 19 | Schodiště (hoď dle Tabulky schodiště) |
| 20 | Falešné dveře s pastí |
  
## Místnosti
  
Kdykoliv hod dle tabulky udává místnost, použij Tabulku místnosti k určení jejích rozměrů. Pak si hoď dle Tabulky východů z místnosti, abys určil počet východů. Pro každý východ si hoď dle Tabulky místa východu a Tabulky typu východu, abys určil povahu a umístění východu.
  
Pro určení obsahu místnosti použij tabulky v části „Zaplnění jeskyně“.
  
**Tabulka místnosti**


| k20 | Místnost |
| --- | --- |
| 1–2 | Čtverec, 4 × 4 s.* |
| 3–4 | Čtverec, 6 × 6 s.* |
| 5–6 | Čtverec, 8 × 8 s.* |
| 7–9 | Obdelník, 4 × 6 s.* |
| 10–12 | Obdelník, 6 × 8 s.* |
| 13–14 | Obdelník, 8 × 10 s.** |
| 15 | Obdelník, 10 × 16 s.* |
| 16 | Kruh, 6 s. v průměru s.* |
| 17 | Kruh, 10 s. v průměru s.** |
| 18 | Osmiúhelník, 8 × 8 s.** |
| 19 | Osmiúhelník, 12 × 12 s.** |
| 20 | Lichoběžník, zhruba 8 × 12 s.** |


\* Použij sloupec Normální místnost v Tab. východů z míst.


\** Použij sloupec Velká místnost v Tab. východů z místnosti.


**Tabulka východů z místnosti**


| k20 | Normální místnost | Velká místnost |
| --- | --- | --- |
| 1–3 | 0 | 0 |
| 4–5 | 0 | 1 |
| 6–8 | 1 | 1 |
| 9–11 | 1 | 2 |
| 12–13 | 2 | 2 |
| 14–15 | 2 | 3 |
| 16–17 | 3 | 3 |
| 18 | 3 | 4 |
| 19 | 4 | 5 |
| 20 | 4 | 6 |


**Tabulka místa východu**


| k20 | Místo |
| --- | --- |
| 1–7 | Zeď naproti vchodu |
| 8–12 | Zeď nalevo od vchodu |
| 13–17 | Zeď napravo od vchodu |
| 18–20 | Stejná zeď jako vstup |


**Tabulka typu východu**


| k20 | Typ |
| --- | --- |
| 1–10 | Dveře (hoď dle Tabulky typu dveří) |
| 11–20 | Chodba, 2 s. dlouhá |
  
## Schodiště
  
Schodiště může mít význam jakéhokoli trasy nahoru nebo dolů, včetně svahu, komínu, otevřené šachty, výtahu a žebříku. Má-li tvá jeskyně víc než jedno patro, vzdálenost mezi patry je na tobě. Pro většinu jeskyní funguje dobře vzdálenost 6 sáhů.
  
**Tabulka schodišť**


| k20 | Schodiště |
| --- | --- |
| 1–4 | Dolů o jedno patro do místnosti |
| 5–8 | Dolů o jedno patro do chodby dlouhé 4 s. |
| 9 | Dolů o dvě patra do místnosti |
| 10 | Dolů o dvě patra do chodby dlouhé 4 s. |
| 11 | Dolů o tři patra do místnosti |
| 12 | Dolů o tři patra do chodby dlouhé 4 s. |
| 13 | Nahoru o jedno patro do místnosti |
| 14 | Nahoru o jedno patro do chodby dlouhé 4 s. |
| 15 | Nahoru do slepé chodby |
| 16 | Dolů do slepé chodby |
| 17 | Komín vzhůru o 1 patro do chodby dlouhé 4 s. |
| 18 | Komín vzhůru o 2 patra do chodby dlouhé 4 s. |
| 19 | Šachta (s nebo bez výtahu) dolů o jedno patro do místnosti |
| 20 | Šachta (s nebo bez výtahu) vzhůru o 1 patro do místnosti a dolů o 1 patro do místnosti |


## Propojení oblastí
  
Když je tvá mapa hotová, zvaž přidání dveří mezi místnosti a chodby, které jsou vedle sebe, ale nejsou nijak propojené. Takové dveře vytváří více cest skrz jeskyni a rozšiřují možnosti hráčů.
  
Pokud se tvá jeskyně skládá z více než jednoho patra, zajisti, aby všechna schodiště, jámy a jiné svislé chodby byly setříděné mezi patry. Používáš-li čtverečkovaný papír, polož nový papír na svou existující mapu, označ místa se schodišti a jinými rysy, které sdílí obě patra, a začni mapovat nové patro.
  
## Zaplnění jeskyně
  
Vytvoření mapy tvé jeskyně je pouze polovina zábavy. Jakmile máš její uspořádání, musíš rozhodnout, jaké výzvy a odměny lze najít v chodbách a místnostech jeskyně. Jakékoli rozumně velké místo by mělo být zaplněno zajímavými pozoruhodnostmi, zvuky, předměty a tvory.
  
Nemusíš mít zakreslený každý poslední detail své jeskyně. Můžeš si vystačit jen se seznamem nestvůr, seznamem pokladů a seznamem jednoho či dvou klíčových prvků pro každou oblast jeskyně.
  
### Účel místnosti
  
Účel místnosti může pomoci s určením jejího vybavení a jiného obsahu.
  
Pro každou místnost na své mapě jeskyně stanov její účel, nebo ti s tím může pomoci tabulka níže. Každý typ jeskyně popsaný v části „Účel jeskyně“ v 5. kapitole, „Dobrodružná prostředí“, má svou tabulku udávající místnosti vybavené k účelu jeskyně. Pokud například buduješ hrobku, použij tabulku Jeskyně: Hrobka, která ti pomůže určit účel každé místnosti. Po těchto tabulkách specifických pro jeskyni následuje tabulka Obecné místnosti jeskyně, kterou můžeš použít, pokud tvá jeskyně zcela nezapadá do jednoho ze standardních typů jeskyně, nebo chceš-li věci trochu promíchat.
  
Spoléhání na náhodné hody při zaplňování celé jeskyně může vést k neslučitelným výsledkům. Malá místnůstka může skončit jako chrám, zatímco obrovská místnost vedle může sloužit jako skladiště. Může být zábavné pokusit se najít smysl takových divných návrhových nápadů, ale dělej změny, jak se ti hodí. Můžeš dát stranou několik klíčových místností a vytvořit pro ně specifický obsah.  
 
**Jeskyně: Vražedná past**


| k20 | Účel |
| --- | --- |
| 1 | Předsíň, či čekárna pro diváky |
| 2–8 | Opevněná strážnice proti narušitelům |
| 9–11 | Pokladnice s důležitými poklady, přístupná pouze zamčenými nebo tajnými dveřmi (je 75% šance na uvěznění) |
| 12–14 | Místnost obsahující hlavolam, který se musí vyřešit, pro překonání pasti či nestvůry |
| 15–19 | Past navržená pro zabití či chycení tvorů |
| 20 | Pozorovací místnost, umožňující strážím či divákům pozorovat tvory pohybující se jeskyní |


**Jeskyně: Doupě**


| k20 | Účel |
| --- | --- |
| 1 | Zbrojnice se zbraněmi a zbrojemi |
| 2 | Audienční sál, používaný k přijímání hostů |
| 3 | Hodovní síň pro důležité oslavy |
| 4 | Kasárna, kde jsou ubytovaní obránci doupěte |
| 5 | Ložnice, určená pro vůdce |
| 6 | Kaple, kde se modlí obyvatelé doupěte |
| 7 | Nádrž či studna s pitnou vodou |
| 8–9 | Strážnice pro obranu doupěte |
| 10 | Brloh pro domácí či hlídací zvířata |
| 11 | Kuchyně pro skladování a přípravu jídla |
| 12 | Ohrada či vězení, kde drží zajatce |
| 13–14 | Sklad, převážně pro trvanlivé zboží |
| 15 | Trůnní sál, kde zasedají vůdci doupěte |
| 16 | Mučírna |
| 17 | Školící místnost nebo tělocvična |
| 18 | Trofejní sál nebo muzeum |
| 19 | Latrína nebo koupelna |
| 20 | Dílna pro výrobu zbraní, zbrojí, pomůcek a jiného zboží |


**Jeskyně: Bludiště**


| k20 | Účel |
| --- | --- |
| 1 | Vyvolávací místnost, používaná k přivolávání tvorů, kteří stráží bludiště |
| 2–5 | Strážnice pro strážné, kteří hlídkují v bludišti |
| 6–10 | Doupě pro hlídací zvířata, jež hlídkují v bludišti |
| 11 | Ohrada či vězení, přístupné jen tajnými dveřmi, kde drží zajatce odsouzené do bludiště |
| 12 | Svatyně zasvěcená bohu či jiné bytosti |
| 13–14 | Sklad jídla i pomůcek pro strážce bludiště, aby udržovali komplex v chodu |
| 15–18 | Past, která mate či zabíjí ty, jež jsou posláni do bludiště |
| 19 | Studna poskytující pitnou vodu |
| 20 | Dílna, kde se opravují a udržují dveře, držáky pochodní a jiné vybavení |


**Jeskyně: Důl**


| k20 | Účel |
| --- | --- |
| 1–2 | Ubytovna pro horníky |
| 3 | Ložnice pro nadřízeného či správce |
| 4 | Kaple zasvěcená božskému patronovi horníků, země nebo ochrany |
| 5 | Nádrž poskytující horníkům pitnou vodu |
| 6–7 | Strážnice |
| 8 | Kuchyně pro stravování pracovníků |
| 9 | Laboratoř pro provádění testů na podivných nerostech vytěžených z dolu |
| 10–15 | Žíla, kde se těží kovová ruda (je 75% šance, že je vytěžená) |
| 16 | Kancelář hornického nadřízeného |
| 17 | Kovárna pro opravu poškozených pomůcek |
| 18–19 | Sklad pro pomůcky a jiné vybavení |
| 20 | Trezor či pokladnice pro skladování rudy k transportu na povrch |


**Jeskyně: Sférická brána**


| k% | Účel |
| --- | --- |
| 01–03 | Vyzdobená vstupní hala či předsíň |
| 04–08 | Zbrojnice strážců portálu |
| 09–10 | Audienční sál, používaný k přijímání hostů |
| 11–19 | Kasárna pro strážce portálu |
| 20–23 | Ložnice pro vysoce postavené členy řádu, kteří stráží portál |
| 24–30 | Kaple zasvěcená božstvu či božstvům vztahujícím se k portálu a jeho obráncům |
| 31–35 | Nádrž poskytující pitnou vodu
| 36–38 | Třída pro zasvěcence, kteří se v ní učí o tajemstvích portálu |
| 39 | Vyvolávací místnost, používaná k přivolávání tvorů, kteří zkoumají nebo brání portál |
| 40–41 | Hrobka s ostatky těch, kteří zemřeli při bránění portálu |
| 42–47 | Jídelna
| 48–50 | Věštírna pro zkoumání portálu a s ním svázaných událostí |
| 51–55 | Ubikace pro návštěvníky a strážce
| 56–57 | Vstupní místnost nebo vestibul
| 58–59 | Galerie vystavující trofeje a předměty související s portálem a těmi, kteří ho střeží |
| 60–67 | Strážnice pro ochranu či dohlížení nad portálem |
| 68–72 | Kuchyně |
| 73–77 | Laboratoř pro provádění experimentů souvisejícími s portálem a bytostmi, jež z něj vystupují |
| 78–80 | Knihovna s knihami o historii portálu |
| 81–85 | Ohrada či vězení, kde drží zajatce nebo bytosti, které vystupují z portálu |
| 86–87 | Sférický uzel, kde kdysi stála brána do jiné sféry (je 25% šance, že je stále aktivní) |
| 88–90 | Sklad |
| 91 | Trezor či pokladnice pro cenné poklady spojené s portálem, nebo prostředky pro placení strážců sférické brány |
| 92–93 | Studovna |
| 94 | Mučírna pro vyslýchání tvorů, kteří projdou portálem nebo kteří se snaží ho tajně použít |
| 95–98 | Latrína nebo koupelna |
| 99–100 | Dílna pro výrobu pomůcek a výbavy potřebných pro studium portálu |


**Jeskyně: Pevnost**


| k% | Účel |
| --- | --- |
| 01–02 | Předsíň, kde návštěvníci usilují o vstup do čekárny pevnosti |
| 03–05 | Zbrojnice s vysoce kvalitní výbavou, včetně lehkých obléhacích strojů jako balisty |
| 06 | Audienční sál, používaný pánem pevnosti k přijímání návštěvníků |
| 07 | Voliéra či ZOO s exotickými tvory |
| 08–11 | Hodovní síň pro důležité oslavy a hosty |
| 12–15 | Kasárna pro elitní stráže |
| 16 |  Koupelna s mramorovou podlahou a jinými luxusními doplňky |
| 17 | Ložnice pro pána pevnosti či důležité hosty |
| 18 | Kaple zasvěcená božstvu, jehož uctívá pán pevnosti |
| 19–21 | Nádrž poskytující pitnou vodu |
| 22–25 | Jídelna pro důvěrná shromáždění nebo neformální jídla |
| 26 | Šatna s množstvím šatníků |
| 27–29 | Galerie zobrazující nákladná umělecká díla a trofeje |
| 30–32 | Herna pro pobavení návštěvníků |
| 33–50 | Strážnice| 
| 51 | Brloh pro nestvůry nebo cvičená zvířata, která chrání pevnost |
| 52–57 | Kuchyně pro přípravu exotických jídel pro velký počet hostů |
| 58–61 | Knihovna s rozsáhlou sbírkou vzácných knih |
| 62 | Odpočívárna pro pobavení hostů |
| 63–70 | Spižírna, včetně sklepu pro víno a lihoviny |
| 71–74 | Obývací pokoj pro rodiny a důvěrné hosty |
| 75–78 | Stáj |
| 79–86 | Sklad pro obyčejné zboží a zásoby |
| 87 | Pokladnice s důležitými poklady (je 75% šance, že je schovaná za tajnými dveřmi) |
| 88–92 | Studovna, včetně psacího stolu |
| 93 | Trůnní sál, pečlivě zdobený |
| 94–96 | Čekárna, kde čekají méně důležití hosté, než jsou přijati k audienci |
| 97–98 | Latrína nebo koupelna |
| 99–100 | Hrobka patřící pánovi pevnosti nebo někomu jinému důležitému |


**Jeskyně: Chrám či svatyně**


| k% | Účel |
| --- | --- |
| 01–03 | Zbrojnice se zbraněmi a zbrojemi, bitevními standartami a vlajkami |
| 04–05 | Audienční sál, kde kněží chrámu přijímají prosté obyvatele a nízko postavené návštěvníky |
| 06–07 | Hodovní síň pro důležité oslavy a svaté dny |
| 08–10 | Kasárna pro vojenské křídlo chrámu nebo jím najaté strážce |
| 11–14 | Komůrky, kde věřící mohou sedět v tichém rozjímání |
| 15–24 | Ústřední chrám postavený k vykonávání rituálů |
| 25–28 | Kaple zasvěcená nižšímu božstvu vztahujícímu se k hlavnímu božstvu chrámu |
| 29–31 | Třída ke školení zasvěcenců a kněží |
| 32–34 | Vyvolávací místnost, speciálně posvěcená a používaná k přivolávání mimosférických tvorů |
| 35–40 | Hrobka pro velekněze či jinou podobnou osobu, skrytá a silně střežená tvory a pastmi |
| 41–42 | Jídelna (velká) pro služebníky a nižší kněze chrámu |
| 43 | Jídelna (malá) pro velekněze chrámu |
| 44–46 | Věštírna, ozdobená runami a naplněná věšteckými nástroji |
| 47–50 | Ubikace pro nižší kněze a studenty |
| 51–56 | Strážnice |
| 57 | Brloh pro zvířata a nestvůry spojené s božstvem chrámu |
| 58–60 | Kuchyně (ve zlém chrámu může znepokojivě připomínat mučírnu) |
| 61–65 | Knihovna, notně naplněná náboženskými spisy |
| 66–68 | Vězení pro zajaté nepřátele (v dobrých či neutrálních chrámech) nebo ty, jež jsou určeni jako oběti (ve zlých chrámech) |
| 69–73 | Oblékárna obsahující obřadní oblečení a předměty |
| 74 | Stáj pro jezdecké koně a jezdecká zvířata patřící chrámu, nebo pro přicházející posly a karavany |
| 75–79 | Sklad s obyčejnými zásobami |
| 80 | Trezor či pokladnice pro důležité relikvie a obřadné předměty, hustě zapasťovaná |
| 81–82 | Mučírna, používaná pro výslechy (v dobrých a neutrálních chrámech s ohnutím zákona) nebo pro čistou radost z působení bolesti (zlé chrámy) |
| 83–89 | Trofejní sál, kde je vystavené umění oslavující klíčové postavy a události z mytologie |
| 90 | Latrína nebo koupelna |
| 91–94 | Studna na pitnou vodu, hájitelná v případě útoku nebo obležení |
| 95–100 | Dílna, kde se opravují a vyrábí zbraně, náboženské předměty a pomůcky| 


**Jeskyně: Hrobka**


| k20 | Účel |
| --- | --- |
| 1 | Předsíň pro ty, kteří přišli složit poklonu mrtvým, nebo se připravit na pohřební rituály |
| 2–3 | Kaple zasvěcená božstvům, kteří dohlíží na mrtvé a chrání jejich hroby |
| 4–8 | Hrobka pro méně významné pohřby |
| 9 | Věštírna, užívaná k rituálům pro kontaktování mrtvého kvůli poradě |
| 10 | Falešná hrobka (zapasťovaná) k zabití či chycení zlodějů |
| 11 | Galerie zobrazující skutky zesnulých pomocí trofejí, soch, obrazů a tak dále |
| 12 | Velehrobka pro šlechtice, velekněze nebo jiného důležitého jedince |
| 13–14 | Strážnice, obvykle strážená nemrtvými, výtvory nebo jinými tvory, kteří nepotřebují jíst ani spát |
| 15 | Oblékárna pro kněze připravující se na pohřební rituály |
| 16–17 | Sklad, naplněný pomůckami pro údržbu hrobky a přípravu mrtvých k pohřbu |
| 18 | Hrobka, kde jsou pohřbeny nejbohatší a nejdůležitější osoby, chráněná tajnými dveřmi a pastmi |
| 19–20 | Dílna pro nabalzámování mrtvých |


**Jeskyně: Úschovna pokladů**


| k20 | Účel |
| --- | --- |
| 1 | Předsíň pro příchozí hodnostáře |
| 2 | Zbrojnice obsahující obyčejnou a magickou výbavu používanou k střežení úschovny pokladů |
| 3–4 | Kasárna pro stráže |
| 5 | Nádrž poskytující pitnou vodu |
| 6–9 | Strážnice pro bránění se vetřelcům |
| 10 | Brloh pro cvičená zvířata, která chrání úschovnu pokladů |
| 11 | Kuchyně pro stravování stráží |
| 12 | Dohledová místnost, která umožňuje strážím pozorovat ty, kteří přichází do jeskyně | 
| 13 | Vězení pro zadržování chycených vetřelců |
| 14–15 | Trezor či pokladnice, která střeží poklad ukrytý v jeskyni, přístupná pouze zamčenými nebo tajnými dveřmi |
| 16 | Mučírna pro páčení informací ze zajatých vetřelců |
| 17–20 | Past nebo jiná lest navržená pro zabití nebo zajmutí tvorů, kteří vstoupí do jeskyně |


**Obecné místnosti jeskyně**


| k% | Účel |
| --- | --- |
| 1 | Audienční sál |
| 2–3 | Aula |
| 4 | Bestiář |
| 5 | Brloh |
| 6 | Čekárna |
| 7–8 | Dílna |
| 9–10 | Galerie |
| 11–12 | Hala |
| 13–14 | Herna |
| 15–16 | Hodovní síň |
| 17–19 | Hrobka |
| 20–22 | Chrám |
| 23–24 | Jídelna |
| 25 | Kancelář |
| 26 | Kaple |
| 27–29 | Kasárna |
| 30–32 | Knihovna |
| 33–35 | Komůrka |
| 36 | Koupelna či latrína |
| 37–38 | Kovárna |
| 39–40 | Kuchyně |
| 41–42 | Laboratoř |
| 43 | Ložnice |
| 44 | Meditační místnost |
| 45 | Mučírna |
| 46–47 | Nádrž |
| 48 | Oblékárna |
| 49–50 | Obývací pokoj |
| 51–52 | Odpočívárna |
| 53–54 | Ohrada nebo vězení |
| 55 | Pozorovatelna |
| 56 | Předsíň |
| 57 | Přístěnek |
| 58–59 | Refektář |
| 60–61 | Sál |
| 62 | Salón |
| 63–64 | Sklad |
| 65–66 | Soudní dvůr |
| 67–68 | Spižírna |
| 69 | Stáj |
| 70–72 | Strážnice |
| 73 | Studna |
| 74–75 | Studovna |
| 76–77 | Svatyně |
| 78 | Šatna |
| 79–80 | Školící místnost nebo tělocvična |
| 81 | Školka či škola |
| 82–83 | Trezor nebo pokladnice |
| 84–85 | Trofejní sál nebo muzeum |
| 86–87 | Trůnní sál |
| 88 | Třída |
| 89 | Ubikace |
| 90–91  |Uvítací síň |
| 92–93 | Věštírna |
| 94 | Voliéra |
| 95 | Vstupní místnost nebo vestibul |
| 96–97 | Vyvolávací místnost |
| 98 | Zádušní kaple |
| 99–100 | Zbrojnice |  
  
### Současný stav místnosti


Pokud má jeskyně bouřlivou minulost, můžeš si hodit pro určení současného stavu jakékoliv části oblasti. Pokud ale místnost stále slouží svému zamýšlenému účelu, zůstává neporušená.
  
**Současný stav místnosti**


| k20 | Rysy |
| --- | --- |
| 1–3 | Trosky, částečně zhroucený strop |
| 4–5 | Díry, částečně zhroucená podlaha |
| 6–7 | Popel, obsah převážně spálený |
| 8–9 | Používá se jako tábořiště |
| 10–11 | Vodní tůň; původní obsah místnosti je poničený vodou |
| 12–16 | Rozbitý nábytek, ale pořád tu je |
| 17–18 | Předělaná k jinému použití hoď si dle tabulky Obecné místnosti jeskyně |
| 19 | Holé zdi |
| 20 | Starodávný a původní stav |
  
 ### Obsah místnosti
  
Jakmile máš povědomí o účelu různých místností jeskyně, můžeš se zamyslet nad obsahem těchto oblastí. Tabulka obsahu místnosti jeskyně ti umožňuje rozhodnout o obsahu místnosti náhodným hodem, nebo můžeš zvolit obsah konkrétních oblastí. Pokud obsah volíš, nezapomeň začlenit zajímavou, pestrou směsici věcí. Mimo obsah uvedený v této tabulce se podívej i na „Obohacení jeskyně“ dále v tomto dodatku, kde najdeš dodatečné předměty a prvky k vyplnění místností.
  
V Tabulce obsahu místnosti jeskyně je „dominantní obyvatel“ tvor, který oblast ovládá. Mazlíčci a spojenci napomáhají dominantnímu obyvateli. „Náhodní tvorové“ jsou mrchožrouti či protivové, obvykle osamělé nestvůry či malé skupinky procházející oblastí. Zahrnují takové tvory, jako jsou mrchodravci, líté krysy, rosolové krychle a rziví netvoři. Více informací o náhodných střetnutích najdeš v 3. kapitole, „Tvorba dobrodružství“.
  
**Tabulka obsahu místnosti jeskyně**


| k%  | Obsah |
| --- | --- |
| 01–08 | Nestvůra (dominantní obyvatel) |
| 09–15 | Nestvůra (dominantní obyvatel) s pokladem |
| 16–27 | Nestvůra (mazlíček či spojenec) |
| 28–33 | Nestvůra (mazlíček či spojenec) střežící poklad |
| 34–42 | Nestvůra (náhodná nestvůra) |
| 43–50 | Nestvůra (náhodná nestvůra) s pokladem |
| 51–58 | Náhodná nástraha (viz „Náhodné nástrahy jeskyně“) s nahodilým pokladem |
| 59–63 | Překážka (viz „Náhodné překážky“) |
| 64–73 | Past (viz „Náhodné pasti“) |
| 74–76 | Past (viz „Náhodné pasti“) chránící poklad |
| 77–80 | Lest (viz „Náhodné lsti“) |
| 81–88 | Prázdná místnost |
| 89–94 | Prázdná místnost s jeskynní nástrahou (viz „Náhodné nástrahy jeskyně“) |
| 95–100 | Prázdná místnost s pokladem |
  
### Nestvůry a motivace
  
Pokyny pro tvorbu střetnutí s nestvůrami najdeš v 3. kapitole, „Tvorba dobrodružství“. Určitě začleň střetnutí s různou obtížností, aby ses postaral o různorodost a očekávání.
  
Mocný tvor na začátku jeskyně vytváří tón vzrušení a nutí dobrodruhy spoléhat na svůj důvtip. Například, v prvním patře jeskyně může spát prastarý rudý drak, místnosti poblíž jeho doupěte naplňují oblaka kouře a zvuk jeho těžkého oddechování. Chytré postavy udělají všechno proto, aby se drakovi vyhnuly, třebaže statečný družinový zloděj uteče s pár mincemi z drakova pokladu.
  
Ne všechny nestvůry jsou automaticky nepřátelské. Když umísťuješ nestvůry do své jeskyně, zvaž jejich vztahy se sousedními tvory a jejich postoje k dobrodruhům. Postavám se může podařit uspokojit hladové zvíře jídlem, ale chytřejší tvorové mají složité motivace. Tabulka motivací nestvůry ti umožňuje použít cíle nestvůry k určení jejího výskytu v jeskyni.
  
U velkých skupin nestvůr vyskytujících se napříč několika místnostmi může motivace platit pro celou skupinu, nebo každá podskupina může mít rozporné cíle.


**Tabulka motivací nestvůry**


| k20 | Cíle |
| --- | --- |
| 1–2 | Najít svatyni |
| 3–5 | Dobýt jeskyni |
| 6–8 | Najít předmět v jeskyni |
| 9–11 | Zabít rivala |
| 12–13 | Skrýt se před nepřáteli |
| 14–15 | Uzdravit se z boje |
| 16–17 | Vyhnout se nebezpečí |
| 18–20 | Zbohatnout |
  
### Náhodné nástrahy jeskyně
  
Nástrahy se málokdy nachází v obydlených oblastech, protože je nestvůry buď odklízí, nebo se jim vyhýbají.
  
V *Bestiáři* jsou popsané vřesky a fialové houby. Jiné případné nástrahy jsou popsané v 5. kapitole, „Dobrodružná prostředí“.


**Tabulka jeskynních nástrah**


| k20 | Nástraha |
| --- | --- |
| 1–3 | Hnědá plíseň |
| 4–8 | Zelený hlen | 
| 9–10 | Vřesk |
| 11–15 | Pavučiny |
| 16–17 | Fialová houba |
| 19–20 | Žlutá plíseň |
  
### Náhodné překážky
  
Překážky blokují postup jeskyní. V některých případech to, co dobrodruzi považují za překážku, je snadnou trasou pro obyvatele jeskyně. Například, zatopená místnost je bariérou pro mnohé postavy, ale tvorové s vodním dechem jí proplují snadno.
  
Překážky mohou ovlivňovat víc než jednu místnost. Rokle může vést několika chodbami a místnostmi, nebo popraskat kamennou zem v širší oblasti kolem. Oblast nárazových větrů, které proudí z magického oltáře, může vířit vzduch méně nebezpečně desítky sáhů daleko všemi směry.


**Tabulka překážek**


| k20 | Překážka |
| --- | --- |
| 1 | Aura proti živým s poloměrem 1k10 × 2 sáhů; v auře si živí tvorové nemohou obnovit životy |
| 2 | Nárazové větry snižují rychlost na polovinu, způsobují nevýhodu k hodům na útok na dálku |
| 3 | Chodbu blokuje *bariéra čepelí* |
| 4–8 | Zával |
| 9–12 | 1k4 × 2 s. široká a 2k6 × 2 s. hluboká rokle, nejspíš se spojuje s jinými patry jeskyně |
| 13–14 | Záplava zanechala v oblasti 2k2 sáhů vody; nechť vodu obsahují vzhůru stoupající chodby, zvýšené podlahy nebo schody jdoucí vzhůru |
| 15 | Oblastí teče láva (je 50% šance, že přes ní vede kamenný most) |
| 16 | Přerostlé houby blokují postup a musí se posekat (je 25% šance, že je mezi nimi schovaná jeskynní nástraha v podobě plísně nebo houby) |
| 17 | Jedovatý plyn (způsobuje jedové zranění 1k6 za každou minutu v něm) |
| 18 | Účinek *otoč gravitaci* způsobuje, že tvorové padají ke stropu |
| 19 | Chodbu blokuje *ohnivá zeď* |
| 20 | Chodbu blokuje zeď *síly* | 
  
### Náhodné pasti
  
Pokud potřebuješ rychle past, nebo chceš dát do jeskyně náhodné pasti, použij příklady pastí uvedené v 5. kapitole, „Dobrodružná prostředí“, nebo tabulky níže. Použiješ-li tabulky, začni s Tabulkou účinků pasti a Tabulkou spouštěče pasti, jimiž určíš typ pasti a pak použij tabulky závažnosti zranění pasti, se kterými určíš, jak smrtící by měla past být. Více informací o závažnosti zranění pasti najdeš v 5. kapitole.
  
**Tabulka spouštěče pasti**


| k6 | Spouštěč |
| --- | --- |
| 1 | Šlápnutí (na podlahu, schody) |
| 2 | Projití (dveřmi, chodbou) |
| 3 | Dotknutí se (kliky, sochy) |
| 4 | Otevření (dveří, truhly) |
| 5 | Podívání se (na zeď, mystický symbol) |
| 6 | Pohnutí (dvoukolákem, kamenným kvádrem) |


**Tabulka závažnosti zranění pasti**


| k6 | Závažnost zranění |
| --- | --- |
| 1–2 | Nepříjemné |
| 3–5 | Nebezpečné |
| 6 | Vražedné |


**Tabulka účinků pasti**


| k%  | Účinek |
| --- | --- |
| 01–04 | Ze sochy nebo předmětu vystřelí magická střela |
| 05–07 | Sesuv schodiště vytvoří svah, který dopraví postavy do jámy u jeho dolního konce |
| 08–10 | Spadne stropní kvádr, nebo se sesune celý strop |
| 11–12 | V zamčené místnosti se pomalu snižuje strop |
| 13–14 | V podlaze se otevře skluz |
| 15–16 | Řinčící hluk přiláká blízké nestvůry |
| 17–19 | Dotknutí se předmětu spustí kouzlo rozklad |
| 20–23 | Dveře či jiný předmět je natřen kontaktním jedem |
| 24–27 | Ze zdi, podlahy nebo předmětu vytryskne oheň |
| 28–30 | Dotknutí se předmětu spustí kouzlo *zkamenění* |
| 31–33 | Podlaha se sesune, nebo je iluzí |
| 34–36 | Z otvoru se vypustí plyn: oslepující, kyselinový, paraly zující, otrávený nebo uspávací |
| 37–39 | Podlahové dlaždice jsou zelektrizované |
| 40–43 | Strážný znak |
| 44–46 | Chodbou se valí obrovská socha s koly |
| 47–49 | Ze zdi nebo předmětu vyletí blesk |
| 50–52 | Zamčenou místnost zaplavuje voda nebo kyselina |
| 53–56 | Z otevřené truhly vystřelí šipky |
| 57–59 | Zbraň, zbroj nebo běhoun po dotyku oživne a zaútočí (viz „Oživlé předměty“ v Bestiáři) |
| 60–62 | Skrz místnost nebo sál se houpe kyvadlo, buď z čepelí, nebo jako kyj |
| 63–67 | Pod postavami se otevře skrytá jáma (je 25% šance, že na dně jámy je černý puding nebo rosolová krychle |
| 68–70 | Skrytá jáma naplněná kyselinou nebo ohněm |
| 71–73 | Uzavírací jáma naplněná vodou |
| 74–77 | Ze zdi nebo předmětu se vynoří kůsovité čepele |
| 78–81 | Vyskočí kopí (nejspíš jedovatá) |
| 82–84 | Chatrné schodiště se zřítí na bodce |
| 85–88 | Hromová vlna odhodí postavy do jámy nebo na bodce |
| 89–91 | Kovové nebo kamenné čelisti zadrží postavu |
| 92–94 | Kamenný kvádr žuchne napříč chodbou |
| 95–97 | Symbol |
| 98–100 | Zdi se posunou k sobě |
  
### Náhodné lsti
  
Lsti jsou žertovnější a méně smrtící než pasti. Některé jsou účinky, které zbyly po tvůrcích jeskyně, zatímco jiné mohou být projevem podivné magické energie zaplavující jeskyni.
  
Následující tabulky ti umožňují vygenerovat náhodné lsti. Hoď si prve na určení předmětu, ve kterém je lest a pak si hoď na určení povahy lsti. Některé lsti mají trvalé účinky, které nelze rozptýlit; jiné jsou dočasné, nebo je lze neutralizovat kouzlem *rozptyl magii*. Ty rozhoduješ, který je který.


**Tabulka lstivých předmětů**


| k20 | Nástraha |
| --- | --- |
| 1 | Cvičný panák |
| 2 | Dveře |
| 3 | Freska |
| 4 | Gobelín nebo běhoun |
| 5 | Hořící oheň |
| 6 | Houbové pole |
| 7 | Kamenný obelisk |
| 8 | Kniha |
| 9 | Koule magické energie |
| 10 | Lebka |
| 11 | Malba| 
| 12 | Mozek uchovaný v nádobě |
| 13 | Nábytek |
| 14 | Popraskaný drahokam |
| 15 | Rostlina či strom |
| 16 | Runy vyryté na zdi nebo podlaze |
| 17 | Skleněná plastika |
| 18 | Socha |
| 19 | Vodní tůň |
| 20 | Zbroj |


**Tabulka lstí**


| k% | Účinek lsti |
| --- | --- |
| 01–03 | První osoba, která se předmětu dotkne, zestárne |
| 04–06 | Dotknutý předmět ožije, nebo oživí jiné předměty poblíž |
| 07–10 | Položí tři testové dovednostní otázky (pokud jsou všechny zodpovězeny správně, objeví se odměna) |
| 11–13 | Udělí odolání nebo zranitelnost |
| 14–16 | Po dotyku změní přesvědčení, osobnost, třídu velikosti, vzhled nebo pohlaví postavy |
| 17–19 | Změní jednu látku na jinou, například zlato v olovo nebo kov v křehký křišťál |
| 20–22 | Vytvoří silové pole |
| 23–26 | Vytvoří iluzi |
| 27–29 | Potlačí na čas kouzelné předměty |
| 30–32 | Zvětší nebo zmenší postavy |
| 33–35 | Magická ústa pronesou hádanku |
| 36–38 | Zmatek (zacílí všechny tvory do 2 sáhů) |
| 39–41 | Ukáže světové strany (pravdivě, či nepravdivě) |
| 42–44 | Splní přání |
| 45–47 | Popoletí, aby se vyhnul dotyku |
| 48–50 | Sešle na postavy úkol |
| 51–53 | Zvětší, zmenší, zruší, nebo otočí gravitaci |
| 54–56 | Vyvolá chamtivost |
| 57–59 | Obsahuje uvězněného tvora |
| 60–62 | Otvírá, nebo uzamyká východy |
| 63–65 | Nabízí hazardní hru, s příslibem odměny nebo cenné informace |
| 66–68 | Pomáhá určitým typům tvorů, nebo je zraňuje |
| 69–71 | Sešle na postavy *proměň tvora* (trvání 1 hodina)
| 72–75 | Zadá hlavolam nebo hádanku
| 76–78 | Brání pohybu |
| 79–81 | Vydá mince, falešné mince, drahokamy, falešné drahokamy, kouzelný předmět nebo mapu |
| 82–84 | Vypustí, přivolá, nebo se promění v nestvůru |
| 85–87 | Sešle na postavy sugesci |
| 88–90 | Při dotyku hlasitě zakvílí |
| 91–93 | Mluví (normální řečí, nesmysly, básně a rýmy, zpívá, sesílá kouzla nebo křičí) |
| 94–97 | Teleportuje postavy na jiné místo |
| 98–100 | Přehodí mysli dvou nebo víc postav |
  
### Náhodné poklady
  
Pro určení pokladu v každé oblasti své jeskyně použij tabulky a pokyny v 7. kapitole, „Poklad“.
  
### Prázdné místnosti
  
Prázdná místnost může být požehnáním pro postavy, jež potřebují bezpečné místo pro krátký odpočinek, nebo se zde mohou i zatarasit a odpočinout si důkladně.
  
Někdy taková místnost není tak prázdná, jak se zdá. Pokud postavy prohledají místnost pořádně, můžeš je odměnit tajnou přihrádkou obsahující deník, který patřil předchozímu obyvateli, mapu, jež vede do jiné jeskyně, nebo nějakým jiným objevem.
  
### Obohacení jeskyně
  
Tabulky v této části poskytují různorodé předměty a body zájmu, které lze umístit do jeskyně. Obohacení jeskyně může pomoci navodit atmosféru jeskyně, dávat ponětí o jeho tvůrcích a historii, poskytnout základy pro lsti a pasti, nebo podněcovat průzkum.
  
Pro náhodné vygenerování obohacení jeskyně si hoď jednou podle každé z následujících tabulek: Tabulka zvuků, Tabulka vzduchu a Tabulka pachů. Podle ostatních tabulek v této části si házej tak často, jak chceš, nebo zvol vhodné zařízení dané oblasti.


**Tabulka zvuků**


| k% | Účinek |
| --- | --- |
| 01–05 | Bouchnutí nebo třesknutí |
| 06 | Brnkání |
| 07 | Břinkání |
| 08 | Bubnování |
| 09–10 | Bušení |
| 11 | Bzučení |
| 12 | Cinkání |
| 13 | Cvakání |
| 14–15 | Dunění |
| 16 | Gong |
| 17–18 | Hihňání (slabé) |
| 19–20 | Hučení |
| 21–22 | Hudba |
| 23–24 | Hvízdání |
| 25 | Chrastění |
| 26–28 | Chvalozpěv |
| 29–30 | Ječení |
| 31 | Kašlání |
| 32–35 | Klepání |
| 36–37 | Klouzání |
| 38 | Kňučení |
| 39–40 | Kroky po straně |
| 41–44 | Kroky vepředu |
| 45–47 | Kroky vzadu |
| 48 | Křičení |
| 49 | Kýchání |
| 50–52 | Mumlání |
| 53–54 | Naříkání |
| 55–56 | Pískání |
| 57–59 | Přibližující se kroky |
| 60 | Pukání |
| 61 | Rachotění |
| 62 | Ržání |
| 63 | Řinčení |
| 64–66 | Skřípání |
| 67–68 | Smích |
| 69–70 | Sténání |
| 71–72 | Syčení |
| 73 | Šeptání |
| 74–77 | Škrábání nebo hrabání |
| 78 | Šoupání |
| 79 | Šplouchání |
| 80 | Štípání |
| 81–84 | Šustění |
| 85 | Švitoření |
| 86–87 | Ťukání |
| 88–90 | Utíkání |
| 91 | Vrčení |
| 92–93 | Vrzání |
| 94 | Vytí |
| 95 | Vyzvánění |
| 96–97 | Vzdalující se kroky |
| 98 | Vzlykání |
| 99 | Zvonění |
| 100 | Zvuk rohu nebo trumpety |


**Tabulka vzduchu**


| k% | Účinek |
| --- | --- |
| 01–60 | Čistý a vlhký |
| 61–70 | Čistý, průvan |
| 71–80 | Čistý, ale chladný |
| 81–83 | Mlha a chlad |
| 84–85 | Čistý, podlahu pokrývá mlha |
| 86–90 | Čistý a teplý |
| 91–93 | Opar a dusno |
| 94–96 | Zakouřený či plný páry |
| 97–98 | Čistý, ale strop pokrývá kouř | 
| 99–100 | Čistý, větrno |


**Tabulka pachů**


| k%  | Účinek |
| --- | --- |
| 01–05 | Hnilobný |
| 06–13 | Hnůj |
| 14–15 | Chlor |
| 16–20 | Kouř |
| 21–24 | Kovový |
| 25–29 | Moč |
| 30–33 | Ozónový |
| k% Úči | nek |
| 34–67 | Plesnivý |
| 68–72 | Shnilá zelenina |
| 73–78 | Sirnatý |
| 79–80 | Slaný a vlhký |
| 81–83 | Štiplavý |
| 84–90 | Zatuchlý |
| 91–100 | Zemitý |


**Tabulka obecných rysů**


| k% Pře | dmět |
| --- | --- |
| 01–03 | Bodec, zrezivělý |
| 04 | Čepel meče, zlomená |
| 05–07 | Guano |
| 08–09 | Hadry |
| 10 | Hlava kladiva, prasklá |
| 11 | Houba (běžná) |
| 12 | Hrot oštěpu, tupý |
| 13 | Hrudka vosku (zbytek svíčky) |
| 14 | Hůl, zlomená (1 sáh dlouhá) |
| 15 | Jílec dýky |
| 16–17 | Kameny, malé |
| 18–24 | Kapající krev |
| 25 | Keramické střepy |
| 26–27 | Kosti |
| 28 | Kožená bota |
| 29–31 | Kusy dřeva, hnijící |
| 32 | Kyj, rozštípnutý |
| 33 | Láhev, rozbitá |
| 34 | Lahvice, prasklá |
| 35–37 | Listí a větvičky |
| 38 | Mince, měděná |
| 39 | Oharek pochodně |
| 40–49 | Pavučiny |
| 50–53 | Plíseň (obyčejná) |
| 54–56 | Popel |
| 57–61 | Prach |
| 62 | Provaz, zpuchřelý |
| 63 | Přilba, hrozně promáčknutá |
| 64–65 | Pukliny v podlaze |
| 66–67 | Pukliny ve stropě |
| 68–69 | Pukliny ve zdi |
| 70 | Řetěz, zrezivělý |
| 71 | Sláma |
| 72 | Sliz (neškodný) |
| 73–75 | Suť a trosky |
| 76 | Šíp, zlomený |
| 77 | Škrábance na zdi |
| 78 | Topůrko cepínu |
| 79–81 | Trus |
| 82 | Tyčky |
| 83 | Vlas nebo chlup |
| 84–85 | Vlhký strop |
| 86–87 | Voda, malá louže |
| 88–89 | Voda, stružka |
| 90–91 | Voda, velká louže |
| 92 | Voskové kapky |
| 93 | Zaschlá krev |
| 94 | Zbytky záplavy |
| 95 | Zuby či tesáky, roztroušené |
| 96–99 | Zvlhlá zeď |
| 100 | Železná tyč, ohnutá a rezavá |


**Tabulka obecného zařízení a vybavení**


| k% | Předmět |
| --- | --- |
| 1 | Almara |
| 2 | Barel (40 galonů) |
| 3 | Bečka (105 galonů) |
| 4 | Bedna |
| 5–7 | Běhoun (malý nebo střední) |
| 8 | Brousek |
| 9 | Bufetový stůl |
| 10 | Deka |
| 11 | Fontána |
| 12 | Freska |
| 13 | Gobelín |
| 14 | Káď (obrovská, 250 galonů) |
| 15 | Kanape |
| 16 | Kavalce |
| 17 | Klekátko |
| 18 | Koberec (velký) |
| 19 | Koks |
| 20–22 | Kolíčky |
| 23 | Koš na oheň a koks |
| 24 | Krabice (velká) |
| 25 | Kredenc |
| 26 | Křeslo |
| 27 | Kýbl |
| 28 | Lať |
| 29 | Lavice |
| 30 | Lustr |
| 31 | Malý barel (20 galonů) |
| 32 | Matrace |
| 33 | Nástěnný svícen |
| 34 | Nůše |
| 35 | Obraz |
| 36–38 | Ohniště a dřevo |
| 39 | Ohniště s krytem |
| 40 | Oltář |
| 41–43 | Paleta |
| 44 | Pivní sud (obrovský, 125 galonů) |
| 45 | Plenta |
| 46 | Pódium |
| 47 | Podstavec |
| 48 | Poduška |
| 49–50 | Pohovka |
| 51–52 | Police |
| 53 | Polínka |
| 54 | Polštář |
| 55 | Ponk |
| 56–57 | Postel |
| 58 | Prostěradlo |
| 59 | Příborník |
| 60 | Přikrývka |
| 61 | Psací stůl |
| 62 | Pytel |
| 63 | Rákosí |
| 64 | Rohožka |
| 65 | Skříňka |
| 66 | Smolný koš |
| 67 | Socha (velká) |
| 68 | Sokl |
| 69 | Soška |
| 70 | Soudek (10 galonů) |
| 71 | Stolička, normální |
| 72 | Stolička, vysoká |
| 73 | Stůl, dlouhý |
| 74 | Stůl, kulatý |
| 75 | Stůl, malý |
| 76 | Stůl, nízký |
| 77 | Stůl, skládací |
| 78 | Stůl, velký |
| 79 | Stupínek |
| 80 | Sud (40 galonů) |
| 81 | Svatyně |
| 82 | Svícen |
| 83 | Šatník |
| 84 | Tkalcovský stav |
| 85 | Truhla se zásuvkami |
| 86 | Truhla, střední |
| 87 | Truhla, velká |
| 88 | Trůn |
| 89 | Uhlí |
| 90 | Umývadlo a kohoutek |
| 91 | Urna |
| 92 | Vak |
| 93 | Vana |
| 94 | Vědro |
| 95 | Velký sud (65 galonů) |
| 96 | Zástěna či závěs |
| 97–98 | Židle, prostá |
| 99 | Židle, vypolstrovaná |
| 100 | Židle, vypolstrovaná, nebo gauč |


**Náboženské předměty a zařízení**


| k% Pře | dmět |
| --- | --- |
| 01 | Buben |
| 02–03 | Gong |
| 04–05 | Kadidelnice |
| 06–10 | Kadidlový kahan |
| 11 | Kazatelna |
| 12 | Klekátko |
| 13–15 | Koš na oheň |
| 16–17 | Kropenka |
| 18–21 | Lampa |
| 22–23 | Lavice |
| 24 | Malby nebo fresky |
| 25–30 | Modla |
| 31 | Modlitební běhoun |
| 32 | Mozaika |
| 33–35 | Obětní nádoba |
| 36–40 | Oltář |
| 41–47 | Ornáty |
| 48 | Píšťalka |
| 49 | Pult |
| 50–53 | Roucha |
| 54–57 | Sloupy či pilíře |
| 58–60 | Socha |
| 61–62 | Stupínek |
| 63 | Sutany |
| 64–65 | Svaté nebo kacířské spisy |
| 66–71 | Svatý nebo kacířský symbol |
| 72–76 | Svatyně |
| 77 | Svícny |
| 78 | Svíčkový lustr |
| 79–80 | Svíčky |
| 81–86 | Trojnožka |
| 86 | Trůn |
| 87–88 | Ubrus, oltářní |
| 89 | Varhany |
| 90–91 | Votivní světlo |
| 92 | Zábradlí |
| 93–94 | Zástěna |
| 95 | Závěs či gobelín |
| 96 | Zvonkohra |
| 97–99 | Zvony |
| 100 | Židle |


**Mágské zařízení**


| k% | Předmět |
| --- | --- |
| 1–3 | Alembik |
| 4–5 | Brk |
| 6–7 | Bylinky |
| 8 | Čočka (spojka nebo rozptylka) |
| 9 | Drát |  
| 10 | Dýmka |
| 11–12 | Džbán |
| 13–15 | Flakónek |
| 16 | Hmoždíř a palička |
| 17 | Hranol |
| 18 | Hrnec |
| 19 | Karafa |
| 20 | Klec |
| 21 | Kleště |
| 22–25 | Kniha |
| 26 | Konvice |
| 27–30 | Koš na oheň |
| 31–32 | Kotel |
| 33–33 | Krabice |
| 34–35 | Křída |
| 36 | Křišťálová koule |
| 37–39 | Křivule |
| 40–41 | Láhev |
| 42–45 | Lahvice nebo sklenice |
| 46 | Lampa nebo lucerna |
| 47–48 | Lebka |
| 49 | Lžička, měrná |
| 50 | Magický kruh |
| 51 | Měchy |
| 52 | Míchací tyč nebo tyčinka |
| 53 | Mísa |
| 54 | Naběračka |
| 55 | Nádrž |
| 56 | Pánev |
| 57 | Pec |
| 58 | Pentagram |
| 59 | Pentakl |
| 60 | Pinzeta |
| 61–64 | Pohár |
| 65–72 | Ponk |
| 73–74 | Přesýpací hodiny |
| 75 | Psací stůl |
| 76 | Roh |
| 77 | Sextant |
| 78 | Stěrka |
| 79 | Stolička |
| 80 | Stupínek |
| 81–82 | Svícen |
| 83 | Svíčka |
| 84–85 | Svitek |
| 86–88 | Svitek |
| 89 | Talíř |
| 90 | Trojnožka |
| 91–92 | Trubka |
| 93 | Trychtýř |
| 94 | Tubus |
| 95–96 | Tyglík |
| 97–98 | Váhy a závaží |
| 99 | Vodní hodiny |
| 100 | Vycpané zvíře |


**Nádobí a osobní věci**


| k% | Předmět |
| --- | --- |
| 1–2 | Bavlna |
| 3 | Brk |
| 4 | Brousek |
| 5 | Břitva |
| 6 | Dudy |
| 7 | Dýmka |
| 8 | Džbán |
| 9–10 |Flakónek |
| 11 | Hrnec |
| 12 | Hrnek |
| 13 | Hřeben |
| 14 | Jehla (jehly) |
| 15 | Jídlo |
| 16 | Karafa |
| 17–18 | Kartáč |
| 19 | Klíč |
| 20–21 | Kniha |
| 22 | Kolínská nebo parfém |
| 23 | Konev |
| 24 | Konvice |
| 25 | Kostky |
| 26–27 | Koš |
| 28 | Krabice |
| 29–31 | Křesadlo |
| 32 | Kufr |
| 33–34 | Láhev |
| 35–36 | Lahvice nebo sklenice |
| 37–38 | Lampa nebo lucerna |
| 39 | Lano |
| 40 | Lžíce |
| 41 | Mast čí mazadlo |
| 42 | Mísa |
| 43 | Mlýnek |
| 44–45 | Mýdlo |
| 46 | Naběračka |
| 47–48 | Nit |
| 49 | Nůž |
| 50 | Obvazy |
| 51 | Olej, na vaření |
| 52 | Olej, palivový |
| 53 | Olej, vonný |
| 54 | Pánev |
| 55–56 | Paruka |
| 57–59 | Pergamen |
| 60 | Pípa |
| 61 | Podnos |
| 62 | Polévková mísa |
| 63–64 | Provázek |
| 65 | Přesýpací hodiny |
| 66 | Roh na pití |
| 67 | Ručník |
| 68 | Sítko nebo |
| ced | ník |
| 69–70 | Soška či loutka |
| 71 | Struhadlo |
| 72 | Svícen |
| 73 | Svíčka |
| 74–75 | Svitek |
| 76 | Šejkr |
| 77 | Šídlo |
| 78 | Šperkovnice (malá) |
| 79 | Tabák |
| 80 | Tác nebo miska |
| 81–82 | Talíř |
| 83 | Trojnožka |
| 84–85 | Truhlice |
| 86 | Umývadlo |
| 87 | Ušní tyčinka |
| 88–89 | Váček |
| 90 | Váza |
| 91 | Vidlička |
| 92 | Vinná karafa nebo korbel |
| 93–94 | Vlna |
| 95 | Vycházková hůl |
| 96 | Zátka |
| 97 | Zhášeč svíček |
| 98–99 | Zrcadlo |
| 100 | Žínka |


**Tabulka obsahu nádoby**


| k% | Předmět |
| --- | --- |
| 1–2 | Hroudy, neidentifikovatelné |
| 3–7 | Kapalina, hustá |
| 8–15 | Kapalina, řídká |
| 16–20 | Kosti |
| 21–22 | Koule (kovové, kamenné, či dřevěné) |
| 23–25 | Kůra |
| 26–27 | Kůže či kožešina |
| 28–30 | Lanka |
| 31–35 | Listí |
| 36–40 | Minerály |
| 41–43 | Olej |
| 44–46 | Pásy |
| 47–49 | Pilulky |
| 50–51 | Polokapalná suspenze |
| 52–54 | Popel |
| 55–58 | Prach |
| 59–71 | Prášek |
| 72–74 | Rosol |
| 75–77 | Sádlo |
| 78–80 | Slupky |
| 81–82 | Stébla |
| 83–85 | Škvára |
| 86–88 | Tělesné orgány |
| 89–92 | Těsto |
| 93–94 | Třísky |
| 95–96 | Vlákna |
| 97–100 | Zrní |


**Tabulka knih, svitků a rukovětí**


| k% | Obsah |
| --- | --- |
| 1–2 | Alchymistické poznámky |
| 3–4 | Almanach |
| 5–6 | Básně |
| 7 | Běsnění šílence |
| 8–9  |Bestiář |
| 10–12 | Cestopis o exotické zemi |
| 13 | Cestopis o sférách |
| 14–16 | Čmáranice nebo náčrtky |
| 17–19 | Deník |
| 20–27 | Dopis |
| 28 | Herbář |
| 29–33 | Historický text |
| 34 | Ilustrace |
| 35–36 | Kacířský text |
| 37 |Kalendář |
| 38–42 | Katalog |
| 43–45 | Kniha heraldiky |
| 46 | Kniha kouzel |
| 47 | Kniha mýtů |
| 48 | Královská vyhláška |
| 49–50 | Lodní mapa nebo mapa hvězdné oblohy |
| 51 | Magické triky (ne kniha kouzel) |
| 52 | Magický svitek |
| 53 | Majetkový doklad |
| 54–56 | Mapa nebo atlas |
| 57–58 | Matematický text |
| 59–60 | Modlitební kniha |
| 61 | Monografie |
| 62–63 | Noty |
| 64 | Padělaný dokument |
| 65–66 | Poslední vůle a závěť |
| 67–70 | Receptář nebo kuchařka |
| 71–72 | Román |
| 73 | Rukověť zakázaného vědění |
| 74 | Sešit gramatiky |
| 75–76 | Slovník |
| 77–78 | Smlouva |
| 79 | Teologický text |
| 80–81 | Text o astrologii |
| 82–83 | Text o bylinkářství |
| 84–85 | Text o exotických rostlinách a zvířatech |
| 86 | Text o lékařství |
| 87–88 | Text o místních rostlinách |
| 89–90 | Text o pivovarnictví |
| 91 | Text o výrobě zbrojí |
| 92 | Text o zednictví |
| 93–94 | Účetní záznamy |
| 95–96 | Zákoník |
| 97 | Záznam o trestním procesu |
| 98–100 | Životopis |
<!--stackedit_data:
eyJoaXN0b3J5IjpbODY1MjE2NzA0XX0=
-->