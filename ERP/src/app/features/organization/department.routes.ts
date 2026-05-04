import { Routes } from "@angular/router";

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'ORGANIZATION.MANAGE_DEPARTMENTS' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'view',
      },
      {
        path: 'view',
        data: { breadcrumb: 'MENU.DEPARTMENTS' }
        ,
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/departments/view-departments-component/view-departments-component').then(x => x.ViewDepartmentsComponent),
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
          },
        ],
      },
      {
        path: 'create',
        redirectTo: 'view/create',
      },
      {
        path: 'edit/:id',
        redirectTo: 'view/edit/:id',
      },
      {
        path: 'preview/:id',
        redirectTo: 'view/preview/:id',
      }
    ]
  }
];
