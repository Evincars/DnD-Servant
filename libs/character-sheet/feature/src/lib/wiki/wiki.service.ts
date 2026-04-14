import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { marked } from 'marked';
import { slugify } from './wiki-utils';

/** Inline SVG for the link/anchor icon (Material "link" path). */
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

  /** In-memory cache: key = `{bookId}/{file}`, value = rendered HTML string */
  private readonly cache = new Map<string, string>();

  /**
   * Fetch and render a chapter from public/dnd5esrd.
   * Returns cached HTML immediately if already fetched.
   */
  loadChapter(bookId: string, file: string): Observable<string> {
    const cacheKey = `${bookId}/${file}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    // Encode each path segment separately to handle Czech chars & spaces
    const encodedPath = file
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    const url = `/dnd5esrd/${bookId}/${encodedPath}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(markdown => this.parseMarkdown(markdown, bookId, file)),
      tap(html => this.cache.set(cacheKey, html)),
    );
  }

  private parseMarkdown(markdown: string, bookId: string, file: string): string {
    // Replace VuePress-style <Card header="...">...</Card> blocks with styled asides
    const preprocessed = markdown.replace(
      /<Card\s+header="([^"]*)">([\s\S]*?)<\/Card>/gi,
      (_match, header, body) =>
        `<aside class="wiki-card"><strong class="wiki-card__header">${header}</strong>${body}</aside>`,
    );

    const html = marked.parse(preprocessed, { async: false }) as string;
    return this.addHeadingAnchors(html, bookId, file);
  }

  /**
   * Post-process rendered HTML to inject anchor buttons next to every heading.
   * The data-anchor attribute encodes `wiki/{bookId}/{chapterId}/{headingSlug}`
   * which is used as the URL hash and clipboard payload.
   */
  private addHeadingAnchors(html: string, bookId: string, file: string): string {
    // Derive a clean chapter slug from the filename (last path segment, no ext)
    const chapterId = slugify(
      file.replace(/\.md$/i, '').split('/').pop() ?? file,
    );

    return html.replace(
      /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi,
      (_match, tag: string, attrs: string, content: string) => {
        // Strip any HTML tags from content to get plain text for slug generation
        const plainText = content.replace(/<[^>]+>/g, '').trim();
        const headingSlug = slugify(plainText);
        const anchorId = `wiki/${bookId}/${chapterId}/${headingSlug}`;

        const btn =
          `<button class="heading-anchor" data-anchor="${anchorId}" ` +
          `title="Kopírovat odkaz na tuto sekci">${LINK_SVG}</button>`;

        return `<${tag}${attrs} id="${headingSlug}">${content}${btn}</${tag}>`;
      },
    );
  }
}
