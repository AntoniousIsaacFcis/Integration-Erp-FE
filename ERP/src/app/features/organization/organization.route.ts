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
        data: { breadcrumb: 'ORGANIZATION.MANAGE_DEPARTMENTS' },
        loadChildren: () => import('./department.routes').then(m => m.DEPARTMENT_ROUTES),
      },
      {
        path: 'designations',
        data: { breadcrumb: 'ORGANIZATION.MANAGE_DESIGNATIONS' },
        loadChildren: () => import('./designation.routes').then(m => m.DESIGNATION_ROUTES),
      },
      {
        path: 'levels',
        data: { breadcrumb: 'ORGANIZATION.MANAGE_JOB_LEVELS' },
        loadChildren: () => import('./job-level.routes').then(m => m.JOB_LEVEL_ROUTES),
      },
      {
        path: 'employment-types',
        data: { breadcrumb: 'ORGANIZATION.MANAGE_EMPLOYMENT_TYPES' },
        loadChildren: () =>
          import('./employment-types.routes').then(m => m.EMPLOYMENT_TYPES_ROUTES),
      },
    ],
  },
];
