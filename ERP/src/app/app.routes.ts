import { Routes } from '@angular/router';
import { LoginLayoutComponent } from '@shared/layouts/login/login-layout-component/login-layout-component';
import { MainLayoutComponent } from '@shared/layouts/main/main-layout-component/main-layout-component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    component: LoginLayoutComponent,
    // canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.route').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [authGuard],
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
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.JobLevels')],
        loadChildren: () => import('./features/job-level/job-level.routes').then(m => m.JOB_LEVEL_ROUTES),
      },
      {
        path: 'employment-types',
        // canMatch: [() => inject(AuthService).hasPermission('MyProject.employment-types')],
        loadChildren: () => import('./features/employment-types/employmentTypes.routes').then(m => m.EMPLOYMENT_TYPES_ROUTES),
      },
      // ... باقي الميزات بنفس النمط
    ]
  },

  //redirect wrong routing
  // { path: '**', redirectTo: 'auth/login' }
];
