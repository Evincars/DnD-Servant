import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  AuthCredential,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from './user';

/**
 * Normalises a raw display name into a safe, camelCase, ASCII-only username
 * suitable for use as a Firestore document key and as a display name.
 *
 * Steps:
 *  1. NFD decompose → strip combining diacritic marks   ("Lasák" → "Lasak")
 *  2. Remove every character that is NOT a letter, digit, or space
 *     ("O'Brien" → "OBrien", "Mary-Jane" → "MaryJane", "J. Smith" → "J Smith")
 *  3. Collapse multiple spaces, trim ends
 *  4. camelCase: capitalise the first letter of each subsequent word
 *  5. Remove all remaining spaces
 *
 * Examples:
 *   "Adam Lasák"   → "AdamLasak"
 *   "O'Brien John" → "OBrienJohn"
 *   "Mary-Jane"    → "MaryJane"
 *   "J. Smith"     → "JSmith"
 *   "johnsmith"    → "johnsmith"   ← single-word names are left as-is
 *   "AdamLasak"    → "AdamLasak"   ← already normalised, unchanged
 */
export function normalizeUsername(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')       // 1. strip diacritics
    .replace(/[^a-zA-Z0-9 ]/g, '')         // 2. strip non-alphanumeric (keep spaces)
    .replace(/\s+/g, ' ')                  // 3. collapse spaces
    .trim()
    .replace(/\s+(.)/g, (_, c: string) => c.toUpperCase()) // 4. camelCase after space
    .replace(/\s+/g, '');                  // 5. remove any leftover spaces
}

/**
 * Thrown by `loginWithGoogle()` when the Google email already belongs to an
 * existing email/password account. The caller can catch this, show the user a
 * password prompt, and then call `linkGoogleAccount()` to merge the accounts.
 */
export class GoogleAccountConflictError extends Error {
  constructor(
    public readonly email: string,
    public readonly googleCredential: AuthCredential,
  ) {
    super('auth/account-exists-with-different-credential');
    this.name = 'GoogleAccountConflictError';
  }
}

/** Result returned by `linkGoogleAccount()` after a successful account merge. */
export interface AccountLinkResult {
  /** The old displayName the account had before the Google link (data is stored under this key). */
  oldUsername: string;
  /** The new normalised Google display name (data will be migrated to this key). */
  newUsername: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUser = signal<User | null | undefined>(undefined);

  register(email: string, username: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(response =>
      updateProfile(response.user, { displayName: username }),
    );
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {});
    return from(promise);
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider)
      .then(result => {
        const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'User';
        const normalizedName = normalizeUsername(displayName);
        return updateProfile(result.user, { displayName: normalizedName });
      })
      .catch(error => {
        if (error.code === 'auth/account-exists-with-different-credential') {
          const email = (error.customData?.email ?? '') as string;
          const credential = GoogleAuthProvider.credentialFromError(error);
          if (email && credential) {
            throw new GoogleAccountConflictError(email, credential);
          }
        }
        throw error;
      });
    return from(promise);
  }

  /**
   * Resolves a Google account conflict:
   * 1. Signs in with the existing email/password account (preserving the old username).
   * 2. Links the pending Google credential so both providers work in future.
   * 3. Normalises the Google display name and updates the Firebase Auth profile.
   * 4. Returns `{ oldUsername, newUsername }` so the caller can migrate Firestore data.
   *
   * If `oldUsername === newUsername` after normalisation, no data migration is required.
   */
  linkGoogleAccount(
    email: string,
    password: string,
    googleCredential: AuthCredential,
  ): Observable<AccountLinkResult> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(async result => {
      const oldUsername = result.user.displayName ?? email.split('@')[0];

      // Link the Google credential — this enables future Google sign-ins for this account.
      const linked = await linkWithCredential(result.user, googleCredential);

      // Retrieve the Google display name from the newly linked provider data.
      const googleProviderData = linked.user.providerData.find(p => p.providerId === 'google.com');
      const googleDisplayName = googleProviderData?.displayName || oldUsername;
      const newUsername = normalizeUsername(googleDisplayName);

      // Update Firebase Auth profile to the Google-derived username.
      await updateProfile(linked.user, { displayName: newUsername });

      return { oldUsername, newUsername } satisfies AccountLinkResult;
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
