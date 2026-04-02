export type QuestStatus = 'active' | 'completed' | 'failed' | 'inactive';
export type QuestPriority = 'critical' | 'high' | 'medium' | 'low';

export interface QuestEntry {
  id: string;
  title: string;
  /** Rich-textarea markup (same syntax as notes) */
  description: string;
  imageBase64: string | null;
  status: QuestStatus;
  priority: QuestPriority;
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

