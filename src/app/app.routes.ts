import { Route } from '@angular/router';

export const routes = {
  characterSheet: 'character-sheet',
  dmScreen: 'dm-screen',
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
  {
    path: routes.dmScreen,
    loadComponent: () => import('@dn-d-servant/dm-screen-feature').then(c => c.DmScreenComponent),
  },
];
