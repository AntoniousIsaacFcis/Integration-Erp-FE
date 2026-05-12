import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const DASHBOARD_ADMIN_ROLES = ['admin', 'hr'] as const;

export function isDashboardAdminUser(authService: AuthService) {
  const roles = authService.currentUser()?.roles ?? [];
  const normalizedRoles = roles.map((role: string) => role.toLowerCase());

  return DASHBOARD_ADMIN_ROLES.some(role => normalizedRoles.includes(role));
}

export function isDashboardEmployeeUser(authService: AuthService) {
  const roles = authService.currentUser()?.roles ?? [];
  const normalizedRoles = roles.map((role: string) => role.toLowerCase());

  return normalizedRoles.includes('employee') && !isDashboardAdminUser(authService);
}

export const dashboardAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const injector = inject(Injector);

  return toObservable(authService.configResource.isLoading, { injector }).pipe(
    filter(isLoading => !isLoading),
    take(1),
    map(() => isDashboardAdminUser(authService) || router.parseUrl('/403')),
  );
};
