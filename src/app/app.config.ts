import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { MAT_ICON_DEFAULT_OPTIONS, MatIconDefaultOptions } from '@angular/material/icon';
import { appInitializer } from '@dn-d-servant/data-access';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { REALTIME_DB_URL_TOKEN } from '@dn-d-servant/util';

const firebaseConfig = {
  apiKey: 'AIzaSyBP2KgMhqhfppDZHju6osE6gwtiq1WXFLo',
  authDomain: 'dnd-servant.firebaseapp.com',
  projectId: 'dnd-servant',
  storageBucket: 'dnd-servant.firebasestorage.app',
  messagingSenderId: '960571423054',
  appId: '1:960571423054:web:c9e666475047660a0cc61f',
  measurementId: 'G-WWQG229N8D',
};

export const appConfig: ApplicationConfig = {
  providers: [
    appInitializer,
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: { fontSet: 'material-symbols-outlined' } satisfies MatIconDefaultOptions,
    },
    {
      provide: REALTIME_DB_URL_TOKEN,
      useValue: 'https://dnd-servant-default-rtdb.europe-west1.firebasedatabase.app/',
    },
  ],
};
