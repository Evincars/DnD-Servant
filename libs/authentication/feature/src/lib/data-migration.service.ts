import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';

/**
 * Describes a single Firestore collection + document-key suffix pair that
 * should be included in a data migration.
 *
 *  Document key = `{username}{suffix}`
 *  e.g. character sheet  → `character-sheets/{username}`
 *       group sheet      → `character-sheets/{username}_group`
 *       notes page       → `character-sheets/{username}_notes`
 */
const MIGRATED_COLLECTIONS: ReadonlyArray<{ path: string; suffix: string }> = [
  { path: 'character-sheets', suffix: '' },
  { path: 'character-sheets', suffix: '_group' },
  { path: 'character-sheets', suffix: '_notes' },
  { path: 'quests', suffix: '' },
  { path: 'item-vault', suffix: '' },
  { path: 'dm-quests', suffix: '' },
  { path: 'dm-notes', suffix: '' },
  { path: 'dm-story-timeline', suffix: '' },
];

export interface MigrationSummary {
  /** How many collections were checked. */
  total: number;
  /** How many documents were successfully copied to the new username. */
  migrated: number;
  /** How many were skipped (old doc missing OR new doc already exists). */
  skipped: number;
}

@Injectable({ providedIn: 'root' })
export class DataMigrationService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  /**
   * Copies every known Firestore document from `oldUsername` to `newUsername`,
   * replacing the embedded `username` field with the new key.
   *
   * Rules:
   * - If the source document does NOT exist → skip silently.
   * - If the target document ALREADY exists → skip (do not overwrite).
   * - Both reads and writes are executed in parallel for each collection.
   *
   * @returns An observable that emits a summary and completes.
   */
  migrateAllData(oldUsername: string, newUsername: string): Observable<MigrationSummary> {
    if (oldUsername === newUsername) {
      return of({ total: 0, migrated: 0, skipped: 0 });
    }

    const tasks = MIGRATED_COLLECTIONS.map(col => {
      const oldKey = `${oldUsername}${col.suffix}`;
      const newKey = `${newUsername}${col.suffix}`;
      return this.migrateDocument(col.path, oldKey, newKey);
    });

    return forkJoin(tasks).pipe(
      map(results => ({
        total: results.length,
        migrated: results.filter(r => r).length,
        skipped: results.filter(r => !r).length,
      })),
    );
  }

  /**
   * Reads `{collection}/{oldKey}`.
   * If it exists AND `{collection}/{newKey}` does NOT yet exist, writes it there
   * with the `username` field updated to `newKey`.
   *
   * @returns `true` if the document was migrated, `false` if skipped.
   */
  private migrateDocument(collection: string, oldKey: string, newKey: string): Observable<boolean> {
    // 1. Read the source document.
    return from(
      runInInjectionContext(this.injector, () =>
        getDoc(doc(this.firestore, `${collection}/${oldKey}`)),
      ),
    ).pipe(
      switchMap(oldSnap => {
        if (!oldSnap.exists()) return of(false); // nothing to migrate

        const data = { ...oldSnap.data(), username: newKey }; // update the username field

        // 2. Check whether the target document already exists.
        return from(
          runInInjectionContext(this.injector, () =>
            getDoc(doc(this.firestore, `${collection}/${newKey}`)),
          ),
        ).pipe(
          switchMap(newSnap => {
            if (newSnap.exists()) return of(false); // don't overwrite existing data

            // 3. Write the migrated document.
            return from(
              runInInjectionContext(this.injector, () =>
                setDoc(doc(this.firestore, `${collection}/${newKey}`), data),
              ),
            ).pipe(map(() => true));
          }),
        );
      }),
    );
  }
}


