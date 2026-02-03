import { Routes } from "@angular/router";

export const JOB_LEVEL_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./pages/view-levels/view-level-component/view-level-component').then(x => x.ViewLevelComponent),
  children: [{
    path: 'view',
    loadComponent: () => import('./pages/view-levels/view-level-component/view-level-component').then(x => x.ViewLevelComponent),
    data: { breadcrumb: 'MENU.JOB_LEVELS' }
  }, {
    path: 'create',
    loadComponent: () => import('./pages/create-level/create-level-component/create-level-component').then(x => x.CreateLevelComponent),
    data: { breadcrumb: 'MENU.CREATE_LEVEL' }
  }, {
    path: 'mapping',
    loadComponent: () => import('./pages/level-mapping/level-mapping-component/level-mapping-component').then(x => x.LevelMappingComponent),
    data: { breadcrumb: 'MENU.LEVEL_MAPPING' }
  }, {
    path: '',
    redirectTo: 'view',
    pathMatch: 'full'
  }


  ]
}]
