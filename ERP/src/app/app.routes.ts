import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth-guard';
import { guestGuard } from '@core/auth/guards/guest-guard';
import { permissionGuard } from '@core/auth/guards/permission-guard';
import { AuthService } from '@core/auth/services/auth-service';
import { LoginLayoutComponent } from '@shared/layouts/login/login-layout-component/login-layout-component';
import { MainLayoutComponent } from '@shared/layouts/main/main-layout-component/main-layout-component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    component: LoginLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login-form-component/login-form-component').then(m => m.LoginFormComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        // canActivate: [permissionGuard('AbpIdentity.Dashboard')],
        loadComponent: () => import('./features/dashboard/pages/dashboard-component/dashboard-component').then(x => x.DashboardComponent),
        data: { breadcrumb: 'MENU.DASHBOARD' }
      },
      {
        path: 'organization',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.Organization')],//not load except for user has permission
        loadChildren: () => import('./features/organization/organization.route').then(x => x.ORGANIZATION_ROUTES)
      },
      {
        path: 'job-levels',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.JobLevels')],
        data: {
          breadcrumb: 'MENU.JOB_LEVELS',
          actionLabel: 'BUTTON.ADD_LEVEL'
        },
        loadChildren: () => import('./features/job-level/job-level.routes').then(x => x.JOB_LEVEL_ROUTES),
      }
    ]
  },

  //redirect wrong routing
  { path: '**', redirectTo: 'auth/login' }

];
