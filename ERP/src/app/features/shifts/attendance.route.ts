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
      ,
      {
        path: 'special',  
        loadComponent: () => import('./pages/view-specific-shift-component/view-specific-shift-component').then(x => x.ViewSpecificShiftComponent),
        data: { breadcrumb: 'MENU.VIEW_SPECIAL_SHIFTS' }
      },
      {
        path: 'special-create',
        loadComponent: () => import('./pages/create-special-shift-component/create-special-shift-component').then(x => x.CreateSpecialShiftComponent),
        data: { breadcrumb: 'MENU.CREATE_SPECIAL_SHIFT' }
      }
      , {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      }
    ]
  }
];
