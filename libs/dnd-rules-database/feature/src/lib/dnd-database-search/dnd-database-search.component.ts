import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { Dnd5eApiService } from '@dn-d-servant/data-access';
import { Monster, Spell, Race, Feat, DndClass, Dnd5eEndpoint, LocalStorageService } from '@dn-d-servant/util';
import { MonsterCardComponent } from '../monster-card/monster-card.component';
import { SpellCardComponent } from '../spell-card/spell-card.component';
import { RaceCardComponent } from '../race-card/race-card.component';
import { ClassCardComponent } from '../class-card/class-card.component';
// import { FeatCardComponent } from '../feat-card/feat-card.component';

export type DatabaseCategory = 'monsters' | 'spells' | 'races' | 'classes'; // | 'feats';

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
    key: 'classes',
    label: 'Povolání',
    icon: 'shield',
    placeholder: 'např. fighter, wizard, rogue…',
    hint: 'Zadej anglický název povolání z D&D 2014',
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
  feats: Feat[];
  classes: DndClass[];
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
    ClassCardComponent /* FeatCardComponent */,
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
  feats = signal<Feat[]>(this._saved?.feats ?? []);
  classes = signal<DndClass[]>(this._saved?.classes ?? []);

  // ── Persist to localStorage on every change ────────────────────────────────
  private readonly _persistEffect = effect(() => {
    const payload: StoredResults = {
      monsters: this.monsters(),
      spells: this.spells(),
      races: this.races(),
      feats: this.feats(),
      classes: this.classes(),
    };
    this.storage.setDataSync(STORAGE_KEY, payload);
  });

  readonly activeDef = computed(() => CATEGORIES.find(c => c.key === this.category())!);

  readonly hasResult = computed(
    () =>
      this.monsters().length > 0 ||
      this.spells().length > 0 ||
      this.races().length > 0 ||
      this.feats().length > 0 ||
      this.classes().length > 0,
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
          next: m => this.monsters.update(arr => [...arr, m]),
          error: () => this.error.set(`Příšera „${raw}" nebyla nalezena.`),
        });
    } else if (cat === 'spells') {
      this.api
        .getOne<Spell>('spells', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: s => this.spells.update(arr => [...arr, s]),
          error: () => this.error.set(`Kouzlo „${raw}" nebylo nalezeno.`),
        });
    } else if (cat === 'races') {
      this.api
        .getOne<Race>('races' as Dnd5eEndpoint, index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: r => this.races.update(arr => [...arr, r]),
          error: () => this.error.set(`Rasa „${raw}" nebyla nalezena.`),
        });
    } else if (cat === 'classes') {
      this.api
        .getOne<DndClass>('classes', index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: cl => this.classes.update(arr => [...arr, cl]),
          error: () => this.error.set(`Povolání „${raw}" nebylo nalezeno.`),
        });
    } else {
      this.api
        .getOne<Feat>('feats' as Dnd5eEndpoint, index)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: f => this.feats.update(arr => [...arr, f]),
          error: () => this.error.set(`Schopnost „${raw}" nebyla nalezena.`),
        });
    }
  }

  removeMonster(index: number): void {
    this.monsters.update(arr => arr.filter((_, i) => i !== index));
  }
  removeSpell(index: number): void {
    this.spells.update(arr => arr.filter((_, i) => i !== index));
  }
  removeRace(index: number): void {
    this.races.update(arr => arr.filter((_, i) => i !== index));
  }
  removeFeat(index: number): void {
    this.feats.update(arr => arr.filter((_, i) => i !== index));
  }
  removeClass(index: number): void {
    this.classes.update(arr => arr.filter((_, i) => i !== index));
  }

  clearAll(): void {
    this.monsters.set([]);
    this.spells.set([]);
    this.races.set([]);
    this.feats.set([]);
    this.classes.set([]);
    this.error.set(null);
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.search();
  }
}
