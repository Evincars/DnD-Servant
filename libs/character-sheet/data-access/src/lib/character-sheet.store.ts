import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CharacterSheetApiModel } from '@dn-d-servant/character-sheet-util';
import { pipe, switchMap } from 'rxjs';
import { CharacterSheetApiService } from './character-sheet-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';

export const CharacterSheetStore = signalStore(
  withState({
    characterSheetStored: false,
    characterSheetError: '',
  }),
  withComputed(store => ({})),
  withMethods((store, _characterSheetApiService = inject(CharacterSheetApiService)) => {
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
                  characterSheetStored: false,
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
                  characterSheetStored: true,
                  characterSheetError: '',
                });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetStored: false,
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
                  characterSheetStored: true,
                  characterSheetError: '',
                });
              },
              (error: HttpErrorResponse) => {
                patchState(store, {
                  characterSheetStored: false,
                  characterSheetError: 'UPDATE: Ukládání character sheetu se nezdařilo: ' + error.message,
                });
              },
            ),
          );
        }),
      ),
    );

    return { saveCharacterSheet };
  }),
  withHooks({}),
);
