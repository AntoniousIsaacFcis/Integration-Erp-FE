import { Routes } from "@angular/router";
import { ViewEmloymentTypesComponent } from "./pages/employment-types/view-emloyment-types-component/view-emloyment-types-component";

export const EMPLOYMENT_TYPES_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'MENU.EMPLOYMENT_TYPES' },
    children: [
      {
        path: 'view',
        component: ViewEmloymentTypesComponent,
        data: { breadcrumb: 'BREADCRUMB.TYPES_TABLE' }
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/employment-types/create-employment-type-component/create-employment-type-component').then(x => x.CreateEmploymentTypeComponent),
        data: { breadcrumb: 'BREADCRUMB.ADD_TYPE' }
      }
      , {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      }
    ]
  }
];
