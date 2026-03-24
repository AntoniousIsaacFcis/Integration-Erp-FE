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
    canActivate: [guestGuard], // Prevents logged-in users from seeing login page
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
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.route').then(m => m.EMPLOYEE_ROUTES),
      },{
        path: 'job-levels',
        canMatch: [() => {
          const authService = inject(AuthService);
          const router = inject(Router);

          // Return an observable that waits for the permissions to load
          return authService.isConfigLoading$.pipe(
            filter(loading => loading === false), // Wait until laoading ends (be false)
            take(1),
            map(() => {
              if (authService.hasPermission('Organization.Levels')) {
                return true;
              }
              return router.parseUrl('/403');
            })
          );
        }],
        loadChildren: () => import('./features/job-level/job-level.routes').then(m => m.JOB_LEVEL_ROUTES)
      },
      {
        path: 'employment-types',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.employment-types')],
        loadChildren: () => import('./features/employment-types/employmentTypes.routes').then(m => m.EMPLOYMENT_TYPES_ROUTES),
      },
      {
        path: 'shifts',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.employment-types')],
        loadChildren: () => import('./features/shifts/attendance.route').then(m => m.ATTENDANCE_ROUTES),
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
