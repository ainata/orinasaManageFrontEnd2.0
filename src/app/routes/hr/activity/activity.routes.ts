import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./activity-list/activity-list').then(m => m.ActivityList),
  },
] as Routes;
