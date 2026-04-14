import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { marked } from 'marked';

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
      map(markdown => this.parseMarkdown(markdown)),
      tap(html => this.cache.set(cacheKey, html)),
    );
  }

  private parseMarkdown(markdown: string): string {
    // Replace VuePress-style <Card header="...">...</Card> blocks with styled asides
    const preprocessed = markdown.replace(
      /<Card\s+header="([^"]*)">([\s\S]*?)<\/Card>/gi,
      (_match, header, body) =>
        `<aside class="wiki-card"><strong class="wiki-card__header">${header}</strong>${body}</aside>`,
    );

    const result = marked.parse(preprocessed, { async: false });
    return result as string;
  }
}

