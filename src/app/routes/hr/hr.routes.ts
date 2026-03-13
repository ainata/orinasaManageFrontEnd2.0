import { Routes } from '@angular/router';

export default [
  {
    path: 'departments',
    loadChildren: () => import('./department/department.routes'),
  },
  {
    path: 'position',
    loadChildren: () => import('./position/position.routes'),
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.routes'),
  },
  {
    path: 'employee',
    loadChildren: () => import('./employees/employee.routes'),
  },
] as Routes;
