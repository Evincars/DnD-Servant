import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { collection, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import {
  CharacterSheetApiModel,
  GroupSheetApiModel,
  ItemVaultApiModel,
  NotesPageApiModel,
  QuestsApiModel,
} from '@dn-d-servant/character-sheet-util';
import { environment } from '@dn-d-servant/util';

@Injectable({ providedIn: 'root' })
export class CharacterSheetApiService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  characterSheetsCollection = collection(this.firestore, environment.characterSheetCollectionName);

  private _getDoc(ref: Parameters<typeof doc>[0]) {
    return runInInjectionContext(this.injector, () => getDoc(ref as any));
  }

  private _setDoc(ref: Parameters<typeof doc>[0], data: object) {
    return runInInjectionContext(this.injector, () => setDoc(ref as any, data));
  }

  getCharacterSheetByUsername(username: string): Observable<CharacterSheetApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(this._getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? (snapshot.data() as CharacterSheetApiModel) : undefined)),
    );
  }

  getGroupSheetByUsername(username: string): Observable<GroupSheetApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(this._getDoc(docRef)).pipe(map(snapshot => (snapshot.exists() ? (snapshot.data() as GroupSheetApiModel) : undefined)));
  }

  getNotesPageByUsername(username: string): Observable<NotesPageApiModel | undefined> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
    return from(this._getDoc(docRef)).pipe(map(snapshot => (snapshot.exists() ? (snapshot.data() as NotesPageApiModel) : undefined)));
  }

  // ------------------------------------------

  addCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, characterSheet.username);
    return from(this._setDoc(docRef, characterSheet));
  }

  updateCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${characterSheet.username}`);
    return from(this._setDoc(docRef, characterSheet));
  }

  addGroupSheet(characterSheet: GroupSheetApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, characterSheet.username);
    return from(this._setDoc(docRef, characterSheet));
  }

  updateGroupSheet(characterSheet: GroupSheetApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${characterSheet.username}`);
    return from(this._setDoc(docRef, characterSheet));
  }

  addNotesPage(notesPage: NotesPageApiModel): Observable<void> {
    const docRef = doc(this.characterSheetsCollection, notesPage.username);
    return from(this._setDoc(docRef, notesPage));
  }

  updateNotesPage(notesPage: NotesPageApiModel): Observable<void> {
    const docRef = doc(this.firestore, `${environment.characterSheetCollectionName}/${notesPage.username}`);
    return from(this._setDoc(docRef, notesPage));
  }

  // ------------------------------------------

  getItemVaultByUsername(username: string): Observable<ItemVaultApiModel | undefined> {
    const docRef = doc(this.firestore, `item-vault/${username}`);
    return from(this._getDoc(docRef)).pipe(map(snapshot => (snapshot.exists() ? (snapshot.data() as ItemVaultApiModel) : undefined)));
  }

  saveItemVault(vault: ItemVaultApiModel): Observable<void> {
    const docRef = doc(this.firestore, `item-vault/${vault.username}`);
    return from(this._setDoc(docRef, vault));
  }

  // ------------------------------------------

  getQuestsByUsername(username: string): Observable<QuestsApiModel | undefined> {
    const docRef = doc(this.firestore, `quests/${username}`);
    return from(this._getDoc(docRef)).pipe(map(snapshot => (snapshot.exists() ? (snapshot.data() as QuestsApiModel) : undefined)));
  }

  saveQuests(model: QuestsApiModel): Observable<void> {
    const docRef = doc(this.firestore, `quests/${model.username}`);
    return from(this._setDoc(docRef, model));
  }
}
