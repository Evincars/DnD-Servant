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
  /** NPC & faction descriptions, relationships */
  npcsAndFactions: string;
  /** Treasure, magic items, rewards to hand out */
  rewards: string;
}

