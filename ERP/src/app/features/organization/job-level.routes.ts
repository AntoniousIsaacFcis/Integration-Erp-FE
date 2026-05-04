import { Routes } from "@angular/router";

export const JOB_LEVEL_ROUTES: Routes = [{
  path: '',
  children: [
    {
      path: '',
      data: { breadcrumb: 'MENU.ALL_JOB_LEVELS' },
      loadComponent: () => import('./pages/job-levels/view-level-component/view-level-component')
        .then(x => x.ViewLevelComponent),
    },
    {
      path: 'view',
      redirectTo: '',
      pathMatch: 'full',
    },
    {
      path: 'create',
      loadComponent: () => import('./pages/job-levels/create-level-component/create-level-component')
        .then(x => x.CreateLevelComponent),
      data: { breadcrumb: 'MENU.CREATE_LEVEL' }
    },
    {
      path: 'edit/:id',
      loadComponent: () => import('./pages/job-levels/edit-level-component/edit-level-component')
        .then(x => x.EditLevelComponent),
      data: { breadcrumb: 'JOB_LEVEL.EDIT_JOB_LEVEL' }
    },
    {
      path: 'preview/:id',
      loadComponent: () => import('./pages/job-levels/preview-level-component/preview-level-component')
        .then(x => x.PreviewLevelComponent),
      data: { breadcrumb: 'JOB_LEVEL.PREVIEW_JOB_LEVEL' }
    },
    {
      path: 'mapping',
      loadComponent: () => import('./pages/job-levels/level-mapping-component/level-mapping-component')
        .then(x => x.LevelMappingComponent),
      data: { breadcrumb: 'MENU.LEVEL_MAPPING' }
    }
  ]
}]
