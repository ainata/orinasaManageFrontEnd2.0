import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./position-list/position-list').then(m => m.PositionList),
  },
] as Routes;
