import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { IErrorResponse } from '@core/models/iremote-service-error';
import { resolveBusinessError } from '@core/utilities/business-error.util';
import { catchError, throwError } from 'rxjs';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorBody = typeof error.error === 'object' ? error.error as IErrorResponse : null;
      const remoteError = errorBody?.error;
      const resolvedBusinessError = resolveBusinessError(remoteError);
      let userFriendlyMessage = 'UNEXPECTED_ERROR';
      if (error.status === 0) {
        userFriendlyMessage = 'ERRORS.SERVER_UNREACHABLE_OR_CORS';
      }
      else if (remoteError?.message) {
        userFriendlyMessage = remoteError.message;
      }
      if (resolvedBusinessError) {
        userFriendlyMessage = resolvedBusinessError.message;
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
        isBusinessException: !!resolvedBusinessError,
      });
      return throwError(() => enhancedError);
    })
  );
};

