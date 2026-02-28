import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dnd5eEndpoint, Dnd5eListResponse, Monster } from './dnd5e-api.models';

const BASE_URL = 'https://www.dnd5eapi.co/api/2014';

@Injectable({ providedIn: 'root' })
export class Dnd5eApiService {
  private readonly http = inject(HttpClient);

  /**
   * Returns the full list for a given endpoint.
   * e.g. getList('monsters') → GET /api/2014/monsters
   */
  getList(endpoint: Dnd5eEndpoint): Observable<Dnd5eListResponse> {
    return this.http.get<Dnd5eListResponse>(`${BASE_URL}/${endpoint}`);
  }

  /**
   * Returns a single resource by its index string.
   * e.g. getOne('spells', 'fireball') → GET /api/2014/spells/fireball
   * The generic T lets callers type the response as needed.
   */
  getOne<T = unknown>(endpoint: Dnd5eEndpoint, index: string): Observable<T> {
    return this.http.get<T>(`${BASE_URL}/${endpoint}/${index}`);
  }

  /**
   * Typed shorthand – returns a fully-typed Monster.
   * e.g. getMonster('aboleth') → GET /api/2014/monsters/aboleth
   */
  getMonster(index: string): Observable<Monster> {
    return this.http.get<Monster>(`${BASE_URL}/monsters/${index}`);
  }
}
