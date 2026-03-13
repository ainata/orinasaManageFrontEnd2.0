import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./employees-list/employees-list').then(m => m.EmployeesList),
  },
  {
    path: 'add',
    loadComponent: () => import('./employees-add/employees-add').then(m => m.EmployeesAdd),
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./employees-details/employees-details').then(m => m.EmployeesDetails),
  },
] as Routes;
