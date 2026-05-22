import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { marked } from 'marked';
import { WikiService } from './wiki/wiki.service';

export interface JadSpell {
  name: string;
  slug: string;
  file: string;
  classes: string[];
  /** Spell level: 0 = cantrip (trik), 1-9 = leveled spell. Undefined if unknown. */
  level?: number;
  /** Spell school (Nekromancie, Zaklínání, …). Undefined if unknown. */
  school?: string;
  /** True if the spell can be cast as a ritual. */
  ritual?: boolean;
}

interface HeadingEntry {
  b: string;
  f: string;
  h: string;
  s: string;
}

interface SpellMetaEntry {
  name: string;
  classes: string[];
  level?: number;
  school?: string;
  ritual?: boolean;
}

type SpellMeta = Record<string, SpellMetaEntry>;

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

function normalizeClassName(cls: string): string {
  if (!cls) return cls;
  return cls.charAt(0).toUpperCase() + cls.slice(1);
}

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

  private readonly _spellMeta = toSignal(
    this.http.get<SpellMeta>('/dnd5esrd/snippets/kouzla-meta.json').pipe(
      catchError(() => of({} as SpellMeta)),
    ),
    { initialValue: null as SpellMeta | null },
  );

  /** Set of filenames available under /dnd5esrd/snippets/kouzla/. Null until loaded. */
  readonly snippetFiles = toSignal(
    this.http.get<string[]>('/dnd5esrd/snippets/kouzla-index.json').pipe(
      map(files => new Set<string>(files) as Set<string> | null),
      catchError(() => of<Set<string> | null>(new Set<string>())),
      startWith<Set<string> | null>(null),
    ),
  );

  /** Spells found in the JAD heading index (with class info from meta). */
  private readonly _jadSpells = computed((): JadSpell[] => {
    const meta = this._spellMeta();
    return this._headings()
      .filter(
        e =>
          e.b === 'jeskyne-a-draci' &&
          JAD_SPELL_FILES.has(e.f) &&
          !EXCLUDED_SLUGS.has(e.s) &&
          !EXCLUDED_SLUG_PATTERN.test(e.s),
      )
      .map(e => ({
        name: e.h,
        slug: e.s,
        file: e.f,
        classes: (meta?.[e.s]?.classes ?? []).map(normalizeClassName),
        level: meta?.[e.s]?.level,
        school: meta?.[e.s]?.school,
        ritual: meta?.[e.s]?.ritual,
      }));
  });

  /** Slugs of all JAD-indexed spells for deduplication. */
  private readonly _jadSlugSet = computed(
    () => new Set(this._jadSpells().map(s => s.slug)),
  );

  /**
   * Spells present only in the snippet folder (PHB, Tasha's, etc.) but
   * NOT in the JAD heading index – e.g. "Tašin děsivý smích".
   */
  private readonly _snippetOnlySpells = computed((): JadSpell[] => {
    const meta = this._spellMeta();
    if (!meta) return [];
    const jadSlugs = this._jadSlugSet();
    return Object.entries(meta)
      .filter(([slug]) => !jadSlugs.has(slug))
      .map(([slug, data]) => ({
        name: data.name,
        slug,
        file: '',
        classes: data.classes.map(normalizeClassName),
        level: data.level,
        school: data.school,
        ritual: data.ritual,
      }));
  });

  readonly allSpells = computed((): JadSpell[] => {
    const all = [...this._jadSpells(), ...this._snippetOnlySpells()];
    return all.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  });

  /** Sorted unique list of class names across all spells. */
  readonly availableClasses = computed((): string[] => {
    const classSet = new Set<string>();
    for (const spell of this.allSpells()) {
      for (const cls of spell.classes) {
        if (cls) classSet.add(cls);
      }
    }
    return [...classSet].sort((a, b) => a.localeCompare(b, 'cs'));
  });

  /** Sorted unique list of spell schools across all spells. */
  readonly availableSchools = computed((): string[] => {
    const schoolSet = new Set<string>();
    for (const spell of this.allSpells()) {
      if (spell.school) schoolSet.add(spell.school);
    }
    return [...schoolSet].sort((a, b) => a.localeCompare(b, 'cs'));
  });

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
    const snippets = this.snippetFiles() ?? new Set<string>();
    const jadFile = `${spell.slug}-jad.md`;
    const plainFile = `${spell.slug}.md`;

    if (snippets.has(jadFile)) {
      return this.wiki.loadChapter('snippets', `kouzla/${jadFile}`).pipe(
        catchError(() => this.extractSpellFromArticle(spell)),
      );
    }
    if (snippets.has(plainFile)) {
      return this.wiki.loadChapter('snippets', `kouzla/${plainFile}`).pipe(
        catchError(() => this.extractSpellFromArticle(spell)),
      );
    }
    return this.extractSpellFromArticle(spell);
  }

  /** Extract a spell section from the big markdown article by heading name. */
  private extractSpellFromArticle(spell: JadSpell) {
    if (!spell.file) {
      return of(`<p>Obsah kouzla nenalezen pro: <strong>${spell.slug}</strong></p>`);
    }
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
   * Handles both LF and CRLF line endings.
   */
  private extractSection(md: string, name: string): string | null {
    // Normalize CRLF → LF so the heading regex ($) always anchors correctly.
    const lines = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
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
