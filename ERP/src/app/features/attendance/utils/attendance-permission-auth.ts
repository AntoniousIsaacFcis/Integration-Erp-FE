import { AuthService } from '@core/auth/services/auth-service';

export const REQUEST_MANAGER_ROLES = ['admin', 'hr'] as const;
export const ATTENDANCE_PERMISSION_ROLES = [...REQUEST_MANAGER_ROLES];

export const LEAVE_APPLICATION_PERMISSIONS = {
  update: 'CoreHR.LeaveApplications.Update',
  delete: 'CoreHR.LeaveApplications.Delete',
  approve: 'CoreHR.LeaveApplications.Approve',
  reject: 'CoreHR.LeaveApplications.Reject',
} as const;

export const ATTENDANCE_PERMISSION_PERMISSIONS = {
  update: 'Attendance.AttendancePermissions.Update',
  delete: 'Attendance.AttendancePermissions.Delete',
  approve: 'Attendance.AttendancePermissions.Approve',
  reject: 'Attendance.AttendancePermissions.Reject',
} as const;

export function isEmployeeScopedUser(authService: AuthService) {
  const roles = authService.currentUser()?.roles ?? [];
  const normalizedRoles = roles.map((role: string) => role.toLowerCase());

  return normalizedRoles.includes('employee') && !REQUEST_MANAGER_ROLES.some(role => normalizedRoles.includes(role));
}

export function isRequestManager(authService: AuthService) {
  const roles = authService.currentUser()?.roles ?? [];
  const normalizedRoles = roles.map((role: string) => role.toLowerCase());

  return REQUEST_MANAGER_ROLES.some(role => normalizedRoles.includes(role));
}

export function canEditWorkflowRequest(authService: AuthService, permission: string, status: number) {
  if (!authService.hasPermission(permission)) {
    return false;
  }

  return isRequestManager(authService) || status === 1;
}

export function canDeleteWorkflowRequest(authService: AuthService, permission: string, status: number) {
  if (!authService.hasPermission(permission)) {
    return false;
  }

  return isRequestManager(authService) || status === 1;
}

export function canApproveWorkflowRequest(authService: AuthService, permission: string, status: number) {
  return status === 1 &&
    isRequestManager(authService) &&
    authService.hasPermission(permission);
}

export function canRejectWorkflowRequest(authService: AuthService, permission: string, status: number) {
  return status === 1 &&
    isRequestManager(authService) &&
    authService.hasPermission(permission);
}
