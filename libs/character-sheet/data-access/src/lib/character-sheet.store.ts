import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  CharacterSheetApiModel,
  GroupSheetApiModel,
  ItemVaultApiModel,
  NotesPageApiModel,
  QuestsApiModel,
} from '@dn-d-servant/character-sheet-util';
import { pipe, switchMap, tap } from 'rxjs';
import { CharacterSheetApiService } from './character-sheet-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalStorageService } from '@dn-d-servant/util';

/** Keys for last-successfully-saved DB snapshots */
export const DB_BACKUP_KEY_CHARACTER = 'db-backup-character-sheet';
export const DB_BACKUP_KEY_GROUP = 'db-backup-group-sheet';
export const DB_BACKUP_KEY_NOTES = 'db-backup-notes-page';

/** Keys for 30-second auto-draft (form state that may not yet be saved to DB) */
export const DB_DRAFT_KEY_CHARACTER = 'db-draft-character-sheet';
export const DB_DRAFT_KEY_GROUP = 'db-draft-group-sheet';
export const DB_DRAFT_KEY_NOTES = 'db-draft-notes-page';

export const CharacterSheetStore = signalStore(
  { providedIn: 'root' },
  withState({
    characterSheet: undefined as CharacterSheetApiModel | undefined,
    groupSheet: undefined as GroupSheetApiModel | undefined,
    notesPage: undefined as NotesPageApiModel | undefined,
    itemVault: undefined as ItemVaultApiModel | undefined,
    quests: undefined as QuestsApiModel | undefined,
    characterSheetSaved: false,
    groupSheetSaved: false,
    characterSheetError: '',
    loading: false,
    characterImage: null as string | null,
  }),
  withComputed(store => ({})),
  withMethods(
    (
      store,
      _characterSheetApiService = inject(CharacterSheetApiService),
      _snackBar = inject(MatSnackBar),
      _localStorage = inject(LocalStorageService),
    ) => {
      const saveCharacterImage = function (formDate: string) {
        patchState(store, { characterImage: formDate });
      };

      const patchLoading = function (value: boolean) {
        patchState(store, { loading: value });
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

      // ------------------------------------------

      const saveCharacterSheet = rxMethod<CharacterSheetApiModel>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(req => {
            // Use the API service directly — do NOT call getCharacterSheetByUsername()
            // because that method updates store.characterSheet, which triggers the
            // fetchedCharacterSheet effect and re-patches the whole form (causing refresh).
            return _characterSheetApiService.getCharacterSheetByUsername(req.username).pipe(
              switchMap(res =>
                res ? _characterSheetApiService.updateCharacterSheet(req) : _characterSheetApiService.addCharacterSheet(req),
              ),
              tapResponse(
                (_: any) => {
                  patchState(store, { characterSheetSaved: true, characterSheetError: '', loading: false });
                  _localStorage.setDataSync(DB_BACKUP_KEY_CHARACTER, req);
                  _snackBar.open('⚔️ Karta postavy uložena do trezoru!', '✕', {
                    verticalPosition: 'top',
                    duration: 2300,
                    panelClass: ['snackbar--save'],
                  });
                },
                (error: HttpErrorResponse) => {
                  patchState(store, {
                    characterSheetSaved: false,
                    characterSheetError: 'SAVE: Ukládání character sheetu se nezdařilo: ' + error.message,
                    loading: false,
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
              switchMap(res =>
                res ? _characterSheetApiService.updateGroupSheet(req) : _characterSheetApiService.addGroupSheet(req),
              ),
              tapResponse(
                (_: any) => {
                  patchState(store, { groupSheetSaved: true, characterSheetError: '', loading: false });
                  _localStorage.setDataSync(DB_BACKUP_KEY_GROUP, req);
                  _snackBar.open('🛡️ Karta družiny uložena do trezoru!', '✕', {
                    verticalPosition: 'top',
                    duration: 2300,
                    panelClass: ['snackbar--save'],
                  });
                },
                (error: HttpErrorResponse) => {
                  patchState(store, {
                    groupSheetSaved: false,
                    characterSheetError: 'SAVE: Ukládání group sheetu se nezdařilo: ' + error.message,
                    loading: false,
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
              switchMap(res =>
                res ? _characterSheetApiService.updateNotesPage(req) : _characterSheetApiService.addNotesPage(req),
              ),
              tapResponse(
                (_: any) => {
                  patchState(store, { characterSheetError: '', loading: false });
                  _localStorage.setDataSync(DB_BACKUP_KEY_NOTES, req);
                  _snackBar.open('📜 Poznámky zapsány do svitku!', '✕', {
                    verticalPosition: 'top',
                    duration: 2300,
                    panelClass: ['snackbar--save'],
                  });
                },
                (error: HttpErrorResponse) => {
                  patchState(store, {
                    characterSheetError: 'SAVE: Ukládání poznámek se nezdařilo: ' + error.message,
                    loading: false,
                  });
                },
              ),
            );
          }),
        ),
      );

      const getItemVault = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(username => {
            return _characterSheetApiService.getItemVaultByUsername(username).pipe(
              tapResponse(
                res => {
                  patchState(store, { itemVault: res, loading: false });
                },
                (error: HttpErrorResponse) => {
                  _snackBar.open('Načtení předmětů se nezdařilo: ' + error.message, 'Zavřít', {
                    verticalPosition: 'top',
                    duration: 3000,
                  });
                  patchState(store, { loading: false });
                },
              ),
            );
          }),
        ),
      );

      const saveItemVault = rxMethod<ItemVaultApiModel>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(req => {
            return _characterSheetApiService.saveItemVault(req).pipe(
              tapResponse(
                () => {
                  patchState(store, { itemVault: req, loading: false });
                  _snackBar.open('💰 Předměty uloženy do truhly!', '✕', {
                    verticalPosition: 'top',
                    duration: 2300,
                    panelClass: ['snackbar--save'],
                  });
                },
                (error: HttpErrorResponse) => {
                  _snackBar.open('Ukládání předmětů se nezdařilo: ' + error.message, 'Zavřít', {
                    verticalPosition: 'top',
                    duration: 3000,
                  });
                  patchState(store, { loading: false });
                },
              ),
            );
          }),
        ),
      );

      const getQuests = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(username => {
            return _characterSheetApiService.getQuestsByUsername(username).pipe(
              tapResponse(
                res => {
                  patchState(store, { quests: res, loading: false });
                },
                (error: HttpErrorResponse) => {
                  _snackBar.open('Načtení questů se nezdařilo: ' + error.message, 'Zavřít', {
                    verticalPosition: 'top',
                    duration: 3000,
                  });
                  patchState(store, { loading: false });
                },
              ),
            );
          }),
        ),
      );

      const saveQuests = rxMethod<QuestsApiModel>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(req => {
            return _characterSheetApiService.saveQuests(req).pipe(
              tapResponse(
                () => {
                  patchState(store, { quests: req, loading: false });
                  _snackBar.open('📜 Questy zapsány do deníku!', '✕', {
                    verticalPosition: 'top',
                    duration: 2300,
                    panelClass: ['snackbar--save'],
                  });
                },
                (error: HttpErrorResponse) => {
                  _snackBar.open('Ukládání questů se nezdařilo: ' + error.message, 'Zavřít', {
                    verticalPosition: 'top',
                    duration: 3000,
                  });
                  patchState(store, { loading: false });
                },
              ),
            );
          }),
        ),
      );

      /**
       * Called every 30 s from each sheet component to persist the current
       * in-memory model to localStorage without triggering a DB write.
       */
      const saveDraftToLocalStorage = function (
        data:
          | { type: 'character'; model: CharacterSheetApiModel }
          | { type: 'group'; model: GroupSheetApiModel }
          | { type: 'notes'; model: NotesPageApiModel },
      ): void {
        if (data.type === 'character') _localStorage.setDataSync(DB_DRAFT_KEY_CHARACTER, data.model);
        if (data.type === 'group') _localStorage.setDataSync(DB_DRAFT_KEY_GROUP, data.model);
        if (data.type === 'notes') _localStorage.setDataSync(DB_DRAFT_KEY_NOTES, data.model);
      };

      /**
       * Called once after the user logs in.
       * If draft keys exist in localStorage they are pushed to DB immediately,
       * then the draft keys are removed.
       */
      const restoreDraftsToDb = function (): void {
        const character = _localStorage.getDataSync<CharacterSheetApiModel>(DB_DRAFT_KEY_CHARACTER);
        const group = _localStorage.getDataSync<GroupSheetApiModel>(DB_DRAFT_KEY_GROUP);
        const notes = _localStorage.getDataSync<NotesPageApiModel>(DB_DRAFT_KEY_NOTES);

        if (character) {
          saveCharacterSheet(character);
          _localStorage.setDataSync(DB_DRAFT_KEY_CHARACTER, null);
        }
        if (group) {
          saveGroupSheet(group);
          _localStorage.setDataSync(DB_DRAFT_KEY_GROUP, null);
        }
        if (notes) {
          saveNotesPage(notes);
          _localStorage.setDataSync(DB_DRAFT_KEY_NOTES, null);
        }
      };

      return {
        patchLoading,
        saveCharacterImage,
        getCharacterSheetByUsername,
        getGroupSheetByUsername,
        getNotesPageByUsername,
        getItemVault,
        saveDraftToLocalStorage,
        restoreDraftsToDb,
        // -----------------------
        saveCharacterSheet,
        saveGroupSheet,
        saveNotesPage,
        saveItemVault,
        getQuests,
        saveQuests,
      };
    },
  ),
  withHooks({}),
);
