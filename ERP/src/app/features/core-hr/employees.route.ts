import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.EMPLOYEES' },
    children: [
      {
        path: 'view',
        loadComponent: () =>
          import('./pages/employees/view-employees-component/view-employees-component')
            .then(m => m.ViewEmployeesComponent),
        data: { breadcrumb: 'MENU.ALL_EMPLOYEES' }
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./pages/employees/add-employee-component/add-employee-component')
            .then(m => m.AddEmployeeComponent),
        data: {
          breadcrumb: 'MENU.ADD_EMPLOYEE',
        }
      },
      {
        path: 'edit/:empId',
        loadComponent: () =>
          import('./pages/employees/add-employee-component/add-employee-component')
            .then(m => m.AddEmployeeComponent),
        data: {
          breadcrumb: 'EMPLOYEES.EDIT_EMPLOYEE',
        }
      },
      {
        path: 'details/:empId/leave-applications/edit/:leaveId',
        loadComponent: () => import('./pages/employees/edit-leave-application-component/edit-leave-application-component')
          .then(m => m.EditLeaveApplicationComponent),
        data: { breadcrumb: 'EMPLOYEES.VACATIONS.EDIT_LEAVE_APPLICATION' }
      },
      {
        path: 'details/:empId',
        loadComponent: () => import('./pages/employees/employee-details-component/employee-details-component')
          .then(m => m.EmployeeDetailsComponent),
        data: { breadcrumb: 'MENU.EMPLOYEE_DETAILS' }
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  }
];
