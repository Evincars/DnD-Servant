// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface BackgroundRef {
  index: string;
  name: string;
  url: string;
}

// ─── Sub-types ───────────────────────────────────────────────────────────────

export interface BackgroundFeature {
  name: string;
  /** Multi-paragraph description of the background feature ability */
  desc: string[];
}

export interface BackgroundStartingEquipment {
  equipment: BackgroundRef;
  quantity: number;
}

export interface BackgroundLanguageOption {
  choose: number;
  type: string;
  from: {
    option_set_type: string;
    options: Array<{ option_type: string; item: BackgroundRef }>;
  };
}

export interface BackgroundPersonalityChoiceOption {
  option_type: 'string';
  string: string;
}

export interface BackgroundPersonalityChoice {
  choose: number;
  type: string;
  from: {
    option_set_type: string;
    options: BackgroundPersonalityChoiceOption[];
  };
}

// ─── Root Background model ────────────────────────────────────────────────────

export interface Background {
  index: string;
  name: string;
  url: string;

  /** Skill / tool proficiencies granted automatically */
  starting_proficiencies: BackgroundRef[];

  /** Optional: choose extra languages */
  language_options?: BackgroundLanguageOption;

  /** Fixed starting gear */
  starting_equipment: BackgroundStartingEquipment[];

  /** Background feature (class-like special ability) */
  feature: BackgroundFeature;

  /** d8 personality trait choices */
  personality_traits?: BackgroundPersonalityChoice;
  /** Ideal choices */
  ideals?: BackgroundPersonalityChoice;
  /** Bond choices */
  bonds?: BackgroundPersonalityChoice;
  /** Flaw choices */
  flaws?: BackgroundPersonalityChoice;
}

