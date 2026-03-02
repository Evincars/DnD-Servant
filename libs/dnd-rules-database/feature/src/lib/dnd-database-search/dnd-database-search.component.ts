import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { Dnd5eApiService } from '@dn-d-servant/data-access';
import { Monster, Spell, Race, Feat, DndClass, Subclass, Subrace, Dnd5eEndpoint, LocalStorageService } from '@dn-d-servant/util';
import { MonsterCardComponent } from '../monster-card/monster-card.component';
import { SpellCardComponent } from '../spell-card/spell-card.component';
import { RaceCardComponent } from '../race-card/race-card.component';
import { ClassCardComponent } from '../class-card/class-card.component';
import { SubclassCardComponent } from '../subclass-card/subclass-card.component';
import { SubraceCardComponent } from '../subrace-card/subrace-card.component';
// import { FeatCardComponent } from '../feat-card/feat-card.component';

export type DatabaseCategory = 'monsters' | 'spells' | 'races' | 'subraces' | 'classes' | 'subclasses'; // | 'feats';

interface CategoryDef {
  key: DatabaseCategory;
  label: string;
  icon: string;
  placeholder: string;
  hint: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'monsters',
    label: 'Příšery',
    icon: 'skull',
    placeholder: 'např. aboleth, dragon, goblin…',
    hint: 'Zadej anglický název příšery z D&D 2014',
  },
  {
    key: 'spells',
    label: 'Kouzla',
    icon: 'auto_fix_high',
    placeholder: 'např. fireball, sleep, charm-person…',
    hint: 'Zadej anglický název kouzla z D&D 2014',
  },
  {
    key: 'races',
    label: 'Rasy',
    icon: 'groups',
    placeholder: 'např. elf, human, dwarf…',
    hint: 'Zadej anglický název rasy z D&D 2014',
  },
  {
    key: 'subraces',
    label: 'Podrasy',
    icon: 'group_add',
    placeholder: 'např. high-elf, hill-dwarf, lightfoot-halfling…',
    hint: 'Zadej anglický název podrasy z D&D 2014',
  },
  {
    key: 'classes',
    label: 'Povolání',
    icon: 'shield',
    placeholder: 'např. fighter, wizard, rogue…',
    hint: 'Zadej anglický název povolání z D&D 2014',
  },
  {
    key: 'subclasses',
    label: 'Subpovolání',
    icon: 'workspace_premium',
    placeholder: 'např. lore, champion, berserker…',
    hint: 'Zadej anglický název subpovolání z D&D 2014',
  },
  // {
  //   key: 'feats',
  //   label: 'Schopnosti',
  //   icon: 'military_tech',
  //   placeholder: 'např. grappler, alert, lucky…',
  //   hint: 'Zadej anglický název schopnosti (featu) z D&D 2014',
  // },
];

const STORAGE_KEY = 'dnd-database-results';

interface StoredResults {
  monsters: Monster[];
  spells: Spell[];
  races: Race[];
  subraces: Subrace[];
  feats: Feat[];
  classes: DndClass[];
  subclasses: Subclass[];
}

@Component({
  selector: 'dnd-database-search',
  templateUrl: './dnd-database-search.component.html',
  styleUrl: './dnd-database-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatIcon,
    MonsterCardComponent,
    SpellCardComponent,
    RaceCardComponent,
    SubraceCardComponent,
    ClassCardComponent,
    SubclassCardComponent /* FeatCardComponent */,
  ],
})
export class DndDatabaseSearchComponent {
  private readonly api = inject(Dnd5eApiService);
  private readonly storage = inject(LocalStorageService);

  readonly categories = CATEGORIES;

  category = signal<DatabaseCategory>('monsters');
  query = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  // ── Rehydrate from localStorage on init ────────────────────────────────────
  private readonly _saved = this.storage.getDataSync<StoredResults>(STORAGE_KEY);

  monsters = signal<Monster[]>(this._saved?.monsters ?? []);
  spells = signal<Spell[]>(this._saved?.spells ?? []);
  races = signal<Race[]>(this._saved?.races ?? []);
  subraces = signal<Subrace[]>(this._saved?.subraces ?? []);
  feats = signal<Feat[]>(this._saved?.feats ?? []);
  classes = signal<DndClass[]>(this._saved?.classes ?? []);
  subclasses = signal<Subclass[]>(this._saved?.subclasses ?? []);

  // ── Persist to localStorage on every change ────────────────────────────────
  private readonly _persistEffect = effect(() => {
    const payload: StoredResults = {
      monsters: this.monsters(),
      spells: this.spells(),
      races: this.races(),
      subraces: this.subraces(),
      feats: this.feats(),
      classes: this.classes(),
      subclasses: this.subclasses(),
    };
    this.storage.setDataSync(STORAGE_KEY, payload);
  });

  readonly activeDef = computed(() => CATEGORIES.find(c => c.key === this.category())!);

  readonly hasResult = computed(
    () =>
      this.monsters().length > 0 ||
      this.spells().length > 0 ||
      this.races().length > 0 ||
      this.subraces().length > 0 ||
      this.feats().length > 0 ||
      this.classes().length > 0 ||
      this.subclasses().length > 0,
  );

  // ── Clear query when switching category ────────────────────────────────────
  selectCategory(cat: DatabaseCategory): void {
    this.category.set(cat);
    this.query.set('');
    this.error.set(null);
  }

  search(): void {
    const raw = this.query().trim();
    if (!raw) return;
    const index = raw
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    this.loading.set(true);
    this.error.set(null);

    const cat = this.category();

    if (cat === 'monsters') {
      this.api
        .getOne<Monster>('monsters', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: m => this.monsters.update(a => [...a, m]),
          error: () => this.error.set(`Příšera „${raw}" nebyla nalezena.`),
        });
    } else if (cat === 'spells') {
      this.api
        .getOne<Spell>('spells', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: s => this.spells.update(a => [...a, s]),
          error: () => this.error.set(`Kouzlo „${raw}" nebylo nalezeno.`),
        });
    } else if (cat === 'races') {
      this.api
        .getOne<Race>('races' as Dnd5eEndpoint, index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: r => this.races.update(a => [...a, r]),
          error: () => this.error.set(`Rasa „${raw}" nebyla nalezena.`),
        });
    } else if (cat === 'subraces') {
      this.api
        .getOne<Subrace>('subraces', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: sr => this.subraces.update(a => [...a, sr]),
          error: () => this.error.set(`Podrasa „${raw}" nebyla nalezena.`),
        });
    } else if (cat === 'classes') {
      this.api
        .getOne<DndClass>('classes', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: cl => this.classes.update(a => [...a, cl]),
          error: () => this.error.set(`Povolání „${raw}" nebylo nalezena.`),
        });
    } else if (cat === 'subclasses') {
      this.api
        .getOne<Subclass>('subclasses', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: sc => this.subclasses.update(a => [...a, sc]),
          error: () => this.error.set(`Subpovolání „${raw}" nebylo nalezena.`),
        });
    } else {
      this.api
        .getOne<Feat>('feats' as Dnd5eEndpoint, index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: f => this.feats.update(a => [...a, f]),
          error: () => this.error.set(`Schopnost „${raw}" nebyla nalezena.`),
        });
    }
  }

  removeMonster(i: number): void {
    this.monsters.update(a => a.filter((_, idx) => idx !== i));
  }
  removeSpell(i: number): void {
    this.spells.update(a => a.filter((_, idx) => idx !== i));
  }
  removeRace(i: number): void {
    this.races.update(a => a.filter((_, idx) => idx !== i));
  }
  removeSubrace(i: number): void {
    this.subraces.update(a => a.filter((_, idx) => idx !== i));
  }
  removeFeat(i: number): void {
    this.feats.update(a => a.filter((_, idx) => idx !== i));
  }
  removeClass(i: number): void {
    this.classes.update(a => a.filter((_, idx) => idx !== i));
  }
  removeSubclass(i: number): void {
    this.subclasses.update(a => a.filter((_, idx) => idx !== i));
  }

  clearAll(): void {
    this.monsters.set([]);
    this.spells.set([]);
    this.races.set([]);
    this.subraces.set([]);
    this.feats.set([]);
    this.classes.set([]);
    this.subclasses.set([]);
    this.error.set(null);
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.search();
  }
}
