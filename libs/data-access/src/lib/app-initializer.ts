import { provideAppInitializer } from '@angular/core';
import { Observable, of } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { GoogleAuthProvider } from 'firebase/auth';
import { getAuth, signInWithRedirect } from 'firebase/auth';

function initializeCustomApp(): () => Observable<number> {
  // Initialize Firebase
  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);

  // Authentication
  // const provider = new GoogleAuthProvider();
  // const auth = getAuth();
  // signInWithRedirect(auth, provider);

  return (): Observable<number> => {
    return of(0);
  };
}

export const appInitializer = provideAppInitializer(() => {
  const initializerFn = initializeCustomApp();
  return initializerFn();
});
