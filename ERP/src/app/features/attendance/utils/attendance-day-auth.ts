import { AuthService } from '@core/auth/services/auth-service';
import { canAccess } from '@core/auth/utils/access-control';

export const ATTENDANCE_DAY_MANAGER_ROLES = ['admin', 'hr'];

export const ATTENDANCE_DAY_PERMISSIONS = {
  create: 'Attendance.AttendanceDays.Create',
  update: 'Attendance.AttendanceDays.Update',
  delete: 'Attendance.AttendanceDays.Delete',
} as const;

export function canManageAttendanceDay(authService: AuthService, permission: string) {
  return canAccess(authService, {
    roles: ATTENDANCE_DAY_MANAGER_ROLES,
    allPolicies: [permission],
  });
}
