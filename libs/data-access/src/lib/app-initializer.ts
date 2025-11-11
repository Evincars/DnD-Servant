import { provideAppInitializer } from '@angular/core';
import { Observable, of } from 'rxjs';

function initializeApp(): () => Observable<number> {
  return (): Observable<number> => {
    return of(0);
  };
}

export const appInitializer = provideAppInitializer(() => {
  const initializerFn = initializeApp();
  return initializerFn();
});
