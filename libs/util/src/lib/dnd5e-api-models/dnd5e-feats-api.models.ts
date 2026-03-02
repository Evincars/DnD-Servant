// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface FeatRef {
  index: string;
  name: string;
  url: string;
}

// ─── Prerequisite ─────────────────────────────────────────────────────────────

export interface FeatPrerequisite {
  /**
   * The ability score that must meet the minimum value.
   * e.g. { index: "str", name: "STR", url: "/api/2014/ability-scores/str" }
   */
  ability_score: FeatRef;
  /** Minimum score required to take this feat (e.g. 13) */
  minimum_score: number;
}

// ─── Root Feat model ──────────────────────────────────────────────────────────

export interface Feat {
  index: string;
  name: string;
  url: string;

  /** Multi-paragraph description of what the feat does */
  desc: string[];

  /**
   * Ability score prerequisites. Empty array means no prerequisites.
   * e.g. Grappler requires STR 13.
   */
  prerequisites: FeatPrerequisite[];
}
