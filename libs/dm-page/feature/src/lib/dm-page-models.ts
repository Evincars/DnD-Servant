export type DmQuestStatus = 'planned' | 'active' | 'climax' | 'completed' | 'abandoned';
export type DmQuestDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';

export interface DmQuestEntry {
  id: string;
  title: string;
  /** Rich-text — what the players know / can learn */
  playerDescription: string;
  /** Rich-text — DM-only secret notes */
  dmNotes: string;
  /** Rich-text — story hooks, foreshadowing, clues */
  storyHooks: string;
  antagonist: string;
  location: string;
  /** Comma-separated party members involved */
  partyMembers: string;
  imageBase64: string | null;
  status: DmQuestStatus;
  difficulty: DmQuestDifficulty;
  /** Rewards the players know about */
  publicRewards: string;
  /** Additional secret rewards / DM plans */
  secretRewards: string;
  /** Narrative stage 1-5 */
  stage: number;
  dateAdded: string;
}

export interface DmQuestsApiModel {
  username: string;
  quests: DmQuestEntry[];
}

export interface DmNotesApiModel {
  username: string;
  /** General world / campaign notes */
  worldNotes: string;
  /** Secrets, plot twists, hidden information */
  secrets: string;
}

// ── Story Timeline ─────────────────────────────────────────────────────────

export type StoryEventType = 'world' | 'campaign' | 'character' | 'other';

export interface StoryEvent {
  id: string;
  title: string;
  /** Kept for backward-compat with existing DB records — no longer shown in UI */
  inGameDate: string;
  /** ISO date string — used for chronological ordering */
  realDate: string;
  type: StoryEventType;
  /** Kept for backward-compat with existing DB records — no longer used in UI */
  importance?: string;
  summary: string;
  /** Kept for backward-compat — no longer editable in UI */
  dmNotes: string;
  /** Kept for backward-compat — no longer editable in UI */
  imageBase64: string | null;
  location: string;
  tags: string;
}

export interface DmStoryTimelineApiModel {
  username: string;
  events: StoryEvent[];
  /** Usernames of players allowed to view this timeline (read-only) */
  sharedWith?: string[];
}

export interface TimelineInvitationModel {
  viewerUsername: string;
  ownerUsername: string;
}

