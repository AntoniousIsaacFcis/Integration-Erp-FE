import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { IErrorResponse } from '@core/models/iremote-service-error';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorBody = typeof error.error === 'object' ? error.error as IErrorResponse : null;
      const remoteError = errorBody?.error;

      let userFriendlyMessage = 'UNEXPECTED_ERROR';

      if (error.status === 0) {
        userFriendlyMessage = 'SERVER_UNREACHABLE_OR_CORS';
      }
      else if (remoteError?.message) {
        userFriendlyMessage = remoteError.message;
      }

      if (remoteError?.code === 'Attendance:AttendanceDayAlreadyExists') {
        userFriendlyMessage = 'ATTENDANCE.ATTENDANCE_DAY_ALREADY_EXISTS';
      }
      else if (error.status === 400 || error.status === 401) {
        if (error.error?.error_description) {
          userFriendlyMessage = error.error.error_description;
        } else {
          userFriendlyMessage = 'INVALID_CREDENTIALS';
        }
      }
      else if (error.status === 403) {
        userFriendlyMessage = 'AUTH.ERRORS.PERMISSION_DENIED';
      }

      console.error(`Status: ${error.status}, Message: ${userFriendlyMessage}`);

      const enhancedError = new Error(userFriendlyMessage, { cause: remoteError?.details });

      Object.assign(enhancedError, {
        status: error.status,
        code: remoteError?.code,
        details: remoteError?.details,
        data: remoteError?.data,
        validationErrors: remoteError?.validationErrors,
        error: error.error,
        originalError: error,
      });

      return throwError(() => enhancedError);
    })
  );
};
