import { Routes } from "@angular/router";

export const EMPLOYMENT_TYPES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/employment-types/view-emloyment-types-component/view-emloyment-types-component').then(x => x.ViewEmloymentTypesComponent),
        data: { breadcrumb: 'BREADCRUMB.TYPES_TABLE' }
      },
      {
        path: 'view',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/employment-types/create-employment-type-component/create-employment-type-component').then(x => x.CreateEmploymentTypeComponent),
        data: { breadcrumb: 'BREADCRUMB.ADD_TYPE' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./pages/employment-types/edit-employment-type-component/edit-employment-type-component').then(x => x.EditEmploymentTypeComponent),
        data: { breadcrumb: 'JOB_LEVEL.EDIT_TYPE' }
      },
      {
        path: 'preview/:id',
        loadComponent: () => import('./pages/employment-types/preview-employment-type-component/preview-employment-type-component').then(x => x.PreviewEmploymentTypeComponent),
        data: { breadcrumb: 'JOB_LEVEL.PREVIEW_TYPE' }
      }
    ]
  }
];
