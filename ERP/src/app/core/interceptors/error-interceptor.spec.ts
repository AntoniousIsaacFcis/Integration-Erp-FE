import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';
import { errorInterceptor } from './error-interceptor';
describe('errorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptor(req, next));
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });
  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
  it('keeps mapped CoreHR business exceptions as business errors even when the status is 403', async () => {
    const request = new HttpRequest('PUT', '/api/core-hR/staff/1');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({
      status: 403,
      error: {
        error: {
          code: 'CoreHR:StaffSystemAccessUserAlreadyExists',
          message: 'A system user already exists with the same email.',
        },
      },
    }));
    try {
      await firstValueFrom(interceptor(request, next));
      fail('Expected the interceptor to rethrow an error.');
    } catch (error: any) {
      expect(error.message).toBe('ERRORS.STAFF_SYSTEM_ACCESS_USER_ALREADY_EXISTS');
      expect(error.status).toBe(403);
      expect(error.code).toBe('CoreHR:StaffSystemAccessUserAlreadyExists');
      expect(error.isBusinessException).toBeTrue();
    }
  });
  it('preserves CoreHR business error data for future UX handling', async () => {
    const request = new HttpRequest('POST', '/api/core-hR/leave-application');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({
      status: 403,
      error: {
        error: {
          code: 'CoreHR:LeaveStartDateInPast',
          message: 'Leave start date cannot be in the past.',
          data: {
            DateFrom: '2026-04-30',
            Today: '2026-05-11',
          },
        },
      },
    }));
    try {
      await firstValueFrom(interceptor(request, next));
      fail('Expected the interceptor to rethrow an error.');
    } catch (error: any) {
      expect(error.message).toBe('ERRORS.LEAVE_START_DATE_IN_PAST');
      expect(error.data).toEqual({
        DateFrom: '2026-04-30',
        Today: '2026-05-11',
      });
      expect(error.isBusinessException).toBeTrue();
    }
  });
  it('keeps generic permission denied for real forbidden responses without a business code', async () => {
    const request = new HttpRequest('GET', '/api/core-hR/staff/1');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({
      status: 403,
      error: {
        error: {
          message: 'Forbidden',
        },
      },
    }));
    try {
      await firstValueFrom(interceptor(request, next));
      fail('Expected the interceptor to rethrow an error.');
    } catch (error: any) {
      expect(error.message).toBe('AUTH.ERRORS.PERMISSION_DENIED');
      expect(error.isBusinessException).toBeFalse();
    }
  });
  it('preserves the existing attendance business mapping', async () => {
    const request = new HttpRequest('POST', '/api/attendance/attendance-day');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({
      status: 403,
      error: {
        error: {
          code: 'Attendance:AttendanceDayAlreadyExists',
          message: 'Attendance day already exists.',
        },
      },
    }));
    try {
      await firstValueFrom(interceptor(request, next));
      fail('Expected the interceptor to rethrow an error.');
    } catch (error: any) {
      expect(error.message).toBe('ATTENDANCE.ATTENDANCE_DAY_ALREADY_EXISTS');
      expect(error.isBusinessException).toBeTrue();
    }
  });
});
