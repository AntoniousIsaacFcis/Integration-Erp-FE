import { AuthService } from '@core/auth/services/auth-service';

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
