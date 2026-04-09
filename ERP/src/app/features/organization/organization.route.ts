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
        loadComponent: () =>
          import('./pages/manage-department/departments-component/departments-component')
            .then(x => x.DepartmentsComponent),
        data: { breadcrumb: 'MENU.DEPARTMENTS' },
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
