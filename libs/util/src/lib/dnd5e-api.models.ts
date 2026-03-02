export type Dnd5eEndpoint = 'monsters' | 'spells' | 'features' | 'classes';

/** Minimal list-item shape returned by every list endpoint */
export interface Dnd5eListItem {
  index: string;
  name: string;
  url: string;
}

export interface Dnd5eListResponse {
  count: number;
  results: Dnd5eListItem[];
}

// ─── Shared sub-types ────────────────────────────────────────────────────────

export interface Dnd5eRef {
  index: string;
  name: string;
  url: string;
}

export interface Dnd5eDc {
  dc_type: Dnd5eRef;
  dc_value: number;
  /** e.g. "none" | "half" | "other" */
  success_type: string;
}

export interface Dnd5eDamageEntry {
  damage_type: Dnd5eRef;
  damage_dice: string;
}

export interface Dnd5eUsage {
  /** e.g. "per day" | "recharge on roll" */
  type: string;
  times?: number;
  min_value?: number;
  dice?: string;
}

// ─── Monster sub-types ───────────────────────────────────────────────────────

export interface MonsterArmorClass {
  /** e.g. "natural" | "dex" | "armor" | "spell" */
  type: string;
  value: number;
  armor?: Dnd5eRef[];
  spell?: Dnd5eRef;
  condition?: Dnd5eRef;
}

export interface MonsterSpeed {
  walk?: string;
  swim?: string;
  fly?: string;
  burrow?: string;
  climb?: string;
  hover?: boolean;
}

export interface MonsterProficiency {
  value: number;
  proficiency: Dnd5eRef;
}

export interface MonsterSenses {
  blindsight?: string;
  darkvision?: string;
  tremorsense?: string;
  truesight?: string;
  passive_perception: number;
}

export interface MonsterAbility {
  name: string;
  desc: string;
  attack_bonus?: number;
  dc?: Dnd5eDc;
  damage?: Dnd5eDamageEntry[];
  usage?: Dnd5eUsage;
  spellcasting?: MonsterSpellcasting;
}

export interface MonsterActionRef {
  action_name: string;
  count: string | number;
  type: string;
}

export interface MonsterAction extends MonsterAbility {
  multiattack_type?: string;
  /** sub-actions used in a multiattack */
  actions?: MonsterActionRef[];
}

export interface MonsterSpellSlot {
  slots: number;
  spells: MonsterSpell[];
}

export interface MonsterSpell {
  name: string;
  level: number;
  url: string;
  usage?: Dnd5eUsage;
  notes?: string;
}

export interface MonsterSpellcasting {
  ability: Dnd5eRef;
  dc?: number;
  modifier?: number;
  components_required?: string[];
  school?: string;
  slots?: Record<string, number>;
  spells?: MonsterSpell[];
}

// ─── Root Monster model ──────────────────────────────────────────────────────

export interface Monster {
  index: string;
  name: string;
  url: string;
  image?: string;
  updated_at?: string;

  /** e.g. "Large" | "Medium" | "Small" | "Tiny" | "Huge" | "Gargantuan" */
  size: string;
  /** e.g. "aberration" | "beast" | "fiend" … */
  type: string;
  subtype?: string;
  alignment: string;

  armor_class: MonsterArmorClass[];
  hit_points: number;
  hit_dice: string;
  hit_points_roll: string;
  speed: MonsterSpeed;

  // Ability scores
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  proficiencies: MonsterProficiency[];
  proficiency_bonus: number;

  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: Dnd5eRef[];

  senses: MonsterSenses;
  languages: string;

  challenge_rating: number;
  xp: number;

  special_abilities?: MonsterAbility[];
  actions?: MonsterAction[];
  legendary_actions?: MonsterAbility[];
  reactions?: MonsterAbility[];

  /** alternate forms (e.g. lycanthropes) */
  forms?: Dnd5eRef[];
}
