// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface EquipmentRef {
  index: string;
  name: string;
  url: string;
}

// ─── Sub-types ───────────────────────────────────────────────────────────────

export interface EquipmentCost {
  /** Amount, e.g. 15 */
  quantity: number;
  /** Currency unit: "gp" | "sp" | "cp" */
  unit: string;
}

export interface EquipmentDamage {
  /** Dice expression, e.g. "1d8" */
  damage_dice: string;
  damage_type: EquipmentRef;
}

export interface EquipmentArmorClass {
  /** Base AC (e.g. 14 for breastplate) */
  base: number;
  /** Whether DEX modifier is added */
  dex_bonus: boolean;
  /** Maximum DEX bonus (null = no cap) */
  max_bonus?: number | null;
}

export interface EquipmentRange {
  /** Normal range in feet */
  normal: number;
  /** Maximum range in feet (null for melee) */
  long?: number | null;
}

// ─── Root Equipment model ─────────────────────────────────────────────────────

export interface Equipment {
  index: string;
  name: string;
  url: string;

  equipment_category: EquipmentRef;

  /** Flavour / rule text (usually empty for mundane items) */
  desc?: string[];

  /** Purchase price */
  cost: EquipmentCost;
  /** Weight in pounds */
  weight?: number;

  // ── Weapon fields ───────────────────────────────────────────────────────────
  /** "Simple" | "Martial" */
  weapon_category?: string;
  /** "Melee" | "Ranged" */
  weapon_range?: string;
  /** Combined, e.g. "Simple Melee" */
  category_range?: string;
  damage?: EquipmentDamage;
  /** Damage when wielded two-handed (versatile weapons) */
  two_handed_damage?: EquipmentDamage;
  range?: EquipmentRange;
  throw_range?: EquipmentRange;
  /** Weapon property tags (Finesse, Light, …) */
  properties?: EquipmentRef[];

  // ── Armor fields ────────────────────────────────────────────────────────────
  /** "Light" | "Medium" | "Heavy" | "Shield" */
  armor_category?: string;
  armor_class?: EquipmentArmorClass;
  /** Required STR to use without speed penalty */
  str_minimum?: number;
  stealth_disadvantage?: boolean;

  // ── Other ───────────────────────────────────────────────────────────────────
  tool_category?: string;
  vehicle_category?: string;
  gear_category?: EquipmentRef;
}

