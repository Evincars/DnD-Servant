import { StoryEventType } from '../../dm-page-models';

export const TYPE_META: Record<StoryEventType, { label: string; icon: string; color: string; bg: string }> = {
  world:     { label: 'Světová událost',  icon: 'public',       color: 'rgba(100,140,210,.9)', bg: 'rgba(70,110,190,.10)' },
  campaign:  { label: 'Událost kampaně',  icon: 'auto_stories', color: 'rgba(210,175,55,.9)',  bg: 'rgba(190,155,40,.10)' },
  character: { label: 'Událost postav',   icon: 'person',       color: 'rgba(60,185,150,.9)',  bg: 'rgba(40,160,120,.10)' },
  other:     { label: 'Jiné',             icon: 'bookmark',     color: 'rgba(130,130,130,.8)', bg: 'rgba(100,100,100,.08)'},
};

export const TYPE_ORDER: StoryEventType[] = ['world', 'campaign', 'character', 'other'];

export type FilterType = 'all' | StoryEventType;
export type SortOrder  = 'newest' | 'oldest';

export function parseTags(tags: string): string[] {
  return tags.split(/[,\s]+/).map(t => t.trim()).filter(Boolean);
}

export function posNorm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function fuzzySubsequence(query: string, text: string): number[] | null {
  const indices: number[] = [];
  let ti = 0;
  for (let qi = 0; qi < query.length; qi++) {
    const ch = query[qi];
    while (ti < text.length && text[ti] !== ch) ti++;
    if (ti >= text.length) return null;
    indices.push(ti); ti++;
  }
  return indices;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildHighlightHtml(original: string, indices: number[]): string {
  const matchSet = new Set(indices);
  const parts: string[] = [];
  let inSpan = false;
  for (let i = 0; i < original.length; i++) {
    const ch = escHtml(original[i]);
    if (matchSet.has(i)) {
      if (!inSpan) { parts.push('<span class="hl">'); inSpan = true; }
      parts.push(ch);
    } else {
      if (inSpan) { parts.push('</span>'); inSpan = false; }
      parts.push(ch);
    }
  }
  if (inSpan) parts.push('</span>');
  return parts.join('');
}
