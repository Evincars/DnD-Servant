// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface SubclassRef {
  index: string;
  name: string;
  url: string;
}

// ─── Spellcasting ─────────────────────────────────────────────────────────────

export interface SubclassSpellcastingInfo {
  name: string;
  /** Multi-paragraph description */
  desc: string[];
}

export interface SubclassSpellcasting {
  /** Level at which the subclass gains spellcasting (e.g. 3 for Eldritch Knight) */
  level: number;
  spellcasting_ability: SubclassRef;
  info: SubclassSpellcastingInfo[];
}

// ─── Subclass-specific spell entry ───────────────────────────────────────────

export interface SubclassSpellEntry {
  prerequisites: Array<{
    index: string;
    name: string;
    url: string;
    minimum_level: number;
    type: string;
  }>;
  spell: SubclassRef;
}

// ─── Root Subclass model ──────────────────────────────────────────────────────

export interface Subclass {
  index: string;
  name: string;
  url: string;
  updated_at?: string;

  /**
   * Flavour name for the subclass archetype.
   * e.g. "Arcane Tradition" for Wizard subclasses, "Roguish Archetype" for Rogues.
   */
  subclass_flavor: string;

  /** Multi-paragraph description */
  desc: string[];

  /** Parent class reference */
  class: SubclassRef;

  /** URL path to the list of levels for this subclass */
  subclass_levels: string;

  /**
   * Spells granted by this subclass.
   * Present only for subclasses that provide an expanded spell list
   * (e.g. Cleric domains, Paladin oaths, Warlock patrons).
   */
  spells?: SubclassSpellEntry[];

  /**
   * Spellcasting rules granted by this subclass.
   * Present only for subclasses that add spellcasting (e.g. Eldritch Knight, Arcane Trickster).
   */
  spellcasting?: SubclassSpellcasting;
}
