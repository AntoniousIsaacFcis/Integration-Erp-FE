import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/guards/permission-guard';

export const ATTENDANCE_MACHINES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('Attendance.AttendanceMachines')],
    children: [
      {
        path: '',
        data: { breadcrumb: 'SETTINGS.ATTENDANCE_MACHINES_TABLE' },
        loadComponent: () =>
          import('./pages/attendance-machines/view-attendance-machines-component/view-attendance-machines-component').then(
            (x) => x.ViewAttendanceMachinesComponent,
          ),
      },
      {
        path: 'view',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'create',
        data: { breadcrumb: 'SETTINGS.ADD_ATTENDANCE_MACHINE' },
        loadComponent: () =>
          import('./pages/attendance-machines/create-attendance-machine-component/create-attendance-machine-component').then(
            (x) => x.CreateAttendanceMachineComponent,
          ),
      },
      {
        path: 'edit/:id',
        data: { breadcrumb: 'SETTINGS.EDIT_ATTENDANCE_MACHINE' },
        loadComponent: () =>
          import('./pages/attendance-machines/edit-attendance-machine-component/edit-attendance-machine-component').then(
            (x) => x.EditAttendanceMachineComponent,
          ),
      },
      {
        path: 'preview/:id',
        data: { breadcrumb: 'SETTINGS.PREVIEW_ATTENDANCE_MACHINE' },
        loadComponent: () =>
          import('./pages/attendance-machines/preview-attendance-machine-component/preview-attendance-machine-component').then(
            (x) => x.PreviewAttendanceMachineComponent,
          ),
      },
    ],
  },
];
