import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { REALTIME_DB_URL_TOKEN } from '@dn-d-servant/util';
import { CharacterSheetApiModel } from '@dn-d-servant/character-sheet-util';

@Injectable({ providedIn: 'root' })
export class CharacterSheetApiService {
  httpClient = inject(HttpClient);
  realtimeDbUrlToken = inject(REALTIME_DB_URL_TOKEN);

  saveCharacterSheet(req: CharacterSheetApiModel) {
    return this.httpClient.post(this.realtimeDbUrlToken, req);
  }
}
