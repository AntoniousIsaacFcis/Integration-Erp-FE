import { Routes } from "@angular/router";
import { permissionAndRoleGuard, permissionGuard } from '@core/auth/guards/permission-guard';
import { ATTENDANCE_PERMISSION_PERMISSIONS } from '@features/attendance/utils/attendance-permission-auth';
import { SHIFT_MANAGER_ROLES, SHIFT_PERMISSIONS } from '@features/attendance/utils/shift-auth';

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
            path: 'view-log-session',
            data: { breadcrumb: 'MENU.VIEW_ATTENDANCE_LOG_SESSIONS' },
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/view-log-session-component/view-log-session-component').then(x => x.ViewLogSessionComponent),
              },
              {
                path: 'details/:id',
                loadComponent: () => import('./pages/log-session-details-component/log-session-details-component').then(x => x.LogSessionDetailsComponent),
                data: { breadcrumb: 'ATTENDANCE.SESSION_DETAILS' },
              },
            ],
          },
          {
            path: 'view-attendance-log',
            data: { breadcrumb: 'MENU.VIEW_ATTENDANCE_LOGS' },
            children: [
              {
                path: '',
                loadComponent: () => import('./pages/view-attendance-log-component/view-attendance-log-component').then(x => x.ViewAttendanceLogComponent),
              },
              {
                path: 'details/:id',
                loadComponent: () => import('./pages/attendance-log-details-component/attendance-log-details-component').then(x => x.AttendanceLogDetailsComponent),
                data: { breadcrumb: 'MENU.VIEW_ATTENDANCE_LOG_DETAILS' }
              },
            ],
          },
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
                data: { breadcrumb: 'MENU.CREATE_SHIFT' },
                canActivate: [permissionAndRoleGuard(SHIFT_PERMISSIONS.create, SHIFT_MANAGER_ROLES)]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./pages/edit-shift-component/edit-shift-component').then(x => x.EditShiftComponent),
                data: { breadcrumb: 'SHIFT.EDIT_SHIFT' },
                canActivate: [permissionAndRoleGuard(SHIFT_PERMISSIONS.update, SHIFT_MANAGER_ROLES)]
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
                data: { breadcrumb: 'MENU.CREATE_SPECIAL_SHIFT' },
                canActivate: [permissionAndRoleGuard(SHIFT_PERMISSIONS.assignmentCreate, SHIFT_MANAGER_ROLES)]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./pages/edit-special-shift-component/edit-special-shift-component').then(x => x.EditSpecialShiftComponent),
                data: { breadcrumb: 'MENU.EDIT_SPECIAL_SHIFT' },
                canActivate: [permissionAndRoleGuard(SHIFT_PERMISSIONS.assignmentUpdate, SHIFT_MANAGER_ROLES)]
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
                path: 'create-leave-application',
                loadComponent: () => import('./pages/create-leave-application-component/create-leave-application-component').then(x => x.CreateLeaveApplicationComponent),
                data: { breadcrumb: 'MENU.CREATE_LEAVE_APPLICATION' }
              },
              {
                path: 'edit-leave-application/:id',
                loadComponent: () => import('./pages/edit-leave-application-component/edit-leave-application-component').then(x => x.EditLeaveApplicationComponent),
                data: { breadcrumb: 'EMPLOYEES.VACATIONS.EDIT_LEAVE_APPLICATION' },
                canActivate: [permissionGuard('CoreHR.LeaveApplications.Update')]
              },
              {
                path: 'leave-application-details/:id',
                loadComponent: () => import('./pages/leave-application-details-component/leave-application-details-component').then(x => x.LeaveApplicationDetailsComponent),
                data: { breadcrumb: 'EMPLOYEES.VACATIONS.LEAVE_APPLICATION_DETAILS' }
              },
              {
                path: 'create-attendance-permission',
                loadComponent: () => import('./pages/create-attendance-permission-component/create-attendance-permission-component').then(x => x.CreateAttendancePermissionComponent),
                data: { breadcrumb: 'MENU.CREATE_ATTENDANCE_PERMISSION' }
              },
              {
                path: 'edit-attendance-permission/:id',
                loadComponent: () => import('./pages/edit-attendance-permission-component/edit-attendance-permission-component').then(x => x.EditAttendancePermissionComponent),
                data: { breadcrumb: 'EMPLOYEES.VACATIONS.EDIT_ATTENDANCE_PERMISSION' },
                canActivate: [permissionGuard(ATTENDANCE_PERMISSION_PERMISSIONS.update)]
              },
              {
                path: 'attendance-permission-details/:id',
                loadComponent: () => import('./pages/attendance-permission-details-component/attendance-permission-details-component').then(x => x.AttendancePermissionDetailsComponent),
                data: { breadcrumb: 'EMPLOYEES.VACATIONS.ATTENDANCE_PERMISSION_DETAILS' }
              },
            ],
          },
          {
            path: '',
            redirectTo: 'view-log-session',
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
            path: 'edit-leave-application/:id',
            redirectTo: 'view-permissions/edit-leave-application/:id',
          },
          {
            path: 'leave-application-details/:id',
            redirectTo: 'view-permissions/leave-application-details/:id',
          },
          {
            path: 'log-session-details/:id',
            redirectTo: 'view-log-session/details/:id',
          },
          {
            path: 'view-log-session-details/:id',
            redirectTo: 'view-log-session/details/:id',
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
            redirectTo: 'view-attendance-log/details/:id',
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
            path: 'permissions-and-leave-applications',
            redirectTo: 'view-permissions',
          },
          {
            path: 'add-permission',
            redirectTo: 'view-permissions/create-attendance-permission',
          }
        ]
      }
    ]
  }
];


