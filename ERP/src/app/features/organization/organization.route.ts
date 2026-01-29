import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
   path: '',
   loadComponent:()=>import('./components/org-filters-bar-component/org-filters-bar-component').then(x=>x.OrgFiltersBarComponent)
  }
];
