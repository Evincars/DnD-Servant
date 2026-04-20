import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, of, switchMap, take } from 'rxjs';
import { JadSpellsService } from './jad-spells.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface SpellDetailDialogData {
  spellName: string;
}

@Component({
  selector: 'spell-detail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
  styles: `
    :host {
      font-family: sans-serif;
      display: block;
    }

    .dlg {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      min-width: 750px;
      max-width: 820px;
      background: #0d0b1a;
      color: #d4c9a0;
      overflow: hidden;
    }

    .dlg-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px 12px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(200, 160, 60, 0.25);
      background: linear-gradient(180deg, rgba(28, 18, 4, 0.9) 0%, rgba(10, 8, 20, 0.9) 100%);
    }

    .dlg-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #e8c96a;
      text-shadow: 0 0 20px rgba(200, 160, 60, 0.5);
    }

    .dlg-title mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #c8a03c;
    }

    .dlg-close {
      background: none;
      border: 1px solid rgba(200, 160, 60, 0.25);
      border-radius: 4px;
      color: rgba(200, 160, 60, 0.6);
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.18s;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .dlg-close:hover {
      border-color: rgba(200, 160, 60, 0.7);
      color: #e8c96a;
      background: rgba(200, 160, 60, 0.1);
    }

    .dlg-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      scrollbar-width: thin;
      scrollbar-color: rgba(200, 160, 60, 0.4) rgba(10, 8, 20, 0.6);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: rgba(200, 160, 60, 0.5);
      font-style: italic;
    }

    /* Spell content rendered from wiki markdown */
    :host ::ng-deep .dlg-body {
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: #e8c96a;
        margin-top: 0.5em;
        margin-bottom: 0.4em;
        letter-spacing: 0.05em;
      }
      h1 {
        font-size: 1.4em;
        border-bottom: 1px solid rgba(200, 160, 60, 0.3);
        padding-bottom: 0.3em;
      }
      h2,
      h3,
      h4 {
        font-size: 1.1em;
      }
      em {
        color: rgba(200, 160, 60, 0.8);
        font-style: italic;
      }
      strong {
        color: #d4c9a0;
        font-weight: bold;
      }
      p {
        margin: 0.5em 0;
        line-height: 1.55;
        font-size: 14px;
      }
      ul,
      ol {
        padding-left: 1.4em;
        margin: 0.4em 0;
      }
      li {
        margin: 0.2em 0;
        font-size: 14px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 0.8em 0;
      }
      th,
      td {
        border: 1px solid rgba(200, 160, 60, 0.25);
        padding: 5px 10px;
        font-size: 13px;
      }
      th {
        background: rgba(200, 160, 60, 0.1);
        color: #e8c96a;
      }
      .heading-anchor {
        display: none;
      }
    }
  `,
  template: `
    <div class="dlg">
      <div class="dlg-header">
        <div class="dlg-title">
          <mat-icon>auto_awesome</mat-icon>
          {{ data.spellName || 'Kouzlo' }}
        </div>
        <button class="dlg-close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dlg-body">
        @if (loading()) {
          <div class="loading">Načítám…</div>
        } @else {
          <div [innerHTML]="content()"></div>
        }
      </div>
    </div>
  `,
})
export class SpellDetailDialogComponent {
  private readonly ref = inject(MatDialogRef<SpellDetailDialogComponent>);
  readonly data: SpellDetailDialogData = inject(MAT_DIALOG_DATA);
  private readonly spellsService = inject(JadSpellsService);

  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly content = signal<SafeHtml>('');

  private readonly _rawContent = toSignal(
    combineLatest([
      toObservable(this.spellsService.allSpells),
      toObservable(this.spellsService.snippetFiles),
    ]).pipe(
      filter(([spells, snippets]) => spells.length > 0 && snippets !== null),
      take(1),
      map(([spells]) => spells),
      switchMap(spells => {
        const spell = spells.find(
          s => JadSpellsService.normalizeStr(s.name) === JadSpellsService.normalizeStr(this.data.spellName),
        );
        if (!spell) {
          return of(`<p>Kouzlo "<strong>${this.data.spellName}</strong>" nebylo nalezeno v databázi JaD.</p>`);
        }
        return this.spellsService.loadSpellContent(spell);
      }),
    ),
  );

  constructor() {
    effect(() => {
      const val = this._rawContent();
      if (val !== undefined) {
        this.content.set(this.sanitizer.bypassSecurityTrustHtml(val));
        this.loading.set(false);
      }
    });
  }

  close() {
    this.ref.close();
  }
}
