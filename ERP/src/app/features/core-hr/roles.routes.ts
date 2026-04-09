import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create',
        loadComponent: () => import('./pages/roles/create-role-component/create-role-component').then(m => m.CreateRoleComponent)
      },
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full'
      }
    ]
  }
];
