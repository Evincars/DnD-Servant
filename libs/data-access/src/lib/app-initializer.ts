import { provideAppInitializer } from '@angular/core';
import { Observable, of } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

function initializeCustomApp(): () => Observable<number> {
  const firebaseConfig = {
    apiKey: 'AIzaSyBP2KgMhqhfppDZHju6osE6gwtiq1WXFLo',
    authDomain: 'dnd-servant.firebaseapp.com',
    projectId: 'dnd-servant',
    storageBucket: 'dnd-servant.firebasestorage.app',
    messagingSenderId: '960571423054',
    appId: '1:960571423054:web:c9e666475047660a0cc61f',
    measurementId: 'G-WWQG229N8D',
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  return (): Observable<number> => {
    return of(0);
  };
}

export const appInitializer = provideAppInitializer(() => {
  const initializerFn = initializeCustomApp();
  return initializerFn();
});
