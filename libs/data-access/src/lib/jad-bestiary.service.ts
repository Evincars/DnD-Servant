import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { marked } from 'marked';
import { JAD_MONSTER_MAP } from '@dn-d-servant/util';

export interface JadMonsterResult {
  /** The monster title as it appears in the wiki. */
  title: string;
  /** Pre-rendered HTML stat block (same classes as wiki monster-card). */
  html: string;
  /** Parsed numeric hit points (for auto-fill). */
  hitPoints: number | null;
  /** Parsed numeric AC value (for auto-fill). */
  armorClass: number | null;
}

@Injectable({ providedIn: 'root' })
export class JadBestiaryService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, string>();

  /**
   * Looks up a JaD wiki monster by its Czech name.
   * Returns `null` (via `of(null)`) if the name is not in the JaD catalog.
   */
  getMonster(name: string): Observable<JadMonsterResult | null> {
    const entry = JAD_MONSTER_MAP.get(name.toLowerCase());
    if (!entry) return of(null);

    return this.loadFile(entry.bookId, entry.file).pipe(
      map(markdown => this.extractMonster(markdown, name)),
    );
  }

  /** Returns true if the given name (case-insensitive) is a known JaD monster. */
  isJadMonster(name: string): boolean {
    return JAD_MONSTER_MAP.has(name.toLowerCase());
  }

  // ── File loading ──────────────────────────────────────────────────────────

  private loadFile(bookId: string, file: string): Observable<string> {
    const cacheKey = `${bookId}/${file}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    const encodedPath = file
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    return this.http
      .get(`/dnd5esrd/${bookId}/${encodedPath}`, { responseType: 'text' })
      .pipe(tap(md => this.cache.set(cacheKey, md)));
  }

  // ── Monster block parsing ─────────────────────────────────────────────────

  private extractMonster(markdown: string, title: string): JadMonsterResult | null {
    // Find the <Monster ... title="<title>" ...> ... </Monster> block that matches
    const re = /<Monster([\s\S]*?)>([\s\S]*?)<\/Monster>/gi;
    let match: RegExpExecArray | null;

    while ((match = re.exec(markdown)) !== null) {
      const attrsStr = match[1];
      const inner = match[2];
      const attrs = this.parseAttrs(attrsStr);

      if (attrs['title']?.toLowerCase() === title.toLowerCase()) {
        const bodyHtml = marked.parse(inner.trim(), { async: false }) as string;
        const html = this.buildMonsterCard(attrs, bodyHtml);
        const hitPoints = this.parseHp(attrs['hit-points']);
        const armorClass = this.parseAc(attrs['armor-class']);
        return { title: attrs['title'], html, hitPoints, armorClass };
      }
    }

    return null;
  }

  private parseAttrs(attrsStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    const re = /([\w-]+)="([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrsStr)) !== null) {
      result[m[1]] = m[2];
    }
    return result;
  }

  private buildMonsterCard(a: Record<string, string>, bodyHtml: string): string {
    const row = (label: string, val: string | undefined) =>
      val ? `<div class="mc-row"><span class="mc-label">${label}</span>${val}</div>` : '';

    const ab = (abbr: string, key: string) =>
      `<div class="mc-ab"><div class="mc-ab-name">${abbr}</div>` +
      `<div class="mc-ab-val">${a[key] ?? '—'}</div></div>`;

    return `<div class="monster-card">
  <div class="mc-head">
    <div class="mc-name">${a['title'] ?? 'Neznámý tvor'}</div>
    <div class="mc-type">${a['subtitle'] ?? ''}</div>
  </div>
  <div class="mc-rule"></div>
  <div class="mc-basics">
    ${row('Třída zbroje', a['armor-class'])}
    ${row('Životy', a['hit-points'])}
    ${row('Rychlost', a['speed'])}
  </div>
  <div class="mc-rule"></div>
  <div class="mc-abilities">
    ${ab('SIL', 'str')}${ab('OBR', 'dex')}${ab('ODL', 'con')}
    ${ab('INT', 'int')}${ab('MDR', 'wis')}${ab('CHA', 'cha')}
  </div>
  <div class="mc-rule"></div>
  <div class="mc-details">
    ${row('Záchranné hody', a['saving-throws'])}
    ${row('Dovednosti', a['skills'])}
    ${row('Zranitelnost', a['damage-vulnerabilities'])}
    ${row('Odolání', a['damage-resistances'])}
    ${row('Imunita vůči zranění', a['damage-immunities'])}
    ${row('Imunita vůči stavům', a['condition-immunities'])}
    ${row('Smysly', a['senses'])}
    ${row('Jazyky', a['languages'])}
    ${row('Nebezpečnost', a['challenge'])}
  </div>
  <div class="mc-rule"></div>
  <div class="mc-body">${bodyHtml}</div>
</div>`;
  }

  // ── Numeric parsing utilities ─────────────────────────────────────────────

  /** Extracts first integer from a string like "16 (přirozená zbroj)" → 16 */
  private parseAc(raw: string | undefined): number | null {
    if (!raw) return null;
    const m = raw.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  /** Extracts first integer from a string like "32 (5k8 + 10)" → 32 */
  private parseHp(raw: string | undefined): number | null {
    if (!raw) return null;
    const m = raw.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }
}

