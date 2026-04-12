// ─── Root Condition model ─────────────────────────────────────────────────────

export interface Condition {
  index: string;
  name: string;
  url: string;

  /**
   * Ordered list of paragraphs describing what the condition does
   * (e.g. the bullet-point list from the PHB).
   */
  desc: string[];
}

