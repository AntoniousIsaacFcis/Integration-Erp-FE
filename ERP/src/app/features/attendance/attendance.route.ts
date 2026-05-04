import { Routes } from "@angular/router";

// features/attendance/attendance.routes.ts
export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.ATTENDANCE' },
    children: [
      {
        path: '',
        children: [
          {
            path: 'view',
            data: { breadcrumb: 'MENU.VIEW_SHIFTS' },
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/view-shift-component/view-shift-component').then(x => x.ViewShiftComponent),
              },
              {
                path: 'create',
                loadComponent: () => import('./pages/create-shift-component/create-shift-component').then(x => x.CreateShiftComponent),
                data: { breadcrumb: 'MENU.CREATE_SHIFT' }
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./pages/edit-shift-component/edit-shift-component').then(x => x.EditShiftComponent),
                data: { breadcrumb: 'SHIFT.EDIT_SHIFT' }
              },
              {
                path: 'details/:id',
                loadComponent: () => import('./pages/view-shift-details-component/view-shift-details-component').then(x => x.ViewShiftDetailsComponent),
                data: { breadcrumb: 'SHIFT.VIEW_SHIFT' }
              },
            ],
          },
          {
            path: 'special',
            data: { breadcrumb: 'MENU.VIEW_SPECIAL_SHIFTS' },
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/view-specific-shift-component/view-specific-shift-component').then(x => x.ViewSpecificShiftComponent),
              },
              {
                path: 'create',
                loadComponent: () => import('./pages/create-special-shift-component/create-special-shift-component').then(x => x.CreateSpecialShiftComponent),
                data: { breadcrumb: 'MENU.CREATE_SPECIAL_SHIFT' }
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./pages/edit-special-shift-component/edit-special-shift-component').then(x => x.EditSpecialShiftComponent),
                data: { breadcrumb: 'MENU.EDIT_SPECIAL_SHIFT' }
              },
              {
                path: 'details/:id',
                loadComponent: () => import('./pages/view-special-shift-details-component/view-special-shift-details-component').then(x => x.ViewSpecialShiftDetailsComponent),
                data: { breadcrumb: 'MENU.VIEW_SPECIAL_SHIFTS' }
              },
            ],
          },
          {
            path: 'view-attendance-days',
            data: { breadcrumb: 'MENU.VIEW_ATTENDANCE_DAYS' },
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/view-attendance-days-component/view-attendance-days-component').then(x => x.ViewAttendanceDaysComponent),
              },
              {
                path: 'create',
                loadComponent: () => import('./pages/create-attendance-day-component/create-attendance-day-component').then(x => x.CreateAttendanceDayComponent),
                data: { breadcrumb: 'MENU.CREATE_ATTENDANCE_DAY' }
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./pages/edit-attendance-day-component/edit-attendance-day-component').then(x => x.EditAttendanceDayComponent),
                data: { breadcrumb: 'MENU.EDIT_ATTENDANCE_DAY' }
              },
              {
                path: 'details/:id',
                loadComponent: () => import('./pages/details-attendance-day-component/details-attendance-day-component').then(x => x.DetailsAttendanceDayComponent),
                data: { breadcrumb: 'MENU.VIEW_ATTENDANCE_DAY_DETAILS' }
              },
            ],
          },
          {
            path: 'view-permissions',
            data: { breadcrumb: 'MENU.VIEW_PERMISSIONS' },
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/view-permissions-component/view-permissions-component').then(x => x.ViewPermissionsComponent),
              },
              {
                path: 'add',
                loadComponent: () => import('./pages/add-permission-component/add-permission-component').then(x => x.AddPermissionComponent),
                data: { breadcrumb: 'MENU.ADD_ATTENDANCE_PERMISSION' }
              },
            ],
          },
          {
            path: '',
            redirectTo: 'view',
            pathMatch: 'full'
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
            path: 'details/:id',
            redirectTo: 'view/details/:id',
          },
          {
            path: 'special-create',
            redirectTo: 'special/create',
          },
          {
            path: 'special-edit/:id',
            redirectTo: 'special/edit/:id',
          },
          {
            path: 'special-details/:id',
            redirectTo: 'special/details/:id',
          },
          {
            path: 'create-attendance-day',
            redirectTo: 'view-attendance-days/create',
          },
          {
            path: 'edit-attendance-day',
            redirectTo: 'view-attendance-days/edit',
          },
          {
            path: 'edit-attendance-day/:id',
            redirectTo: 'view-attendance-days/edit/:id',
          },
          {
            path: 'attendance-log-details/:id',
            redirectTo: 'view-attendance-days/details/:id',
          },
          {
            path: 'attendance-day-details/:id',
            redirectTo: 'view-attendance-days/details/:id',
          },
          {
            path: 'details-attendance-day/:id',
            redirectTo: 'view-attendance-days/details/:id',
          },
          {
            path: 'add-permission',
            redirectTo: 'view-permissions/add',
          }
        ]
      }
    ]
  }
];
