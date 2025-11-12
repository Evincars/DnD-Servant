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
  withMethods(store => {
    // const addCharacterSheet = rxMethod<CharacterSheetApiModel>(
    //   pipe(
    //     switchMap(req => {
    //       return _characterSheetApiService.saveCharacterSheet(req).pipe(
    //         tapResponse(
    //           (_: any) => {
    //             patchState(store, {
    //               characterSheetStored: true,
    //               characterSheetError: '',
    //             });
    //           },
    //           (error: HttpErrorResponse) => {
    //             patchState(store, {
    //               characterSheetStored: false,
    //               characterSheetError: 'Ukládání character sheetu se nezdařilo: ' + error.message,
    //             });
    //           },
    //         ),
    //       );
    //     }),
    //   ),
    // );
    return {};
  }),
  withHooks({}),
);
