import { IRemoteServiceError } from '@core/models/iremote-service-error';
const BUSINESS_ERROR_PREFIXES = ['Attendance:', 'CoreHR:'];
const BUSINESS_ERROR_MESSAGE_MAP: Record<string, string> = {
  'Attendance:AttendanceDayAlreadyExists': 'ATTENDANCE.ATTENDANCE_DAY_ALREADY_EXISTS',
  'CoreHR:StaffSystemAccessUserAlreadyExists': 'ERRORS.STAFF_SYSTEM_ACCESS_USER_ALREADY_EXISTS',
  'CoreHR:LeaveStartDateInPast': 'ERRORS.LEAVE_START_DATE_IN_PAST',
};
export interface IResolvedBusinessError {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}
export function resolveBusinessError(remoteError?: IRemoteServiceError | null): IResolvedBusinessError | null {
  const code = remoteError?.code;
  if (!isBusinessExceptionCode(code)) {
    return null;
  }
  return {
    code,
    message: BUSINESS_ERROR_MESSAGE_MAP[code] ?? remoteError?.message ?? 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
    data: remoteError?.data,
  };
}
export function isBusinessExceptionCode(code?: string): code is string {
  return typeof code === 'string' && BUSINESS_ERROR_PREFIXES.some(prefix => code.startsWith(prefix));
}
