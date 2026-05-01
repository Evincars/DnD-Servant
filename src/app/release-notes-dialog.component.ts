import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface ReleaseEntry {
  type: 'feature' | 'fix' | 'improvement';
  text: string;
}

export interface ReleaseGroup {
  date: string;
  entries: ReleaseEntry[];
}

const RELEASE_NOTES: ReleaseGroup[] = [
  {
    date: 'Květen 2026',
    entries: [
      { type: 'feature', text: 'Příkazová paleta (Ctrl+K) — rychlá navigace na všechny stránky a záložky aplikace' },
      { type: 'feature', text: 'Klávesová zkratka Alt+← / Alt+→ pro nekonečné přepínání záložek' },
      { type: 'feature', text: 'Gesta pro přepínání záložek — přejeďte prstem doleva/doprava na mobilním zařízení' },
      { type: 'feature', text: 'Přehled klávesových zkratek v dialogu Nastavení' },
      { type: 'fix', text: 'Vyhledávání v příkazové paletě ignoruje diakritiku — „zas" najde „Zástěna"' },
      { type: 'fix', text: 'Přesměrování na správnou záložku z příkazové palety při pohybu na stejné stránce' },
    ],
  },
  {
    date: 'Duben 2026',
    entries: [
      { type: 'fix', text: 'Drag & drop sekcí v kartě postavy — sekce si nyní pamatuje pořadí a správně animuje přesunutí' },
      { type: 'fix', text: 'Oprava náhodného umístění sekce při přetahování způsobené duplicitní registrací přetahovatelného prvku' },
    ],
  },
  {
    date: 'Únor 2026',
    entries: [
      { type: 'feature', text: 'Temné téma karet postavy a přepínání motivu v dialogu Nastavení' },
      { type: 'feature', text: 'Export zálohy postavy jako PNG obrázek nebo JSON soubor' },
      { type: 'improvement', text: 'Optimalizace výkonu pomocí Angular Signals a OnPush strategie změny detekce' },
    ],
  },
  {
    date: 'Prosinec 2025',
    entries: [
      { type: 'feature', text: 'Záložka J&D wiki s vyhledáváním v pravidlech Jeskyně a Draci' },
      { type: 'feature', text: 'Konvertor obrázků pro formátování fotek profilu postav' },
      { type: 'improvement', text: 'Drag & drop přeuspořádání sekcí karty postavy s ukládáním do localStorage' },
    ],
  },
  {
    date: 'Říjen 2025',
    entries: [
      { type: 'feature', text: 'PH zástěna — přehledová obrazovka pro Pána Hry s rychlými referencemi' },
      { type: 'feature', text: 'PH nástroje — tracker iniciativy, questy PH, poznámky a generátor' },
      { type: 'feature', text: 'Databáze D&D — prohledávatelná encyklopedie pravidel a monster' },
    ],
  },
];

const TYPE_LABELS: Record<ReleaseEntry['type'], string> = {
  feature: 'Novinka',
  fix: 'Oprava',
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
                  <a
                    class="rn-author"
                    href="https://github.com/Evincars"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub: Evincars"
                  >Evincars</a>
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
      width: min(520px, 96vw);
      display: flex;
      flex-direction: column;
      max-height: 80vh;

      &::before {
        content: '◆';
        position: absolute;
        top: -7px; left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        color: rgba(200,160,60,.6);
        background: rgba(8,5,18,1);
        padding: 0 6px;
        pointer-events: none;
        z-index: 2;
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
      font-family: 'Mikadan', sans-serif;
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
      font-family: 'Mikadan', sans-serif;
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: rgba(200,160,60,.65);
      padding-bottom: 2px;
    }

    .rn-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,160,60,.2), transparent);
      margin: 14px 0;
    }

    .rn-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* ── Entry ─────────────────────────────────────────────── */
    .rn-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      background: rgba(200,160,60,.03);
      border-left: 2px solid transparent;
      transition: background .12s;

      &:hover { background: rgba(200,160,60,.07); }
    }

    /* ── Type badge ────────────────────────────────────────── */
    .rn-badge {
      flex-shrink: 0;
      font-size: 9px;
      font-family: 'Mikadan', sans-serif;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid;
      line-height: 1.4;

      &--feature {
        color: rgba(100,200,120,.9);
        border-color: rgba(100,200,120,.35);
        background: rgba(100,200,120,.08);
      }

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
      font-size: 12px;
      color: rgba(200,185,155,.75);
      letter-spacing: .03em;
      line-height: 1.45;
    }

    .rn-author {
      flex-shrink: 0;
      font-size: 10px;
      color: rgba(200,160,60,.4);
      text-decoration: none;
      letter-spacing: .06em;
      font-family: 'Mikadan', sans-serif;
      transition: color .15s;
      white-space: nowrap;

      &:hover { color: rgba(200,160,60,.85); text-decoration: underline; }

      &::before { content: '@ '; }
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
      font-family: 'Mikadan', sans-serif;
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

