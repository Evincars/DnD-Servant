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
