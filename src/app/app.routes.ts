import { Route } from '@angular/router';

export const routes = {
  characterSheet: 'character-sheet',
};

export const appRoutes: Array<Route> = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: routes.characterSheet,
  },
  {
    path: routes.characterSheet,
    loadComponent: () => import('@dn-d-servant/character-sheet-feature').then(c => c.CharacterSheetComponent),
  },
];
