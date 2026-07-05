/** Strip diacritics and lowercase — used for diacritic-insensitive search. */
export function normalizeStr(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Convert any heading text to a URL-safe slug.
 * e.g. "Fázový Pavouk" → "fazovy-pavouk"
 */
export function slugify(text: string): string {
  return normalizeStr(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Escape HTML special characters. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] ?? c));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns an HTML string with matched chars wrapped in `<mark class="hl">`.
 * Returns `null` if the text does NOT match (entry should be hidden).
 * Returns plain-escaped HTML when query is empty (show all, no mark).
 */
export function highlightMatch(text: string, query: string): string | null {
  if (!query.trim()) return escapeHtml(text);
  const normQ = normalizeStr(query);
  if (!normQ) return escapeHtml(text);
  if (!normalizeStr(text).includes(normQ)) return null;

  const pattern = [...normQ]
    .map(c => escapeRegex(c) + '[\\u0300-\\u036f]*')
    .join('[\\u0300-\\u036f]*');
  const regex = new RegExp(pattern, 'giu');

  const nfdText = text.normalize('NFD');
  let out = '';
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(nfdText)) !== null) {
    out += escapeHtml(nfdText.slice(lastIdx, m.index).normalize('NFC'));
    out += `<mark class="hl">${escapeHtml(m[0].normalize('NFC'))}</mark>`;
    lastIdx = m.index + m[0].length;
  }
  out += escapeHtml(nfdText.slice(lastIdx).normalize('NFC'));
  return out;
}

