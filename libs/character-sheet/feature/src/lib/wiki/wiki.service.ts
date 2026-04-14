import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { marked } from 'marked';
import { slugify } from './wiki-utils';

const LINK_SVG =
  `<svg class="anchor-svg" viewBox="0 0 24 24" width="14" height="14" ` +
  `fill="currentColor" aria-hidden="true">` +
  `<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 ` +
  `5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 ` +
  `3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>` +
  `</svg>`;

@Injectable({ providedIn: 'root' })
export class WikiService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, string>();

  loadChapter(bookId: string, file: string): Observable<string> {
    const cacheKey = `${bookId}/${file}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    const encodedPath = file
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    return this.http.get(`/dnd5esrd/${bookId}/${encodedPath}`, { responseType: 'text' }).pipe(
      map(markdown => this.parseMarkdown(markdown, bookId, file)),
      tap(html => this.cache.set(cacheKey, html)),
    );
  }

  private parseMarkdown(markdown: string, bookId: string, file: string): string {
    // 1. Replace VuePress Card blocks
    let text = markdown.replace(
      /<Card\s+header="([^"]*)">([\s\S]*?)<\/Card>/gi,
      (_m, header, body) =>
        `<aside class="wiki-card"><strong class="wiki-card__header">${header}</strong>${body}</aside>`,
    );

    // 2. Extract Monster blocks before markdown parsing (their inner content
    //    contains raw markdown that must be parsed separately)
    const monsters = new Map<string, string>();
    let idx = 0;
    text = text.replace(
      /<Monster([\s\S]*?)>([\s\S]*?)<\/Monster>/gi,
      (_m, attrsStr: string, inner: string) => {
        const attrs = this.parseAttrs(attrsStr);
        const bodyHtml = marked.parse(inner.trim(), { async: false }) as string;
        const card = this.buildMonsterCard(attrs, bodyHtml);
        const key = `%%MONSTER_${idx++}%%`;
        monsters.set(key, card);
        return `\n\n${key}\n\n`;
      },
    );

    // 3. Parse the rest as markdown
    let html = marked.parse(text, { async: false }) as string;

    // 4. Restore monster cards (marked may wrap placeholder in <p>)
    for (const [key, card] of monsters) {
      html = html.replace(new RegExp(`<p>${key}</p>|${key}`, 'g'), card);
    }

    // 5. Inject heading anchors
    return this.addHeadingAnchors(html, bookId, file);
  }

  // ── Attribute parser ────────────────────────────────────────────────────────

  private parseAttrs(attrsStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    const re = /([\w-]+)="([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrsStr)) !== null) {
      result[m[1]] = m[2];
    }
    return result;
  }

  // ── Monster card builder ────────────────────────────────────────────────────

  private buildMonsterCard(a: Record<string, string>, bodyHtml: string): string {
    const row = (label: string, val: string | undefined) =>
      val ? `<div class="mc-row"><span class="mc-label">${label}</span>${val}</div>` : '';

    const ab = (abbr: string, key: string) =>
      `<div class="mc-ab"><div class="mc-ab-name">${abbr}</div>`+
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
    ${ab('SIL','str')}${ab('OBR','dex')}${ab('ODL','con')}
    ${ab('INT','int')}${ab('MDR','wis')}${ab('CHA','cha')}
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

  // ── Heading anchors ─────────────────────────────────────────────────────────

  private addHeadingAnchors(html: string, bookId: string, file: string): string {
    const chapterId = slugify(
      file.replace(/\.md$/i, '').split('/').pop() ?? file,
    );

    return html.replace(
      /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi,
      (_m, tag: string, attrs: string, content: string) => {
        const plain = content.replace(/<[^>]+>/g, '').trim();
        const slug = slugify(plain);
        const anchorId = `wiki/${bookId}/${chapterId}/${slug}`;
        const btn =
          `<button class="heading-anchor" data-anchor="${anchorId}" ` +
          `title="Kopírovat odkaz">${LINK_SVG}</button>`;
        return `<${tag}${attrs} id="${slug}">${content}${btn}</${tag}>`;
      },
    );
  }
}
