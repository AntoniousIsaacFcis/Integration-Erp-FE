import { Routes } from '@angular/router';

export const EMPLOYMENT_STATUSES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        data: { breadcrumb: 'EMPLOYMENT_STATUS.TABLE_TITLE' },
        loadComponent: () =>
          import('./pages/employment-statuses/view-status-component/view-status-component').then(
            (x) => x.ViewStatusComponent,
          ),
      },
      {
        path: 'view',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/employment-statuses/create-status-component/create-status-component').then(
            (x) => x.CreateStatusComponent,
          ),
        data: { breadcrumb: 'EMPLOYMENT_STATUS.ADD' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./pages/employment-statuses/edit-status-component/edit-status-component').then(
            (x) => x.EditStatusComponent,
          ),
        data: { breadcrumb: 'EMPLOYMENT_STATUS.EDIT' },
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import('./pages/employment-statuses/preview-status-component/preview-status-component').then(
            (x) => x.PreviewStatusComponent,
          ),
        data: { breadcrumb: 'EMPLOYMENT_STATUS.PREVIEW' },
      },
    ],
  },
];
