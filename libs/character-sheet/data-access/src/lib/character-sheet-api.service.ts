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

  // collection() is called during construction — injection context is active here
  characterSheetsCollection = collection(this.firestore, environment.characterSheetCollectionName);

  getCharacterSheetByUsername(username: string): Observable<CharacterSheetApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as CharacterSheetApiModel) : undefined)));
  }

  getGroupSheetByUsername(username: string): Observable<GroupSheetApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as GroupSheetApiModel) : undefined)));
  }

  getNotesPageByUsername(username: string): Observable<NotesPageApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${environment.characterSheetCollectionName}/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as NotesPageApiModel) : undefined)));
  }

  // ------------------------------------------

  addCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.characterSheetsCollection, characterSheet.username);
      return setDoc(ref, characterSheet);
    }));
  }

  updateCharacterSheet(characterSheet: CharacterSheetApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${environment.characterSheetCollectionName}/${characterSheet.username}`);
      return setDoc(ref, characterSheet);
    }));
  }

  addGroupSheet(groupSheet: GroupSheetApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.characterSheetsCollection, groupSheet.username);
      return setDoc(ref, groupSheet);
    }));
  }

  updateGroupSheet(groupSheet: GroupSheetApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${environment.characterSheetCollectionName}/${groupSheet.username}`);
      return setDoc(ref, groupSheet);
    }));
  }

  addNotesPage(notesPage: NotesPageApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.characterSheetsCollection, notesPage.username);
      return setDoc(ref, notesPage);
    }));
  }

  updateNotesPage(notesPage: NotesPageApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${environment.characterSheetCollectionName}/${notesPage.username}`);
      return setDoc(ref, notesPage);
    }));
  }

  // ------------------------------------------

  getItemVaultByUsername(username: string): Observable<ItemVaultApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `item-vault/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as ItemVaultApiModel) : undefined)));
  }

  saveItemVault(vault: ItemVaultApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `item-vault/${vault.username}`);
      return setDoc(ref, vault);
    }));
  }

  // ------------------------------------------

  getQuestsByUsername(username: string): Observable<QuestsApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `quests/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as QuestsApiModel) : undefined)));
  }

  saveQuests(model: QuestsApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `quests/${model.username}`);
      return setDoc(ref, model);
    }));
  }
}
