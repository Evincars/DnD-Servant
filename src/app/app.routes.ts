import { Route } from '@angular/router';

export const routes = {
  characterSheet: 'character-sheet',
  dmScreen: 'dm-screen',
  dndDatabase: 'dnd-database',
  helpAndTips: 'help-and-tips',
  login: 'login',
  register: 'register',
};

export const appRoutes: Array<Route> = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: routes.characterSheet,
  },
  {
    path: routes.login,
    loadComponent: () => import('@dn-d-servant/authentication-feature').then(c => c.LoginComponent),
  },
  {
    path: routes.register,
    loadComponent: () => import('@dn-d-servant/authentication-feature').then(c => c.RegisterComponent),
  },
  {
    path: routes.characterSheet,
    loadComponent: () => import('@dn-d-servant/character-sheet-feature').then(c => c.CharacterSheetTabsComponent),
  },
  {
    path: routes.dmScreen,
    loadComponent: () => import('@dn-d-servant/dm-screen-feature').then(c => c.DmScreenComponent),
  },
  {
    path: routes.dndDatabase,
    loadComponent: () => import('@dn-d-servant/dnd-rules-database-feature').then(c => c.DndDatabaseSearchComponent),
  },
  {
    path: routes.helpAndTips,
    loadComponent: () => import('@dn-d-servant/help-and-tips-feature').then(c => c.HelpAndTipsComponent),
  },
];
