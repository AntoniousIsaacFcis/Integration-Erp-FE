import { Routes } from '@angular/router';

export const LEAVE_TYPES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        data: { breadcrumb: 'SETTINGS.LEAVE_TYPES_TABLE' },
        loadComponent: () =>
          import('./pages/leave-types/view-leave-types-component/view-leave-types-component').then(
            (x) => x.ViewLeaveTypesComponent,
          ),
      },
      {
        path: 'view',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'create',
        data: { breadcrumb: 'SETTINGS.ADD_LEAVE_TYPE' },
        loadComponent: () =>
          import('./pages/leave-types/create-leave-type-component/create-leave-type-component').then(
            (x) => x.CreateLeaveTypeComponent,
          ),
      },
      {
        path: 'edit/:id',
        data: { breadcrumb: 'SETTINGS.EDIT_LEAVE_TYPE' },
        loadComponent: () =>
          import('./pages/leave-types/edit-leave-type-component/edit-leave-type-component').then(
            (x) => x.EditLeaveTypeComponent,
          ),
      },
      {
        path: 'preview/:id',
        data: { breadcrumb: 'SETTINGS.PREVIEW_LEAVE_TYPE' },
        loadComponent: () =>
          import('./pages/leave-types/preview-leave-type-component/preview-leave-type-component').then(
            (x) => x.PreviewLeaveTypeComponent,
          ),
      },
    ],
  },
];
