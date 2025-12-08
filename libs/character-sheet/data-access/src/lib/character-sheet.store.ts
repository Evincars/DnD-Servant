import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CharacterSheetApiModel } from '@dn-d-servant/character-sheet-util';
import { pipe, switchMap } from 'rxjs';
import { CharacterSheetApiService } from './character-sheet-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const CharacterSheetStore = signalStore(
  withState({
    characterSheet: undefined as CharacterSheetApiModel | undefined,
    characterSheetSaved: false,
    characterSheetError: '',
  }),
  withComputed(store => ({})),
  withMethods((store, _characterSheetApiService = inject(CharacterSheetApiService), _snackBar = inject(MatSnackBar)) => {
    const getCharacterSheetByUsername = rxMethod<string>(
      pipe(
        switchMap(username => {
          return _characterSheetApiService.getCharacterSheetByUsername(username).pipe(
            tapResponse(
              res => {
                patchState(store, { characterSheet: res, characterSheetError: '', characterSheetSaved: false });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'GET: Načtení character sheetu se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    const saveCharacterSheet = rxMethod<CharacterSheetApiModel>(
      pipe(
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

    const _addCharacterSheet = rxMethod<CharacterSheetApiModel>(
      pipe(
        switchMap(req => {
          return _characterSheetApiService.addCharacterSheet(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetSaved: true,
                  characterSheetError: '',
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'ADD: Ukládání character sheetu se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    const _updateCharacterSheet = rxMethod<CharacterSheetApiModel>(
      pipe(
        switchMap(req => {
          return _characterSheetApiService.updateCharacterSheet(req).pipe(
            tapResponse(
              (_: any) => {
                patchState(store, {
                  characterSheetSaved: true,
                  characterSheetError: '',
                });
                _snackBar.open('Uložení bylo úspěšné.', 'Zavřít', { verticalPosition: 'top', duration: 2300 });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetSaved: false,
                  characterSheetError: 'UPDATE: Ukládání character sheetu se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    return { getCharacterSheetByUsername, saveCharacterSheet };
  }),
  withHooks({}),
);
