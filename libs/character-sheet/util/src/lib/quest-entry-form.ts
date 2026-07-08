export type QuestStatus = 'active' | 'completed' | 'failed' | 'inactive';

export interface QuestEntry {
  id: string;
  title: string;
  /** Rich-textarea markup (same syntax as notes) */
  description: string;
  imageBase64: string | null;
  status: QuestStatus;
  rewards: string;
  npcName: string;
  location: string;
  /** ISO date string (YYYY-MM-DD) */
  dateAdded: string;
}

export interface QuestsApiModel {
  username: string;
  quests: QuestEntry[];
}

