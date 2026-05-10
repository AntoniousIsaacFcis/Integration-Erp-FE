import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'SETTINGS.TITLE' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'leave-types',
      },
      {
        path: 'leave-types',
        data: { breadcrumb: 'SETTINGS.LEAVE_TYPES' },
        loadChildren: () =>
          import('./leave-types.routes').then(m => m.LEAVE_TYPES_ROUTES),
      },
      {
        path: 'holiday-lists',
        data: { breadcrumb: 'SETTINGS.HOLIDAY_LISTS' },
        loadChildren: () =>
          import('./holiday-lists.routes').then(m => m.HOLIDAY_LISTS_ROUTES),
      },
      {
        path: 'attendance-machines',
        data: { breadcrumb: 'SETTINGS.ATTENDANCE_MACHINES' },
        loadChildren: () =>
          import('./attendance-machines.routes').then(m => m.ATTENDANCE_MACHINES_ROUTES),
      },
      {
        path: 'employment-status',
        data: { breadcrumb: 'SETTINGS.EMPLOYMENT_STATUS' },
        loadChildren: () =>
          import('../organization/employment-statuses.routes').then(m => m.EMPLOYMENT_STATUSES_ROUTES),
      },
    ],
  },
];
