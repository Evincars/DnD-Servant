import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of, shareReplay } from 'rxjs';

/**
 * Real-time translator that uses the free Google Translate REST endpoint.
 * No API key required. Translates English → Czech.
 *
 * Results are cached in-memory so the same string is never fetched twice.
 */
@Injectable({ providedIn: 'root' })
export class DndTranslatorService {
  private readonly http = inject(HttpClient);

  // In-memory cache: english text → czech translation
  private readonly _cache = new Map<string, Observable<string>>();

  /**
   * Translate a single string from English to Czech.
   * Returns an Observable that emits the translated string.
   * Falls back to the original text on error.
   */
  translate(text: string): Observable<string> {
    if (!text?.trim()) return of(text ?? '');

    const cached = this._cache.get(text);
    if (cached) return cached;

    const url = 'https://translate.googleapis.com/translate_a/single';
    const params = new HttpParams().set('client', 'gtx').set('sl', 'en').set('tl', 'cs').set('dt', 't').set('q', text);

    const result$ = this.http.get<unknown[]>(url, { params }).pipe(
      map(res => this._extractTranslation(res, text)),
      // On any error just return the original text
      // (catchError imported lazily to keep bundle small)
      shareReplay(1),
    );

    this._cache.set(text, result$);
    return result$;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _extractTranslation(res: unknown, fallback: string): string {
    try {
      // Response shape: [ [ ["translated","original",...], ...], null, ...]
      const parts = (res as unknown[][])[0] as unknown[][];
      return parts
        .map(p => (p as unknown[])[0])
        .filter(Boolean)
        .join('');
    } catch {
      return fallback;
    }
  }
}
