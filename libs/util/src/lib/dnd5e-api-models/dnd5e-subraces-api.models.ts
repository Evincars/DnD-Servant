// ─── Re-use shared refs from races model ─────────────────────────────────────
// SubraceRef is structurally identical to RaceRef — kept separate for clarity.

export interface SubraceRef {
  index: string;
  name: string;
  url: string;
}

// ─── Ability bonus ────────────────────────────────────────────────────────────

export interface SubraceAbilityBonus {
  ability_score: SubraceRef;
  bonus: number;
}

// ─── Racial trait ─────────────────────────────────────────────────────────────

export interface SubraceTrait {
  index: string;
  name: string;
  url: string;
}

// ─── Racial trait option (for racial_trait_options) ──────────────────────────

export interface SubraceTraitOption {
  option_type: 'reference';
  item: SubraceTrait;
}

export interface SubraceTraitOptionSet {
  option_set_type: 'options_array';
  options: SubraceTraitOption[];
}

export interface SubraceTraitChoice {
  choose: number;
  type: string;
  from: SubraceTraitOptionSet;
  desc?: string;
}

// ─── Language option ──────────────────────────────────────────────────────────

export interface SubraceLanguageOption {
  option_type: 'reference';
  item: SubraceRef;
}

export interface SubraceLanguageOptionSet {
  option_set_type: 'options_array';
  options: SubraceLanguageOption[];
}

export interface SubraceLanguageChoice {
  choose: number;
  type: string;
  from: SubraceLanguageOptionSet;
  desc?: string;
}

// ─── Root Subrace model ───────────────────────────────────────────────────────

export interface Subrace {
  index: string;
  name: string;
  url: string;

  /**
   * Flavour description of the subrace.
   * e.g. "High Elves value intellect above all…"
   */
  desc: string;

  /** Parent race reference */
  race: SubraceRef;

  /** Fixed ability score bonuses granted by this subrace */
  ability_bonuses: SubraceAbilityBonus[];

  /** Starting proficiencies granted by this subrace */
  starting_proficiencies: SubraceRef[];

  /** Languages automatically known by members of this subrace */
  languages: SubraceRef[];

  /**
   * Optional additional language choice.
   * e.g. High Elf may choose one extra language.
   */
  language_options?: SubraceLanguageChoice;

  /** Racial traits granted by this subrace (references) */
  racial_traits: SubraceTrait[];

  /**
   * Optional choosable racial traits.
   * e.g. Forest Gnome's Natural Illusionist lets you pick one cantrip.
   */
  racial_trait_options?: SubraceTraitChoice;
}
