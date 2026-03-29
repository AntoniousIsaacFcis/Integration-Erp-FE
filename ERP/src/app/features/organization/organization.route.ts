import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
   path: '',
   loadComponent:()=>import('./pages/manage-department/departments-component/departments-component').then(x=>x.DepartmentsComponent)
  }
];
