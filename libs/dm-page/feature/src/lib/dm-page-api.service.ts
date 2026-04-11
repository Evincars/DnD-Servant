import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { DmNotesApiModel, DmQuestsApiModel } from './dm-page-models';

@Injectable({ providedIn: 'root' })
export class DmPageApiService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  private _getDoc(ref: Parameters<typeof doc>[0]) {
    return runInInjectionContext(this.injector, () => getDoc(ref as any));
  }

  private _setDoc(ref: Parameters<typeof doc>[0], data: object) {
    return runInInjectionContext(this.injector, () => setDoc(ref as any, data));
  }

  // ── DM Quests ─────────────────────────────────────────────────────────────

  getDmQuestsByUsername(username: string): Observable<DmQuestsApiModel | undefined> {
    const ref = doc(this.firestore, `dm-quests/${username}`);
    return from(this._getDoc(ref)).pipe(map(s => (s.exists() ? (s.data() as DmQuestsApiModel) : undefined)));
  }

  saveDmQuests(model: DmQuestsApiModel): Observable<void> {
    const ref = doc(this.firestore, `dm-quests/${model.username}`);
    return from(this._setDoc(ref, model));
  }

  // ── DM Notes ──────────────────────────────────────────────────────────────

  getDmNotesByUsername(username: string): Observable<DmNotesApiModel | undefined> {
    const ref = doc(this.firestore, `dm-notes/${username}`);
    return from(this._getDoc(ref)).pipe(map(s => (s.exists() ? (s.data() as DmNotesApiModel) : undefined)));
  }

  saveDmNotes(model: DmNotesApiModel): Observable<void> {
    const ref = doc(this.firestore, `dm-notes/${model.username}`);
    return from(this._setDoc(ref, model));
  }
}

