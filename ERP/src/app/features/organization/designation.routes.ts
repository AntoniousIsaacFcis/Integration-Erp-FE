import { Routes } from '@angular/router';

export const DESIGNATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/designations/view-designations-component/view-designations-component').then(
            (x) => x.ViewDesignationsComponent,
          ),
        data: { breadcrumb: 'BREADCRUMB.DESIGNATIONS' },
      },
      {
        path: 'view',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/designations/create-designation-component/create-designation-component').then(
            (x) => x.CreateDesignationComponent,
          ),
        data: { breadcrumb: 'ORGANIZATION.ADD_DESIGNATION' },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./pages/designations/edit-designation-component/edit-designation-component').then(
            (x) => x.EditDesignationComponent,
          ),
        data: { breadcrumb: 'ORGANIZATION.EDIT_DESIGNATION' },
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import(
            './pages/designations/preview-designation-component/preview-designation-component'
          ).then((x) => x.PreviewDesignationComponent),
        data: { breadcrumb: 'ORGANIZATION.PREVIEW_DESIGNATION' },
      },
    ],
  },
];
