import { Routes } from '@angular/router';

export default [
  {
    path: 'company',
    loadComponent: () => import('./company/company').then(m => m.CompanyComponent),
  },
] as Routes;
