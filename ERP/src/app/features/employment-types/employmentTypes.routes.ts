import { Routes } from "@angular/router";
import { ViewEmloymentTypesComponent } from "./pages/view-emloyment-types-component/view-emloyment-types-component";

export const EMPLOYMENT_TYPES_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'JOB_LEVEL.EMPLOYMENT_TYPES' },
    children: [
      {
        path: 'view',
        component: ViewEmloymentTypesComponent,
        data: { breadcrumb: 'JOB_LEVEL.TYPES_TABLE' }
      },
      {
        path: 'create',
        // component: CreateEmploymentTypeComponent,
        data: { breadcrumb: 'JOB_LEVEL.ADD_TYPE' }
      }
    ]
  }
];
