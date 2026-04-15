import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { WikiService } from './wiki/wiki.service';

export interface JadSpell {
  name: string;
  slug: string;
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
      .map(e => ({ name: e.h, slug: e.s })),
  );

  findSpellByName(name: string): JadSpell | undefined {
    const lower = name.toLowerCase();
    return this.allSpells().find(s => s.name.toLowerCase() === lower);
  }

  loadSpellContent(slug: string) {
    return this.wiki.loadChapter('snippets', `kouzla/${slug}-jad.md`).pipe(
      catchError(() => this.wiki.loadChapter('snippets', `kouzla/${slug}.md`)),
      catchError(() =>
        of(`<p>Obsah kouzla nenalezen pro: <strong>${slug}</strong></p>`),
      ),
    );
  }
}

