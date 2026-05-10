import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/guards/permission-guard';

export const HOLIDAY_LISTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('Attendance.HolidayLists')],
    children: [
      {
        path: '',
        data: { breadcrumb: 'SETTINGS.HOLIDAY_LISTS_TABLE' },
        loadComponent: () =>
          import('./pages/holiday-lists/view-holiday-lists-component/view-holiday-lists-component').then(
            (x) => x.ViewHolidayListsComponent,
          ),
      },
      {
        path: 'view',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'create',
        data: { breadcrumb: 'SETTINGS.ADD_HOLIDAY_LIST' },
        loadComponent: () =>
          import('./pages/holiday-lists/create-holiday-list-component/create-holiday-list-component').then(
            (x) => x.CreateHolidayListComponent,
          ),
      },
      {
        path: 'edit/:id',
        data: { breadcrumb: 'SETTINGS.EDIT_HOLIDAY_LIST' },
        loadComponent: () =>
          import('./pages/holiday-lists/edit-holiday-list-component/edit-holiday-list-component').then(
            (x) => x.EditHolidayListComponent,
          ),
      },
      {
        path: 'preview/:id',
        data: { breadcrumb: 'SETTINGS.PREVIEW_HOLIDAY_LIST' },
        loadComponent: () =>
          import('./pages/holiday-lists/preview-holiday-list-component/preview-holiday-list-component').then(
            (x) => x.PreviewHolidayListComponent,
          ),
      },
    ],
  },
];
