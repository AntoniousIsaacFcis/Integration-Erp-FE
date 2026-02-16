import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { AUTH_STORAGE } from '../tokens/auth-storage.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);

  const storage = injector.get(AUTH_STORAGE);
  const token = storage.getToken();

  //add an Authorization token in header without touching localStorage => protectation against XSS
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('⚠️ 401 Unauthorized - Logging out...');
        const authService = injector.get(AuthService);
        authService.logout();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
