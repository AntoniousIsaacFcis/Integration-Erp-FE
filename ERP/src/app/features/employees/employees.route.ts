import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.EMPLOYEES' },
    children: [
      {
        path: 'view',
        loadComponent: () =>
          import('./pages/view-employees-component/view-employees-component')
            .then(m => m.ViewEmployeesComponent),
        data: { breadcrumb: 'MENU.ALL_EMPLOYEES' }
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./pages/add-employee-component/add-employee-component')
            .then(m => m.AddEmployeeComponent),
        data: {
          breadcrumb: 'MENU.ADD_EMPLOYEE',
        }
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  }
];
