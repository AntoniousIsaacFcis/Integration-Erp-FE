import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.ORGANIZATION' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'departments',
      },
      {
        path: 'departments',
        loadChildren: () => import('./department.routes').then(m => m.DEPARTMENT_ROUTES),
      },
      {
        path: 'designations',
        loadChildren: () => import('./designation.routes').then(m => m.DESIGNATION_ROUTES),
      },
      {
        path: 'levels',
        loadChildren: () => import('./job-level.routes').then(m => m.JOB_LEVEL_ROUTES),
      },
      {
        path: 'employment-types',
        loadChildren: () =>
          import('./employment-types.routes').then(m => m.EMPLOYMENT_TYPES_ROUTES),
      },
    ],
  },
];
