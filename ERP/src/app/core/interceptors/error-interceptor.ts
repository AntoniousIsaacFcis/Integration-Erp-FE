import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { IErrorResponse } from '@core/models/iremote-service-error';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorBody = error.error as IErrorResponse;

      // منطق معالجة الأخطاء بناءً على الـ Status Code والـ ABP Schema
      let userFriendlyMessage = 'Something went wrong. Please try again.';

      if (error.status === 401) {
        userFriendlyMessage = 'Invalid email or password.';
      } else if (error.status === 403) {
        userFriendlyMessage = 'You do not have permission to perform this action.';
      } else if (errorBody?.error?.message) {
        userFriendlyMessage = errorBody.error.message;
      }

      // Toast can be used here
      console.error(`[API Error]: ${userFriendlyMessage}`, errorBody?.error?.details);

      return throwError(() => new Error(userFriendlyMessage));
    })
  );
};
