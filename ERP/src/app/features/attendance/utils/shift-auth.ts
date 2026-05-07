import { AuthService } from '@core/auth/services/auth-service';
import { canAccess } from '@core/auth/utils/access-control';

export const SHIFT_MANAGER_ROLES = ['admin', 'hr'];

export const SHIFT_PERMISSIONS = {
  create: 'Attendance.Shifts.Create',
  update: 'Attendance.Shifts.Update',
  delete: 'Attendance.Shifts.Delete',
  assignmentCreate: 'Attendance.ShiftAssignments.Create',
  assignmentUpdate: 'Attendance.ShiftAssignments.Update',
  assignmentDelete: 'Attendance.ShiftAssignments.Delete',
} as const;

export function canManageShift(authService: AuthService, permission: string) {
  return canAccess(authService, {
    roles: SHIFT_MANAGER_ROLES,
    allPolicies: [permission],
  });
}
