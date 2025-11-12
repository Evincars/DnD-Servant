import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { CharacterSheetApiModel } from '@dn-d-servant/character-sheet-util';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { environment } from '@dn-d-servant/util';

@Injectable({ providedIn: 'root' })
export class CharacterSheetApiService {
  firestore = inject(Firestore);

  characterSheetsCollection = collection(this.firestore, environment.characterSheetCollectionName);

  getCharacterSheets(): Observable<Array<CharacterSheetApiModel>> {
    return collectionData(this.characterSheetsCollection, { idField: 'id' }) as Observable<Array<CharacterSheetApiModel>>;
  }

  getCharacterSheetByUsername(username: string): Observable<CharacterSheetApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as CharacterSheetApiModel) : undefined)),
    );
  }

  addCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, characterSheet.username);
    return from(setDoc(docRef, characterSheet));
  }

  updateCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${characterSheet.username}`);
    return from(setDoc(docRef, characterSheet));
  }
}
