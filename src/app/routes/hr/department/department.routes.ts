import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./department-list/department-list').then(m => m.DepartmentList),
  },
] as Routes;
