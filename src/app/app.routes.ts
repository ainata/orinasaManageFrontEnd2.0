import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { AuthLayout } from '@theme/auth-layout/auth-layout';
import { Dashboard } from './routes/dashboard/dashboard';
import { Login } from './routes/sessions/login/login';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      {
        path: 'design',
        loadChildren: () => import('./routes/design/design.routes').then(m => m.routes),
      },
      {
        path: 'hr',
        loadChildren: () => import('./routes/hr/hr.routes'),
      },
      {
        path: 'settings',
        loadChildren: () => import('./routes/settings/settings.routes'),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [{ path: 'login', component: Login }],
  },
  { path: '**', redirectTo: 'dashboard' },
];
