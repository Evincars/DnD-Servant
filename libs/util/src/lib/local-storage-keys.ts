/**
 * Central registry of ALL local-storage keys used in this application.
 *
 * RULE: Every key that is stored in localStorage MUST be declared here.
 *       Never define a storage key as an inline string literal or a local
 *       constant in another file — always import from this module.
 *
 * ESLint enforces this rule via the `local/no-inline-storage-keys` rule.
 */

// ── Character sheet data-access ──────────────────────────────────────────────

/** Last successfully saved DB snapshot — character sheet */
export const DB_BACKUP_KEY_CHARACTER = 'db-backup-character-sheet';

/** Last successfully saved DB snapshot — group sheet */
export const DB_BACKUP_KEY_GROUP = 'db-backup-group-sheet';

/** Last successfully saved DB snapshot — notes page */
export const DB_BACKUP_KEY_NOTES = 'db-backup-notes-page';

/** 30-second auto-draft — character sheet form state not yet persisted to DB */
export const DB_DRAFT_KEY_CHARACTER = 'db-draft-character-sheet';

/** 30-second auto-draft — group sheet form state not yet persisted to DB */
export const DB_DRAFT_KEY_GROUP = 'db-draft-group-sheet';

/** 30-second auto-draft — notes page form state not yet persisted to DB */
export const DB_DRAFT_KEY_NOTES = 'db-draft-notes-page';

// ── Character sheet feature ───────────────────────────────────────────────────

/** Active character-sheet tab index */
export const ACTIVE_TAB_INDEX_KEY = 'active-tab-index';

/** Whether the autofill-abilities help dialog should be hidden */
export const AUTOFILL_DIALOG_HIDDEN_KEY = 'autofill-dialog-hidden';

/** Initiative tracker rows */
export const INITIATIVE_TRACKER_KEY = 'initiative-tracker';

// ── DM page ───────────────────────────────────────────────────────────────────

/** Active DM-page tab index */
export const DM_TAB_KEY = 'dm-page-tab-index';

// ── D&D rules database ────────────────────────────────────────────────────────

/** Cached results for the D&D 2014 database search page */
export const DND_DATABASE_RESULTS_KEY = 'dnd-database-results';

// ── UI — Dice roller ──────────────────────────────────────────────────────────

/** Dice-roller roll history */
export const DICE_ROLLER_HISTORY_KEY = 'dice-roller-history';

// ── Character sheet — Conditions ──────────────────────────────────────────────

/** Active player conditions (v1 schema) */
export const PLAYER_CONDITIONS_KEY = 'player-conditions-v1';

// ── Character sheet — Page layout ─────────────────────────────────────────────

/** Whether the spells page (page 3) should appear before the appearance page (page 2) */
export const CS_SPELLS_FIRST_KEY = 'cs-spells-page-first';

// ── J&D Wiki ──────────────────────────────────────────────────────────────────

/** Last viewed wiki position (book + chapter) */
export const WIKI_LAST_POSITION_KEY = 'wiki-last-position';


