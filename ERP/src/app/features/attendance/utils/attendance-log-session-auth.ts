import { AuthService } from '@core/auth/services/auth-service';
import { canAccess } from '@core/auth/utils/access-control';

export const ATTENDANCE_LOG_SESSION_MANAGER_ROLES = ['admin', 'hr'];

export const ATTENDANCE_LOG_SESSION_PERMISSIONS = {
  create: 'Attendance.AttendanceLogSessions.Create',
  update: 'Attendance.AttendanceLogSessions.Update',
  delete: 'Attendance.AttendanceLogSessions.Delete',
  close: 'Attendance.AttendanceLogSessions.Close',
  reopen: 'Attendance.AttendanceLogSessions.Reopen',
  takeEmployeeAttendance: 'Attendance.AttendanceLogs.TakeEmployeeAttendance',
} as const;

export function canManageAttendanceLogSession(authService: AuthService, permission: string) {
  return canAccess(authService, {
    roles: ATTENDANCE_LOG_SESSION_MANAGER_ROLES,
    allPolicies: [permission],
  });
}
