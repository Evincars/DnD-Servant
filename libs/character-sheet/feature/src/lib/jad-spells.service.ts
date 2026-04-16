import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { marked } from 'marked';
import { WikiService } from './wiki/wiki.service';

export interface JadSpell {
  name: string;
  slug: string;
  file: string;
}

interface HeadingEntry {
  b: string;
  f: string;
  h: string;
  s: string;
}

const JAD_SPELL_FILES = new Set([
  '10c-magie-kouzla-0-3.md',
  '10d-magie-kouzla-4-9.md',
]);

const EXCLUDED_SLUGS = new Set([
  'popisy-kouzel',
  'triky',
  'kouzla',
  'dostupna-kouzla-povolani',
]);

const EXCLUDED_SLUG_PATTERN = /^\d+-stupen$/;

@Injectable({ providedIn: 'root' })
export class JadSpellsService {
  private readonly http = inject(HttpClient);
  private readonly wiki = inject(WikiService);

  private readonly _headings = toSignal(
    this.http.get<HeadingEntry[]>('/dnd5esrd/heading-index.json').pipe(
      catchError(() => of([] as HeadingEntry[])),
    ),
    { initialValue: [] as HeadingEntry[] },
  );

  readonly allSpells = computed((): JadSpell[] =>
    this._headings()
      .filter(
        e =>
          e.b === 'jeskyne-a-draci' &&
          JAD_SPELL_FILES.has(e.f) &&
          !EXCLUDED_SLUGS.has(e.s) &&
          !EXCLUDED_SLUG_PATTERN.test(e.s),
      )
      .map(e => ({ name: e.h, slug: e.s, file: e.f })),
  );

  findSpellByName(name: string): JadSpell | undefined {
    const norm = JadSpellsService.normalizeStr(name);
    return this.allSpells().find(s => JadSpellsService.normalizeStr(s.name) === norm);
  }

  static normalizeStr(s: string): string {
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  loadSpellContent(spell: JadSpell) {
    return this.wiki.loadChapter('snippets', `kouzla/${spell.slug}-jad.md`).pipe(
      catchError(() => this.wiki.loadChapter('snippets', `kouzla/${spell.slug}.md`)),
      catchError(() => this.extractSpellFromArticle(spell)),
    );
  }

  /** Extract a spell section from the big markdown article by heading name. */
  private extractSpellFromArticle(spell: JadSpell) {
    return this.http
      .get(`/dnd5esrd/jeskyne-a-draci/${spell.file}`, { responseType: 'text' })
      .pipe(
        map(md => {
          const section = this.extractSection(md, spell.name);
          if (!section) {
            return `<p>Obsah kouzla nenalezen pro: <strong>${spell.slug}</strong></p>`;
          }
          return marked.parse(section, { async: false }) as string;
        }),
        catchError(() =>
          of(`<p>Obsah kouzla nenalezen pro: <strong>${spell.slug}</strong></p>`),
        ),
      );
  }

  /**
   * Extract markdown between a heading matching `name` and the next heading
   * of the same or higher level.
   */
  private extractSection(md: string, name: string): string | null {
    const lines = md.split('\n');
    let startIdx = -1;
    let headingLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const hMatch = lines[i].match(/^(#{1,6})\s+(.+)$/);
      if (!hMatch) continue;

      if (startIdx === -1) {
        if (JadSpellsService.normalizeStr(hMatch[2]) === JadSpellsService.normalizeStr(name)) {
          startIdx = i;
          headingLevel = hMatch[1].length;
        }
      } else {
        // Next heading of same or higher level → end of section
        if (hMatch[1].length <= headingLevel) {
          return lines.slice(startIdx, i).join('\n').trim();
        }
      }
    }

    // Section goes until end of file
    return startIdx !== -1 ? lines.slice(startIdx).join('\n').trim() : null;
  }
}

