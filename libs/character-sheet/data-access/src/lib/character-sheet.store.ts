import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  CharacterSheetApiModel,
  GroupSheetApiModel,
  NotesPageApiModel,
  OtherHorsesPageApiModel,
} from '@dn-d-servant/character-sheet-util';
import { pipe, switchMap, tap } from 'rxjs';
import { CharacterSheetApiService } from './character-sheet-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const CharacterSheetStore = signalStore(
  withState({
    characterSheet: undefined as CharacterSheetApiModel | undefined,
    groupSheet: undefined as GroupSheetApiModel | undefined,
    notesPage: undefined as NotesPageApiModel | undefined,
    otherHorsesPage: undefined as OtherHorsesPageApiModel | undefined,
    characterSheetSaved: false,
    groupSheetSaved: false,
    characterSheetError: '',
    loading: false,
    characterImage: null as string | null,
  }),
  withComputed(store => ({})),
  withMethods((store, _characterSheetApiService = inject(CharacterSheetApiService), _snackBar = inject(MatSnackBar)) => {
    const saveCharacterImage = function (formDate: string) {
      patchState(store, { characterImage: formDate });
    };

    const getCharacterSheetByUsername = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(username => {
          return _characterSheetApiService.getCharacterSheetByUsername(username).pipe(
            tapResponse(
              res => {
                patchState(store, { characterSheet: res, characterSheetError: '', characterSheetSaved: false, loading: false });
              },
              (error: HttpErrorResponse) => {
                _snackBar.open('Načtení character sheetu se nezdařilo: ' + error.message, 'Zavřít', {
                  verticalPosition: 'top',
                  duration: 3000,
                });
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'GET: Načtení character sheetu se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const getGroupSheetByUsername = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(username => {
          return _characterSheetApiService.getGroupSheetByUsername(username).pipe(
            tapResponse(
              res => {
                patchState(store, { groupSheet: res, characterSheetError: '', groupSheetSaved: false, loading: false });
              },
              (error: HttpErrorResponse) => {
                _snackBar.open('Načtení group sheetu se nezdařilo: ' + error.message, 'Zavřít', {
                  verticalPosition: 'top',
                  duration: 3000,
                });
                patchState(store, {
                  groupSheetSaved: false,
                  characterSheetError: 'GET: Načtení group sheetu se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const getNotesPageByUsername = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(username => {
          return _characterSheetApiService.getNotesPageByUsername(username).pipe(
            tapResponse(
              res => {
                patchState(store, { notesPage: res, characterSheetError: '', loading: false });
              },
              (error: HttpErrorResponse) => {
                _snackBar.open('Načtení poznámek se nezdařilo: ' + error.message, 'Zavřít', {
                  verticalPosition: 'top',
                  duration: 3000,
                });
                patchState(store, {
                  characterSheetError: 'GET: Načtení poznámek se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const getOtherHorsesPageByUsername = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(username => {
          return _characterSheetApiService.getOtherHorsesByUsername(username).pipe(
            tapResponse(
              res => {
                patchState(store, { otherHorsesPage: res, characterSheetError: '', loading: false });
              },
              (error: HttpErrorResponse) => {
                _snackBar.open('Načtení parťáků se nezdařilo: ' + error.message, 'Zavřít', {
                  verticalPosition: 'top',
                  duration: 3000,
                });
                patchState(store, {
                  characterSheetError: 'GET: Načtení parťáků se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    // ------------------------------------------

    const saveCharacterSheet = rxMethod<CharacterSheetApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.getCharacterSheetByUsername(req.username).pipe(
            tapResponse(
              res => {
                (res ? _updateCharacterSheet : _addCharacterSheet)(req);
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'SAVE: Ukládání character sheetu se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    const saveGroupSheet = rxMethod<GroupSheetApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.getGroupSheetByUsername(req.username).pipe(
            tapResponse(
              res => {
                (res ? _updateGroupSheet : _addGroupSheet)(req);
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  groupSheetSaved: false,
                  characterSheetError: 'SAVE: Ukládání group sheetu se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    const saveNotesPage = rxMethod<NotesPageApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.getNotesPageByUsername(req.username).pipe(
            tapResponse(
              res => {
                (res ? _updateNotesPage : _addNotesPage)(req);
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  groupSheetSaved: false,
                  characterSheetError: 'SAVE: Ukládání poznámek se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    const saveOtherHorsesPage = rxMethod<OtherHorsesPageApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.getOtherHorsesByUsername(req.username).pipe(
            tapResponse(
              res => {
                (res ? _updateOtherHorsesPage : _addOtherHorsesPage)(req);
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  groupSheetSaved: false,
                  characterSheetError: 'SAVE: Ukládání poznámek se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    const _addCharacterSheet = rxMethod<CharacterSheetApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.addCharacterSheet(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetSaved: true,
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'ADD: Ukládání character sheetu se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _updateCharacterSheet = rxMethod<CharacterSheetApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.updateCharacterSheet(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetSaved: true,
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'UPDATE: Ukládání character sheetu se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _addGroupSheet = rxMethod<GroupSheetApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.addGroupSheet(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  groupSheetSaved: true,
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  groupSheetSaved: false,
                  characterSheetError: 'ADD: Ukládání group sheetu se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _updateGroupSheet = rxMethod<GroupSheetApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.updateGroupSheet(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  groupSheetSaved: true,
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  groupSheetSaved: false,
                  characterSheetError: 'UPDATE: Ukládání group sheetu se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _addNotesPage = rxMethod<NotesPageApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.addNotesPage(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetError: 'ADD: Ukládání poznámek se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _updateNotesPage = rxMethod<NotesPageApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.updateNotesPage(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetError: 'UPDATE: Ukládání poznámek se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _addOtherHorsesPage = rxMethod<OtherHorsesPageApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.addOtherHorsesPage(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetError: 'ADD: Ukládání parťáků se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    const _updateOtherHorsesPage = rxMethod<OtherHorsesPageApiModel>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(req => {
          return _characterSheetApiService.updateOtherHorsesPage(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetError: '',
                  loading: false,
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetError: 'UPDATE: Ukládání parťáků se nezdařilo: ' + error.message,
                  loading: false,
                });
              },
            ),
          );
        }),
      ),
    );

    return {
      saveCharacterImage,
      getCharacterSheetByUsername,
      getGroupSheetByUsername,
      getNotesPageByUsername,
      getOtherHorsesPageByUsername,
      // -----------------------
      saveCharacterSheet,
      saveGroupSheet,
      saveNotesPage,
      saveOtherHorsesPage,
    };
  }),
  withHooks({}),
);
