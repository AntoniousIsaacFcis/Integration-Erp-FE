import { AuthService } from '@core/auth/services/auth-service';
import { canAccess } from '@core/auth/utils/access-control';

export const ATTENDANCE_LOG_MANAGER_ROLES = ['admin', 'hr'];

export const ATTENDANCE_LOG_PERMISSIONS = {
  correct: 'Attendance.AttendanceLogs.Update',
  delete: 'Attendance.AttendanceLogs.Delete',
} as const;

export function canManageAttendanceLog(authService: AuthService, permission: string) {
  return canAccess(authService, {
    roles: ATTENDANCE_LOG_MANAGER_ROLES,
    allPolicies: [permission],
  });
}
