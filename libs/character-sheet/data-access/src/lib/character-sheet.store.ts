import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {CharacterSheetApiModel, GroupSheetApiModel } from '@dn-d-servant/character-sheet-util';
import {pipe, switchMap, tap} from 'rxjs';
import { CharacterSheetApiService } from './character-sheet-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const CharacterSheetStore = signalStore(
  withState({
    characterSheet: undefined as CharacterSheetApiModel | undefined,
    groupSheet: undefined as GroupSheetApiModel | undefined,
    characterSheetSaved: false,
    characterSheetError: '',
    loading: false,
  }),
  withComputed(store => ({})),
  withMethods((store, _characterSheetApiService = inject(CharacterSheetApiService), _snackBar = inject(MatSnackBar)) => {
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
                patchState(store, { groupSheet: res, characterSheetError: '', characterSheetSaved: false, loading: false });
              },
              (error: HttpErrorResponse) => {
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
                  characterSheetSaved: false,
                  characterSheetError: 'SAVE: Ukládání group sheetu se nezdařilo: ' + error.message,
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
                  loading: false
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'ADD: Ukládání character sheetu se nezdařilo: ' + error.message,
                  loading: false
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
                  loading: false
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'UPDATE: Ukládání character sheetu se nezdařilo: ' + error.message,
                  loading: false
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
                  characterSheetSaved: true,
                  characterSheetError: '',
                  loading: false
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'ADD: Ukládání group sheetu se nezdařilo: ' + error.message,
                  loading: false
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
                  characterSheetSaved: true,
                  characterSheetError: '',
                  loading: false
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'UPDATE: Ukládání group sheetu se nezdařilo: ' + error.message,
                  loading: false
                });
              },
            ),
          );
        }),
      ),
    );

    return { getCharacterSheetByUsername, getGroupSheetByUsername, saveCharacterSheet, saveGroupSheet };
  }),
  withHooks({}),
);
