import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DmNotesApiModel, DmQuestsApiModel } from './dm-page-models';
import { DmPageApiService } from './dm-page-api.service';

export const DmPageStore = signalStore(
  withState({
    dmQuests: undefined as DmQuestsApiModel | undefined,
    dmNotes: undefined as DmNotesApiModel | undefined,
    loading: false,
  }),
  withMethods((store, api = inject(DmPageApiService), snack = inject(MatSnackBar)) => {
    const loadDmQuests = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(username =>
          api.getDmQuestsByUsername(username).pipe(
            tapResponse(
              res => patchState(store, { dmQuests: res, loading: false }),
              (e: HttpErrorResponse) => {
                snack.open('Načtení DM questů selhalo: ' + e.message, 'Zavřít', { verticalPosition: 'top', duration: 3000 });
                patchState(store, { loading: false });
              },
            ),
          ),
        ),
      ),
    );

    const saveDmQuests = rxMethod<DmQuestsApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req =>
          api.saveDmQuests(req).pipe(
            tapResponse(
              () => {
                patchState(store, { dmQuests: req, loading: false });
                snack.open('📖 DM questy uloženy!', '✕', { verticalPosition: 'top', duration: 2200, panelClass: ['snackbar--save'] });
              },
              (e: HttpErrorResponse) => {
                snack.open('Ukládání DM questů selhalo: ' + e.message, 'Zavřít', { verticalPosition: 'top', duration: 3000 });
                patchState(store, { loading: false });
              },
            ),
          ),
        ),
      ),
    );

    const loadDmNotes = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(username =>
          api.getDmNotesByUsername(username).pipe(
            tapResponse(
              res => patchState(store, { dmNotes: res, loading: false }),
              (e: HttpErrorResponse) => {
                snack.open('Načtení DM poznámek selhalo: ' + e.message, 'Zavřít', { verticalPosition: 'top', duration: 3000 });
                patchState(store, { loading: false });
              },
            ),
          ),
        ),
      ),
    );

    const saveDmNotes = rxMethod<DmNotesApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req =>
          api.saveDmNotes(req).pipe(
            tapResponse(
              () => {
                patchState(store, { dmNotes: req, loading: false });
                snack.open('📜 Poznámky PH uloženy!', '✕', { verticalPosition: 'top', duration: 2200, panelClass: ['snackbar--save'] });
              },
              (e: HttpErrorResponse) => {
                snack.open('Ukládání poznámek selhalo: ' + e.message, 'Zavřít', { verticalPosition: 'top', duration: 3000 });
                patchState(store, { loading: false });
              },
            ),
          ),
        ),
      ),
    );

    return { loadDmQuests, saveDmQuests, loadDmNotes, saveDmNotes };
  }),
);

