// ─── Shared ref ──────────────────────────────────────────────────────────────

export interface MagicItemRef {
  index: string;
  name: string;
  url: string;
}

// ─── Root Magic Item model ────────────────────────────────────────────────────

export interface MagicItem {
  index: string;
  name: string;
  url: string;

  /** Multi-paragraph description / lore / rules text */
  desc: string[];

  /** Broad category (e.g. "Weapon", "Wondrous Items") */
  equipment_category?: MagicItemRef;

  /** Rarity tier */
  rarity: { name: string };

  /** Whether this item is itself a variant of another */
  variant: boolean;
  /** Other variant forms of this item (e.g. different weapon types for a +1 weapon) */
  variants?: MagicItemRef[];
}

