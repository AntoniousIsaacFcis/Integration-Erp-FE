import { Routes } from '@angular/router';

export const CORE_HR_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.CORE_HR' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'employees',
      },
      {
        path: 'employees',
        loadChildren: () => import('./employees.route').then(m => m.EMPLOYEE_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles.routes').then(m => m.ROLES_ROUTES),
      },
    ],
  },
];
