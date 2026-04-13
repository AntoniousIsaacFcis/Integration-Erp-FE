import { Routes } from "@angular/router";

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.DEPARTMENTS' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'view',
      },
      {
        path: 'view',
        loadComponent: () => import('./pages/departments/view-departments-component/view-departments-component').then(x => x.ViewDepartmentsComponent),
        data: { breadcrumb: 'MENU.DEPARTMENTS' }
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/departments/create-department-component/create-department-component').then(x => x.CreateDepartmentComponent),
        data: { breadcrumb: 'ORGANIZATION.ADD_DEPARTMENT' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./pages/departments/edit-department-component/edit-department-component').then(x => x.EditDepartmentComponent),
        data: { breadcrumb: 'ORGANIZATION.EDIT_DEPARTMENT' }
      },
      {
        path: 'preview/:id',
        loadComponent: () => import('./pages/departments/preview-department-component/preview-department-component').then(x => x.PreviewDepartmentComponent),
        data: { breadcrumb: 'ORGANIZATION.PREVIEW_DEPARTMENT' }
      }
    ]
  }
];
