import { inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { catchError, filter, map, of, take } from 'rxjs';

export const permissionGuard = (requiredPolicy: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const injector = inject(Injector);

    if (authService.configResource.error()) {
      return router.createUrlTree(['/403']);
    }

   return toObservable(authService.configResource.isLoading, { injector }).pipe(
      filter(loading => !loading), //wait until laoding finish
      take(1), //take first value and close the observable
      map(() => authService.hasPermission(requiredPolicy) ? true : router.createUrlTree(['/403'])),
      catchError(() => of(router.createUrlTree(['/403'])))
    );
  };

};
