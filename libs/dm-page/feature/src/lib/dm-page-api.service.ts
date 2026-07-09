import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { deleteDoc, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { DmNotesApiModel, DmQuestsApiModel, DmStoryTimelineApiModel, TimelineInvitationModel } from './dm-page-models';

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

  // ── Story Timeline ────────────────────────────────────────────────────────

  getDmStoryTimeline(username: string): Observable<DmStoryTimelineApiModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `dm-story-timeline/${username}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as DmStoryTimelineApiModel) : undefined)));
  }

  saveDmStoryTimeline(model: DmStoryTimelineApiModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `dm-story-timeline/${model.username}`);
      return setDoc(ref, model);
    }));
  }

  // ── Timeline Invitations ──────────────────────────────────────────────────

  getTimelineInvitation(viewerUsername: string): Observable<TimelineInvitationModel | undefined> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `timeline-invitations/${viewerUsername}`);
      return getDoc(ref);
    })).pipe(map(s => (s.exists() ? (s.data() as TimelineInvitationModel) : undefined)));
  }

  setTimelineInvitation(model: TimelineInvitationModel): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `timeline-invitations/${model.viewerUsername}`);
      return setDoc(ref, model);
    }));
  }

  removeTimelineInvitation(viewerUsername: string): Observable<void> {
    return from(runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `timeline-invitations/${viewerUsername}`);
      return deleteDoc(ref);
    }));
  }
}

