import { Routes } from "@angular/router";

// features/attendance/attendance.routes.ts
export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.ATTENDANCE' },
    children: [
      {
        path: 'view',
        loadComponent: () => import('./pages/view-shift-component/view-shift-component').then(x => x.ViewShiftComponent),
        data: { breadcrumb: 'MENU.VIEW_SHIFTS' }
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/create-shift-component/create-shift-component').then(x => x.CreateShiftComponent),
        data: { breadcrumb: 'MENU.CREATE_SHIFT' }
      }
      // ,
      // {
      //   path: 'assignment',
      //   // loadComponent: () => import('./pages/permissions/permissions.component')
      //   data: { breadcrumb: 'MENU.SHIFT_ASSIGNMENT' }
      // },
      // {
      //   path: 'reports',
      //   // loadComponent: () => import('./pages/shift-reports/shift-reports.component')
      //   data: { breadcrumb: 'MENU.SHIFT_REPORTS' }
      // }
      , {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      }
    ]
  }
];
