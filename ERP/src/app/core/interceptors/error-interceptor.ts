import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { IErrorResponse } from '@core/models/iremote-service-error';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorBody = typeof error.error === 'object' ? error.error as IErrorResponse : null;

      let userFriendlyMessage = 'UNEXPECTED_ERROR';

      if (error.status === 400 || error.status === 401) {
        // 1. Check standard ABP wrapper: error.error.error.message
        if (error.error?.error?.message) {
          userFriendlyMessage = error.error.error.message;
        }
        // 2. Check OpenIddict/Identity format: error.error.error_description
        else if (error.error?.error_description) {
          userFriendlyMessage = error.error.error_description;
        }
        // 3. Fallback to generic code
         else {
          userFriendlyMessage = 'INVALID_CREDENTIALS';
        }
      } else if (error.status === 403) {
        userFriendlyMessage = 'PERMISSION_DENIED.';
      }

      // Toast can be used here
      console.error(`[API Error]: ${userFriendlyMessage}`, errorBody?.error?.details);

      return throwError(
        () => String(userFriendlyMessage) // Return ONLY the string
      );
    })
  );
};
