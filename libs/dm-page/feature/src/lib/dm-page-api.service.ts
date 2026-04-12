import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { DmNotesApiModel, DmQuestsApiModel } from './dm-page-models';

@Injectable({ providedIn: 'root' })
export class DmPageApiService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  // ── DM Quests ─────────────────────────────────────────────────────────────

  getDmQuestsByUsername(username: string): Observable<DmQuestsApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `dm-quests/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as DmQuestsApiModel) : undefined)));
  }

  saveDmQuests(model: DmQuestsApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `dm-quests/${model.username}`);
      return setDoc(ref, model);
    }));
  }

  // ── DM Notes ──────────────────────────────────────────────────────────────

  getDmNotesByUsername(username: string): Observable<DmNotesApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `dm-notes/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as DmNotesApiModel) : undefined)));
  }

  saveDmNotes(model: DmNotesApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `dm-notes/${model.username}`);
      return setDoc(ref, model);
    }));
  }
}

