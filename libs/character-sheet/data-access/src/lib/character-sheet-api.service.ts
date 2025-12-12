import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import {
  CharacterSheetApiModel,
  GroupSheetApiModel,
  NotesPageApiModel,
  OtherHorsesPageApiModel
} from '@dn-d-servant/character-sheet-util';
import { environment } from '@dn-d-servant/util';

@Injectable({ providedIn: 'root' })
export class CharacterSheetApiService {
  firestore = inject(Firestore);

  characterSheetsCollection = collection(this.firestore, environment.characterSheetCollectionName);

  getCharacterSheetByUsername(username: string): Observable<CharacterSheetApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as CharacterSheetApiModel) : undefined)),
    );
  }

  getGroupSheetByUsername(username: string): Observable<GroupSheetApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as GroupSheetApiModel) : undefined)),
    );
  }

  getNotesPageByUsername(username: string): Observable<NotesPageApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as NotesPageApiModel) : undefined)),
    );
  }

  getOtherHorsesByUsername(username: string): Observable<OtherHorsesPageApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as OtherHorsesPageApiModel) : undefined)),
    );
  }

  // ------------------------------------------

  addCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, characterSheet.username);
    return from(setDoc(docRef, characterSheet));
  }

  updateCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${characterSheet.username}`);
    return from(setDoc(docRef, characterSheet));
  }

  addGroupSheet(characterSheet: GroupSheetApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, characterSheet.username);
    return from(setDoc(docRef, characterSheet));
  }

  updateGroupSheet(characterSheet: GroupSheetApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${characterSheet.username}`);
    return from(setDoc(docRef, characterSheet));
  }

  addNotesPage(notesPage: NotesPageApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, notesPage.username);
    return from(setDoc(docRef, notesPage));
  }

  updateNotesPage(notesPage: NotesPageApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${notesPage.username}`);
    return from(setDoc(docRef, notesPage));
  }

  addOtherHorsesPage(notesPage: OtherHorsesPageApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, notesPage.username);
    return from(setDoc(docRef, notesPage));
  }

  updateOtherHorsesPage(notesPage: OtherHorsesPageApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${notesPage.username}`);
    return from(setDoc(docRef, notesPage));
  }
}
