import { Routes } from '@angular/router';

export default [
  {
    path: 'company/:id',
    loadComponent: () =>
      import('./company/company-details/company-details').then(m => m.CompanyDetailsComponent),
  },
  {
    path: 'company',
    loadComponent: () => import('./company/company').then(m => m.CompanyComponent),
  },
  {
    path: 'roles',
    loadComponent: () => import('./role/role').then(m => m.RoleComponent),
  },
] as Routes;
