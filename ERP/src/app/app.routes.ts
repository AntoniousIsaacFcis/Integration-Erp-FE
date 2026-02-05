import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '@shared/layouts/admin/admin-layout-component/admin-layout-component';
import { MainLayoutComponent } from '@shared/layouts/main/main-layout-component/main-layout-component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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

      }
    ]
  }

];
