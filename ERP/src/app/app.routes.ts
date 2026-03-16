import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth-guard';
import { guestGuard } from '@core/auth/guards/guest-guard';
import { AuthService } from '@core/auth/services/auth-service';
import { LoginLayoutComponent } from '@shared/layouts/login/login-layout-component/login-layout-component';
import { MainLayoutComponent } from '@shared/layouts/main/main-layout-component/main-layout-component';

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
    canActivateChild: [authGuard], // Protects all internal pages
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
      },
      {
        path: 'job-levels',
        canMatch: [() => inject(AuthService).hasPermission('Organization.Levels')],
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
        data: { breadcrumb: 'Access Denied' }
      },
      {
        path: '**',
        loadComponent: () => import('@shared/pages/not-found-component/not-found-component').then(x => x.NotFoundComponent),
        data: { breadcrumb: 'Not Found' }
      }
    ]
  }
];
