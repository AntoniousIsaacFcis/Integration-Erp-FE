import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth-guard';
import { guestGuard } from '@core/auth/guards/guest-guard';
import { AuthService } from '@core/auth/services/auth-service';
import { LoginLayoutComponent } from '@shared/layouts/login/login-layout-component/login-layout-component';
import { MainLayoutComponent } from '@shared/layouts/main/main-layout-component/main-layout-component';
import { filter, map, take } from 'rxjs';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    component: LoginLayoutComponent,
    // canActivate: [guestGuard], // Prevents logged-in users from seeing login page
    loadChildren: () => import('./features/auth/auth.route').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    // canActivateChild: [authGuard], // Protects all internal pages
    data: { breadcrumb: 'MENU.DASHBOARD' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-component/dashboard-component').then(x => x.DashboardComponent),
        data: { breadcrumb: null }
      },
      {
        path: 'core-hr',
        loadChildren: () => import('./features/core-hr/core-hr.route').then(m => m.CORE_HR_ROUTES),
      },
      {
        path: 'employees',
        pathMatch: 'full',
        redirectTo: 'core-hr/employees',
      },
      {
        path: 'employees/view',
        redirectTo: 'core-hr/employees/view',
      },
      {
        path: 'employees/add',
        redirectTo: 'core-hr/employees/add',
      },
      {
        path: 'employees/details/:empId',
        redirectTo: 'core-hr/employees/details/:empId',
      },
      {
        path: 'employees',
        redirectTo: 'core-hr/employees',
      },
      {
        path: 'organization',
        loadChildren: () => import('./features/organization/organization.route').then(m => m.ORGANIZATION_ROUTES),
      },
      {
        path: 'departments',
        pathMatch: 'full',
        redirectTo: 'organization/departments',
      },
      {
        path: 'departments/view',
        redirectTo: 'organization/departments/view',
      },
      {
        path: 'departments/create',
        redirectTo: 'organization/departments/create',
      },
      {
        path: 'departments/edit/:id',
        redirectTo: 'organization/departments/edit/:id',
      },
      {
        path: 'departments/preview/:id',
        redirectTo: 'organization/departments/preview/:id',
      },
      {
        path: 'departments',
        redirectTo: 'organization/departments',
      },
      {
        path: 'job-levels',
        pathMatch: 'full',
        redirectTo: 'organization/levels',
      },
      {
        path: 'job-levels/view',
        redirectTo: 'organization/levels/view',
      },
      {
        path: 'job-levels/create',
        redirectTo: 'organization/levels/create',
      },
      {
        path: 'job-levels/mapping',
        redirectTo: 'organization/levels/mapping',
      },
      {
        path: 'job-levels/edit/:id',
        redirectTo: 'organization/levels/edit/:id',
      },
      {
        path: 'job-levels/preview/:id',
        redirectTo: 'organization/levels/preview/:id',
      },
      {
        path: 'job-levels',
        // canMatch: [() => {
        //   const authService = inject(AuthService);
        //   const router = inject(Router);

        //   // Return an observable that waits for the permissions to load
        //   return authService.isConfigLoading$.pipe(
        //     filter(loading => loading === false), // Wait until laoading ends (be false)
        //     take(1),
        //     map(() => {
        //       if (authService.hasPermission('Organization.Levels')) {
        //         return true;
        //       }
        //       return router.parseUrl('/403');
        //     })
        //   );
        // }],
        redirectTo: 'organization/levels',
      },
      {
        path: 'employment-types',
        pathMatch: 'full',
        redirectTo: 'organization/employment-types',
      },
      {
        path: 'employment-types/view',
        redirectTo: 'organization/employment-types/view',
      },
      {
        path: 'employment-types/create',
        redirectTo: 'organization/employment-types/create',
      },
      {
        path: 'employment-types',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.employment-types')],
        redirectTo: 'organization/employment-types',
      },
      {
        path: 'attendance',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.employment-types')],
        loadChildren: () => import('./features/attendance/attendance.route').then(m => m.ATTENDANCE_ROUTES),
      },
      {
        path: 'shifts',
        pathMatch: 'full',
        redirectTo: 'attendance',
      },
      {
        path: 'shifts/view',
        redirectTo: 'attendance/view',
      },
      {
        path: 'shifts/create',
        redirectTo: 'attendance/create',
      },
      {
        path: 'shifts/special',
        redirectTo: 'attendance/special',
      },
      {
        path: 'shifts/special-create',
        redirectTo: 'attendance/special-create',
      },
      {
        path: 'shifts/edit-attendance-day',
        redirectTo: 'attendance/edit-attendance-day',
      },
      {
        path: 'shifts/view-attendance-days',
        redirectTo: 'attendance/view-attendance-days',
      },
      {
        path: 'shifts/attendance-log-details/:id',
        redirectTo: 'attendance/attendance-log-details/:id',
      },
      {
        path: 'shifts/add-permission',
        redirectTo: 'attendance/add-permission',
      },
      {
        path: 'shifts/view-permissions',
        redirectTo: 'attendance/view-permissions',
      },
      {
        path: 'shifts',
        redirectTo: 'attendance',
      },
       {
        path: 'roles',
        pathMatch: 'full',
        redirectTo: 'core-hr/roles',
      },
      {
        path: 'roles/create',
        redirectTo: 'core-hr/roles/create',
      },
       {
        path: 'roles',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.employment-types')],
        redirectTo: 'core-hr/roles',
      },
      {
        path: '403',
        loadComponent: () => import('@shared/pages/access-denied-component/access-denied-component').then(m => m.AccessDeniedComponent),
        data: { breadcrumb: 'MENU.ACEESS_DENIED' }
      },
      {
        path: '**',
        loadComponent: () => import('@shared/pages/not-found-component/not-found-component').then(x => x.NotFoundComponent),
        data: { breadcrumb: 'MENU.NOT_FOUND' }
      }
    ]
  }
];
