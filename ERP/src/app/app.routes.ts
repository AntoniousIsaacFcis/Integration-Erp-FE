import { Routes } from '@angular/router';
import { LoginLayoutComponent } from '@shared/layouts/login/login-layout-component/login-layout-component';
import { MainLayoutComponent } from '@shared/layouts/main/main-layout-component/main-layout-component';

export const routes: Routes = [
  {
    path: '',
    component: LoginLayoutComponent,
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
    // later AuthGuard here
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-component/dashboard-component').then(x => x.DashboardComponent),
        data: { breadcrumb: 'MENU.DASHBOARD' }
      },
      {
        path: 'organization',
        canMatch: [],//not load except for user has permission
        loadChildren: () => import('./features/organization/organization.route').then(x => x.ORGANIZATION_ROUTES)
      },
      {
        path: 'job-levels',
        data: {
          breadcrumb: 'MENU.JOB_LEVELS',
          actionLabel: 'BUTTON.ADD_LEVEL'
        },
        loadChildren: () => import('./features/job-level/job-level.routes').then(x => x.JOB_LEVEL_ROUTES),
      },
      //defaut redirection
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  //redirect wrong routing
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }

];
