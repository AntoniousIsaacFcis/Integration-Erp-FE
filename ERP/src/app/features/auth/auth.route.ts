import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login-form-component/login-form-component').then(m => m.LoginFormComponent),
        data: { title: 'AUTH.WELCOME_TITLE', subtitle: 'AUTH.WELCOME_SUBTITLE' }
      },
      {
        path: 'forget-password',
        loadComponent: () => import('./pages/forget-password-component/forget-password-component').then(m => m.ForgetPasswordComponent),
        data: { title: 'AUTH.RECOVER_ACCESS', subtitle: 'AUTH.RECOVER_SUBTITLE' }
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password-component/reset-password-component').then(m => m.ResetPasswordComponent),
        data: { title: 'AUTH.RESET_PASSWORD_TITLE', subtitle: 'AUTH.RESET_PASSWORD_SUBTITLE' }
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register-component/register-component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  }
];
