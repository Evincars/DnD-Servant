import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from './user';

/**
 * Normalizes username by removing spaces and diacritics.
 * Example: "Adam Lasák" → "AdamLasak"
 */
function normalizeUsername(name: string): string {
  return name
    .replace(/\s+/g, '') // Remove all spaces
    .normalize('NFD') // Decompose diacritics
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritic marks
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
    const promise = signInWithPopup(this.firebaseAuth, provider).then((result) => {
      // Normalize the username: remove spaces and diacritics
      const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'User';
      const normalizedName = normalizeUsername(displayName);
      // Update the profile with normalized username
      return updateProfile(result.user, { displayName: normalizedName });
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
