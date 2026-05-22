import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

export interface JadMonster {
  name: string;
  slug: string;
  type: string;
  size: string;
  alignment: string;
  /** Numeric CR value for sorting: 0, 0.125, 0.25, 0.5, 1 … 30 */
  cr: number | undefined;
  /** Display string e.g. "1/4", "10" */
  crDisplay: string;
  book: string;
  file: string;
}

type MonstersMeta = Record<string, Omit<JadMonster, 'slug'>>;

@Injectable({ providedIn: 'root' })
export class JadMonstersService {
  private readonly http = inject(HttpClient);

  private readonly _meta = toSignal(
    this.http.get<MonstersMeta>('/dnd5esrd/snippets/monsters-meta.json').pipe(
      catchError(() => of({} as MonstersMeta)),
    ),
    { initialValue: null as MonstersMeta | null },
  );

  readonly allMonsters = computed((): JadMonster[] => {
    const meta = this._meta();
    if (!meta) return [];
    return Object.entries(meta)
      .map(([slug, data]) => ({ slug, ...data }))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  });

  /** Sorted unique list of creature types. */
  readonly availableTypes = computed((): string[] => {
    const typeSet = new Set<string>();
    for (const m of this.allMonsters()) {
      if (m.type) typeSet.add(m.type);
    }
    return [...typeSet].sort((a, b) => a.localeCompare(b, 'cs'));
  });

  static normalizeStr(s: string): string {
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  findMonsterByName(name: string): JadMonster | undefined {
    const norm = JadMonstersService.normalizeStr(name);
    return this.allMonsters().find(
      m => JadMonstersService.normalizeStr(m.name) === norm,
    );
  }
}

