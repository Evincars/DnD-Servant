import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { REALTIME_DB_URL_TOKEN } from '@dn-d-servant/util';
import { CharacterSheetApiModel } from '@dn-d-servant/character-sheet-util';
import { getDatabase, ref, set } from '@angular/fire/database';
import { from, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CharacterSheetApiService {
  httpClient = inject(HttpClient);
  realtimeDbUrlToken = inject(REALTIME_DB_URL_TOKEN);
  readonly collectionName = 'character-sheets.json';

  saveCharacterSheet(req: CharacterSheetApiModel) {
    // const url = `${this.realtimeDbUrlToken}/${this.collectionName}`;
    // return this.httpClient.post(url, req);

    // Assuming you have initialized your Firebase app elsewhere
    const database = getDatabase();

    console.log('database', database);

    // Your custom unique ID for the character sheet
    const customCharacterId = 'aragorn-strider-123'; // Example custom ID

    // The data for your character sheet
    const characterSheetData = {
      name: 'Aragorn',
      class: 'Ranger',
      level: 5,
      // ... other character data
    };

    // Create a reference to the specific path where you want to store the data
    // This path includes your custom unique ID: "character-sheets/aragorn-strider-123"
    const characterRef = ref(database, `character-sheets/${customCharacterId}`);

    console.log('characterRef', characterRef);
    // Use the set() method to write the data to that specific reference
    const promise = set(characterRef, characterSheetData)
      .then(() => {
        console.log('Character sheet saved successfully with custom ID!');
      })
      .catch(error => {
        console.error('Error saving character sheet:', error);
      });
    return from(promise);
  }
}
