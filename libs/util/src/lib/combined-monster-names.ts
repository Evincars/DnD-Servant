import { MONSTER_NAMES } from './monster-names';
import { JAD_MONSTER_NAMES } from './jad-monster-names';

/** Strips diacritical marks and lowercases for collision detection. */
export function normalizeMonsterName(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export type MonsterSource = 'jad' | 'api';

export interface MonsterDisplayEntry {
  /** The label shown in the autocomplete dropdown. */
  display: string;
  /** Where to load the monster from. */
  source: MonsterSource;
  /** The canonical name to pass to the loading service (suffix stripped). */
  canonicalName: string;
}

/**
 * Builds a combined, deduplicated, sorted monster list.
 *
 * When a JaD name and an English API name normalize to the same string
 * (e.g. "Goblin" / "Goblin", or "Chiméra" / "Chimera"), they are
 * disambiguated as:
 *   "Goblin (J&D)"  → JaD wiki lookup
 *   "Goblin (D&D)"  → D&D 5e API lookup
 *
 * All other names are kept as-is and routed based on their source list.
 */
export function buildCombinedMonsterList(): MonsterDisplayEntry[] {
  // Build a normalized→English name map for fast collision detection
  const engNormMap = new Map<string, string>(); // normalised → original English name
  for (const name of MONSTER_NAMES) {
    engNormMap.set(normalizeMonsterName(name), name);
  }

  // Track which English names were marked as duplicates
  const duplicateEngNames = new Set<string>();

  const jadEntries: MonsterDisplayEntry[] = [];
  for (const jadName of JAD_MONSTER_NAMES) {
    const norm = normalizeMonsterName(jadName);
    const engMatch = engNormMap.get(norm);
    if (engMatch) {
      duplicateEngNames.add(engMatch);
      jadEntries.push({ display: `${jadName} (J&D)`, source: 'jad', canonicalName: jadName });
    } else {
      jadEntries.push({ display: jadName, source: 'jad', canonicalName: jadName });
    }
  }

  const apiEntries: MonsterDisplayEntry[] = [];
  for (const engName of MONSTER_NAMES) {
    if (duplicateEngNames.has(engName)) {
      apiEntries.push({ display: `${engName} (D&D)`, source: 'api', canonicalName: engName });
    } else {
      apiEntries.push({ display: engName, source: 'api', canonicalName: engName });
    }
  }

  // Merge and sort (Czech-aware)
  return [...jadEntries, ...apiEntries].sort((a, b) =>
    a.display.localeCompare(b.display, 'cs', { sensitivity: 'base' }),
  );
}

/**
 * Pre-built combined list (computed once at module load time).
 * Key: display label (as shown in the autocomplete), Value: routing info.
 */
export const COMBINED_MONSTER_LIST: readonly MonsterDisplayEntry[] = buildCombinedMonsterList();

/** Just the display names — pass this to `<autofill-input [suggestions]="...">`. */
export const COMBINED_MONSTER_NAMES: readonly string[] = COMBINED_MONSTER_LIST.map(e => e.display);

/** Fast lookup by display label → MonsterDisplayEntry. */
export const COMBINED_MONSTER_MAP = new Map<string, MonsterDisplayEntry>(
  COMBINED_MONSTER_LIST.map(e => [e.display.toLowerCase(), e]),
);

