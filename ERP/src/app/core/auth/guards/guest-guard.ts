import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const injector = inject(Injector);

  return toObservable(authService.configResource.isLoading, { injector }).pipe(
    filter(isLoading => !isLoading),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return router.parseUrl('/dashboard');
      }
      return true;
    })
  );
};
