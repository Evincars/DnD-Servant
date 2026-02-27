<div align="center">

# ⚔️ JaD Servant ⚔️
### Digitální pomocník pro *Jeskyně a Draci*

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Nx](https://img.shields.io/badge/Nx-Monorepo-143055?style=for-the-badge&logo=nx&logoColor=white)](https://nx.dev)
[![NgRx](https://img.shields.io/badge/NgRx-Signals-BA2BD2?style=for-the-badge&logo=ngrx&logoColor=white)](https://ngrx.io)
[![Material](https://img.shields.io/badge/Angular_Material-UI-007FFF?style=for-the-badge&logo=material-design&logoColor=white)](https://material.angular.io)

---

*Přestaňte tahat papírové deníky k hernímu stolu.*
*Vaše postava žije tady — online, vždy po ruce.*

---

</div>

## 🐉 Co je JaD Servant?

**JaD Servant** je online aplikace pro správu herních karet pro české RPG **Jeskyně a Draci**. Umožňuje hráčům vyplňovat, ukládat a sdílet své postavy přímo v prohlížeči — bez nutnosti tisknout, skenovat nebo opisovat papírové deníky.

Veškerá data jsou uložena v **Firebase Realtime Database** a přístupná odkudkoliv po přihlášení.

---

## ✨ Funkce

| Funkce | Popis |
|---|---|
| 📜 **Karta postavy** | Digitální replika 4stránkového formuláře JaD — strana 1 (základy), strana 2 (vzhled & příběh), strana 3 (kouzla) |
| 🗡️ **Karta družiny** | Sdílená karta skupiny s inventářem, reputací a zázemím |
| 🐴 **Karta koně** | Správa jezdeckých zvířat a dopravních prostředků |
| 📝 **Zápisník** | Volné poznámky a zápisky pro každou postavu |
| 🎲 **Tracker iniciativy** | Přehledný nástroj pro vedení pořadí v souboji |
| 🧙 **DM obrazovka** | Pomocná obrazovka pro Pána jeskyně |
| 🔒 **Autentizace** | Přihlášení uživatelů — každý má svá vlastní data |
| 📸 **Obrázek postavy** | Nahrání vlastního portrétu postavy (max 500 KB) |

---

## 🏰 Architektura

Projekt je postaven jako **Nx monorepo** s Angular 20 a využívá moderní koncepty:

```
DnD-Servant/
├── src/                          # Hlavní aplikace
├── libs/
│   ├── authentication/feature/   # Přihlašovací stránka
│   ├── character-sheet/
│   │   ├── feature/              # Komponenty karet (postava, družina, kůň, ...)
│   │   ├── data-access/          # NgRx Signals store + Firebase API
│   │   └── util/                 # Typy formulářů a API modelů
│   ├── dm-screen/feature/        # DM obrazovka
│   └── util/                     # Sdílené utility (AuthService, FormUtil, ...)
└── e2e/                          # End-to-end testy (Playwright)
```

### Technologický stack

- **[Angular 20](https://angular.dev)** — framework s Signal-based reaktivitou
- **[NgRx Signals](https://ngrx.io/guide/signals)** — správa stavu aplikace
- **[Angular Material](https://material.angular.io)** — UI komponenty (Cyan & Orange téma)
- **[Firebase Realtime Database](https://firebase.google.com)** — cloudové úložiště dat
- **[Nx](https://nx.dev)** — monorepo tooling & build systém
- **[RxJS](https://rxjs.dev)** — reaktivní programování

---

## 🚀 Spuštění

### Předpoklady

- Node.js 18+
- npm

### Instalace

```sh
npm install
```

### Spuštění vývojového serveru

```sh
npx nx serve DnD-Servant
```

Aplikace poběží na `http://localhost:4200`.

### Produkční build

```sh
npx nx build DnD-Servant
```
---

## 🎲 O hře Jeskyně a Draci


**Jeskyně a Draci** (JaD) je česká verze RPG ve stylu *Dungeons & Dragons*, vydávaná nakladatelstvím [Mytago](https://www.mytago.cz). Hra využívá systém d20 a je plně přizpůsobena českému prostředí a hráčům.

- 🌐 Oficiální stránky: [jeskyneadraci.cz](https://jeskyneadraci.cz)
- 📖 Pravidla a materiály ke stažení na oficiálním webu

---

## 🤝 Přispívání

Příspěvky jsou vítány! Pokud najdete chybu nebo máte nápad na vylepšení:

1. Forkněte repozitář
2. Vytvořte větev (`git checkout -b feature/moje-funkce`)
3. Commitněte změny (`git commit -m 'Přidána nová funkce'`)
4. Pushněte větev (`git push origin feature/moje-funkce`)
5. Otevřete Pull Request

---

<div align="center">

*Ať vás kostky provází* 🎲

**Built with ❤️ for the Czech D&D community**

</div>
