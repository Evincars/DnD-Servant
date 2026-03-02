// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface RaceRef {
  index: string;
  name: string;
  url: string;
}

// ─── Ability bonus ────────────────────────────────────────────────────────────

export interface RaceAbilityBonus {
  ability_score: RaceRef;
  /** e.g. +1, +2 */
  bonus: number;
}

// ─── Ability bonus option (used in ability_bonus_options) ────────────────────

export interface RaceAbilityBonusOption {
  option_type: 'ability_bonus';
  ability_score: RaceRef;
  bonus: number;
}

// ─── Generic option-set (languages / ability bonuses) ────────────────────────

export interface RaceOptionSetArray<T> {
  option_set_type: 'options_array';
  options: T[];
}

export interface RaceChoiceFrom<T> {
  choose: number;
  /** e.g. "languages" | "ability-bonuses" */
  type: string;
  from: RaceOptionSetArray<T>;
}

// ─── Language option item ─────────────────────────────────────────────────────

export interface RaceLanguageOption {
  option_type: 'reference';
  item: RaceRef;
}

// ─── Starting proficiency option ──────────────────────────────────────────────

export interface RaceStartingProficiencyOption {
  option_type: 'reference';
  item: RaceRef;
}

// ─── Root Race model ──────────────────────────────────────────────────────────

export interface Race {
  index: string;
  name: string;
  url: string;
  updated_at?: string;

  /** Walking speed in feet */
  speed: number;

  /** Fixed ability score bonuses (e.g. all humans get +1 to every stat) */
  ability_bonuses: RaceAbilityBonus[];

  /**
   * Present when the player may choose which ability scores receive a bonus.
   * e.g. Half-Elf: choose 2 from any ability score.
   */
  ability_bonus_options?: RaceChoiceFrom<RaceAbilityBonusOption>;

  /** Flavour text about the race's typical age and lifespan */
  age: string;

  /** Flavour text about the race's typical alignment */
  alignment: string;

  /** e.g. "Medium" | "Small" */
  size: string;

  /** Flavour text about the race's size */
  size_description: string;

  /** Starting proficiencies granted by the race */
  starting_proficiencies?: RaceRef[];

  /**
   * Optional proficiency choice (e.g. Dwarf weapon proficiency options).
   */
  starting_proficiency_options?: RaceChoiceFrom<RaceStartingProficiencyOption>;

  /** Languages the race speaks automatically */
  languages: RaceRef[];

  /** Optional additional language choice */
  language_options?: RaceChoiceFrom<RaceLanguageOption>;

  /** Flavour text describing the race's language knowledge */
  language_desc: string;

  /** Racial traits (references — fetch individually for full description) */
  traits: RaceRef[];

  /** Available subraces (references) */
  subraces: RaceRef[];
}
