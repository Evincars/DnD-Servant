// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface ClassRef {
  index: string;
  name: string;
  url: string;
}

// ─── Proficiency choice ───────────────────────────────────────────────────────

export interface ClassProficiencyOptionItem {
  option_type: 'reference';
  item: ClassRef;
}

export interface ClassProficiencyOptionSet {
  option_set_type: 'options_array';
  options: ClassProficiencyOptionItem[];
}

export interface ClassProficiencyChoice {
  /** Number of proficiencies the player may choose */
  choose: number;
  /** e.g. "proficiencies" */
  type: string;
  from: ClassProficiencyOptionSet;
  desc?: string;
}

// ─── Multi-classing ───────────────────────────────────────────────────────────

export interface ClassMulticlassingPrerequisite {
  ability_score: ClassRef;
  minimum_score: number;
}

export interface ClassMulticlassingPrerequisiteOptions {
  choose: number;
  type: string;
  from: {
    option_set_type: 'options_array';
    options: Array<{
      option_type: 'ability_bonus';
      ability_score: ClassRef;
      minimum_score: number;
    }>;
  };
}

export interface ClassMulticlassing {
  /** Hard ability-score prerequisites (e.g. STR 13 for Fighter) */
  prerequisites: ClassMulticlassingPrerequisite[];
  /** Choose-one prerequisite groups (e.g. Paladin needs STR or CHA 13) */
  prerequisite_options?: ClassMulticlassingPrerequisiteOptions;
  /** Proficiencies gained when multi-classing into this class */
  proficiencies: ClassRef[];
  /** Proficiency choices available when multi-classing in */
  proficiency_choices?: ClassProficiencyChoice[];
}

// ─── Spellcasting ─────────────────────────────────────────────────────────────

export interface ClassSpellcastingInfo {
  name: string;
  /** Multi-paragraph explanatory text */
  desc: string[];
}

export interface ClassSpellcasting {
  /** Ability used for spellcasting (e.g. INT for Wizard) */
  spellcasting_ability: ClassRef;
  /** Ordered list of spellcasting info blocks */
  info: ClassSpellcastingInfo[];
}

// ─── Root Class model ─────────────────────────────────────────────────────────

export interface DndClass {
  index: string;
  name: string;
  url: string;

  /** Hit die size, e.g. 10 for Fighter (d10) */
  hit_die: number;

  /** Proficiencies automatically granted at level 1 */
  proficiencies: ClassRef[];

  /** Saving throw ability scores (e.g. STR, CON for Fighter) */
  saving_throws: ClassRef[];

  /** Skill / tool proficiency choices available at level 1 */
  proficiency_choices: ClassProficiencyChoice[];

  /** Starting equipment items (references) */
  starting_equipment: Array<{
    equipment: ClassRef;
    quantity: number;
  }>;

  /** Starting equipment choices */
  starting_equipment_options: Array<{
    choose: number;
    type: string;
    desc?: string;
    from: {
      option_set_type: string;
      options: unknown[];
    };
  }>;

  /** Class levels URL (list of level-up data) */
  class_levels: string;

  /** Multi-classing prerequisites and proficiencies */
  multi_classing: ClassMulticlassing;

  /** Subclasses available for this class */
  subclasses: ClassRef[];

  /**
   * Spellcasting info — only present for spellcasting classes.
   * Undefined for non-casters (e.g. Fighter at base level).
   */
  spellcasting?: ClassSpellcasting;
}
