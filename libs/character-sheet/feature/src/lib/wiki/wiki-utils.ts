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

