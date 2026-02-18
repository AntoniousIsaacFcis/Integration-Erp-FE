import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';

export const permissionGuard = (requiredPolicy: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(requiredPolicy)) {
      return true;
    }

    console.warn(`[Guard]: Access denied for ${requiredPolicy}`);
    return router.parseUrl('/dashboard'); //  or page 403
  };
};
