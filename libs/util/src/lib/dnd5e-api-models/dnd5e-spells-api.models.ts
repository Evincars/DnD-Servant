// ─── Shared ref (reuses same shape as monster models) ───────────────────────

export interface SpellRef {
  index: string;
  name: string;
  url: string;
}

// ─── Spell sub-types ─────────────────────────────────────────────────────────

/** e.g. "sphere" | "cone" | "cube" | "cylinder" | "line" */
export type SpellAreaOfEffectType = 'sphere' | 'cone' | 'cube' | 'cylinder' | 'line';

export interface SpellAreaOfEffect {
  type: SpellAreaOfEffectType;
  /** Radius / length / side in feet */
  size: number;
}

export interface SpellDc {
  dc_type: SpellRef;
  /** e.g. "none" | "half" | "other" */
  dc_success: string;
  dc_value?: number;
}

export interface SpellDamage {
  damage_type?: SpellRef;
  /** Damage dice keyed by slot level, e.g. { "3": "8d6", "4": "9d6" } */
  damage_at_slot_level?: Record<string, string>;
  /** Damage dice keyed by character level (cantrips), e.g. { "1": "1d10" } */
  damage_at_character_level?: Record<string, string>;
}

export interface SpellHeal {
  /** Heal dice keyed by slot level, e.g. { "1": "1d8+MOD", "2": "2d8+MOD" } */
  heal_at_slot_level?: Record<string, string>;
}

// ─── Root Spell model ────────────────────────────────────────────────────────

export interface Spell {
  index: string;
  name: string;
  url: string;
  updated_at?: string;

  /** Multi-paragraph description */
  desc: string[];
  /** Description of upcast (higher-level slot) effects */
  higher_level?: string[];

  /** e.g. "60 feet" | "Self" | "Touch" | "Unlimited" */
  range: string;
  /** e.g. ["V", "S", "M"] */
  components: string[];
  /** Required material component, if any */
  material?: string;

  ritual: boolean;
  /** e.g. "Instantaneous" | "1 minute" | "Concentration, up to 1 minute" */
  duration: string;
  concentration: boolean;
  /** e.g. "1 action" | "1 bonus action" | "1 reaction" | "1 minute" */
  casting_time: string;

  /** Spell slot level; 0 = cantrip */
  level: number;

  /** Present when the spell deals damage */
  damage?: SpellDamage;
  /** Present when the spell heals */
  heal_at_slot_level?: Record<string, string>;
  /** Saving throw info, if any */
  dc?: SpellDc;
  /** Area of effect shape and size, if any */
  area_of_effect?: SpellAreaOfEffect;

  /** Magic school (e.g. Evocation, Conjuration) */
  school: SpellRef;

  /** Classes that have this spell on their list */
  classes: SpellRef[];
  /** Subclasses that have this spell on their list */
  subclasses: SpellRef[];
}
