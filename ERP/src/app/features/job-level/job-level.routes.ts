import { Routes } from "@angular/router";
import { permissionGuard } from "@core/auth/guards/permission-guard";

export const JOB_LEVEL_ROUTES: Routes = [{
  path: '',
  data: { breadcrumb: 'MENU.JOB_LEVELS' },
  children: [
    {
      path: '',pathMatch: 'full',redirectTo: 'view' // إعادة توجيه الأبناء فقط
    },
    {
      path: 'view',
      // canActivate: [permissionGuard('Organization.Levels')],
      loadComponent: () => import('./pages/view-level-component/view-level-component')
        .then(x => x.ViewLevelComponent),
      data: { breadcrumb: 'MENU.ALL_JOB_LEVELS' }
    },
    {
      path: 'create',
      // canActivate: [permissionGuard('Organization.Levels.Create')],
      loadComponent: () => import('./pages/create-level-component/create-level-component')
        .then(x => x.CreateLevelComponent),
      data: { breadcrumb: 'MENU.CREATE_LEVEL' }
    },
    {
      path: 'edit/:id',
      // canActivate: [permissionGuard('Organization.Levels.Update')],
      loadComponent: () => import('./pages/edit-level-component/edit-level-component')
        .then(x => x.EditLevelComponent),
      data: { breadcrumb: 'JOB_LEVEL.EDIT_JOB_LEVEL' }
    },
    {
      path: 'preview/:id',
      // canActivate: [permissionGuard('Organization.Levels')],
      loadComponent: () => import('./pages/preview-level-component/preview-level-component')
        .then(x => x.PreviewLevelComponent),
      data: { breadcrumb: 'JOB_LEVEL.PREVIEW_JOB_LEVEL' }
    },
    {
      path: 'mapping',
      // canActivate: [permissionGuard('Organization.Levels.Mapping')],
      loadComponent: () => import('./pages/level-mapping-component/level-mapping-component')
        .then(x => x.LevelMappingComponent),
      data: { breadcrumb: 'MENU.LEVEL_MAPPING' }
    }
  ]
}]
