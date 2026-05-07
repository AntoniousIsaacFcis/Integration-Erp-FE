export interface IAttendance {
}

export interface IAttendanceDay {
  dayName: 'DAYS.SATURDAY' | 'DAYS.SUNDAY' | 'DAYS.MONDAY' | 'DAYS.TUESDAY' | 'DAYS.WEDNESDAY' | 'DAYS.THURSDAY' | 'DAYS.FRIDAY';
  dayNumber: number;
  date?: string;
  isWorkDay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  statusText: string;
  status?: 'present' | 'absent' | 'onLeave' | 'empty';
  workedMinutes?: number;
  delayMinutes?: number;
  earlyLeaveMinutes?: number;
  leaveCount?: number;
  shiftId?: string | null;
  dayOffReason?: number | null;
  notes?: string | null;
}

export interface IAttendanceDayApiDto {
  id: string;
  employeeId: string;
  shiftId?: string | null;
  date: string;
  status: number;
  dayOffReason?: number | null;
  onDutyTime?: string | null;
  offDutyTime?: string | null;
  signInTime?: string | null;
  signOutTime?: string | null;
  calculationType: number;
  workedMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  calculatedAt?: string | null;
  leaveTypeId?: string | null;
  leaveCount: number;
  notes?: string | null;
  attendanceSheetId?: string | null;
  attendancePermissionId?: string | null;
}

export interface IAttendanceDayListResponse {
  items: IAttendanceDayApiDto[];
  totalCount: number;
}

export interface ICreateAttendanceDayPayload {
  employeeId: string;
  shiftId?: string | null;
  date: string;
  status: number;
  dayOffReason?: number | null;
  onDutyTime?: string | null;
  offDutyTime?: string | null;
  signInTime?: string | null;
  signOutTime?: string | null;
  calculationType: number;
  workedMinutes?: number | null;
  delayMinutes?: number | null;
  earlyLeaveMinutes?: number | null;
  leaveTypeId?: string | null;
  leaveCount: number;
  notes?: string | null;
  attendanceSheetId?: string | null;
  attendancePermissionId?: string | null;
}

export interface IAttendanceLogApiDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string | null;
  logDateTime: string;
  direction: 1 | 2 | number;
  source: number;
  status: number;
  sessionId?: string | null;
  attendanceDate?: string | null;
  attendanceDayId?: string | null;
  attendanceLogSessionId?: string | null;
  attendanceMachineId?: string | null;
  sourceId?: string | null;
  sourceName?: string | null;
  sourceType?: string | null;
  sourceMethod?: string | null;
  invalidReason?: string | null;
}

export interface IAttendanceLogSignRequest {
  employeeId: string;
  sessionId: string;
}

export interface IAttendanceLogSignResult {
  id: string;
  employeeName: string;
  logDateTime: string;
}

export interface IAttendanceLogListResponse {
  items: IAttendanceLogApiDto[];
  totalCount: number;
}

export interface IAttendanceLogSessionApiDto {
  id: string;
  code: string;
  sessionDate: string;
  openedAt: string;
  closedAt?: string | null;
  signsCount: number;
  status: number;
  sourceName?: string | null;
  sourceType?: string | null;
  notes?: string | null;
}

export interface ICreateAttendanceLogSessionPayload {
  code?: string | null;
  sessionDate: string;
  openedAt?: string | null;
  sourceName?: string | null;
  sourceType?: string | null;
  notes?: string | null;
}

export interface IUpdateAttendanceLogSessionPayload {
  code: string;
  sessionDate: string;
  openedAt?: string | null;
  sourceName?: string | null;
  sourceType?: string | null;
  notes?: string | null;
}

export interface IAttendanceLogSessionListResponse {
  items: IAttendanceLogSessionApiDto[];
  totalCount: number;
}

export interface IAttendanceLogSessionListItem {
  id: string;
  code: string;
  sessionDate: string;
  openedAt: string;
  closedAt: string | null;
  sourceDisplay: string;
  sourceLabelKey: string;
  signsCount: number;
  status: number;
  statusLabelKey: string;
  statusTone: string;
  notes?: string | null;
}

export interface IAttendanceLogSessionListViewResponse {
  data: IAttendanceLogSessionListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IAttendanceLogListItem {
  id: string;
  employeeName: string;
  employeeCode?: string | null;
  logDateTime: string;
  sourceDisplay: string;
  sourceLabelKey: string;
  sessionId: string;
  status: number;
  statusLabelKey: string;
  statusTone: string;
  invalidReason?: string | null;
}

export interface IAttendanceLogListViewResponse {
  data: IAttendanceLogListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IAttendanceAvailablePeriod {
  year: number;
  months: number[];
}

export interface DayConfig {
  day: string;
  label: string;
  isWorkDay: boolean;
  calculateOnHoliday: boolean;
  onDutyTimeOverride: string | null;
  offDutyTimeOverride: string | null;
  signInStartTimeOverride: string | null;
  signInEndTimeOverride: string | null;
  signOutStartTimeOverride: string | null;
  signOutEndTimeOverride: string | null;
  lateToleranceMinutes: number | null;
}

export interface IShift {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  type: number | string;
  isActive: boolean;
  onDutyTime?: string;
  offDutyTime?: string;
  signInStartTime?: string;
  signInEndTime?: string;
  signOutStartTime?: string;
  signOutEndTime?: string;
  lateToleranceMinutes?: number;
  lateStartRule?: number;
  days?: IShiftDay[];
  creationTime?: string;
  status: 'active' | 'inactive';
}

export interface IShiftDay {
  id?: string;
  dayOfWeek: number;
  isWorkDay: boolean;
  calculateAttendanceOnOffDay?: boolean;
  onDutyTimeOverride?: string | null;
  offDutyTimeOverride?: string | null;
  signInStartTimeOverride?: string | null;
  signInEndTimeOverride?: string | null;
  signOutStartTimeOverride?: string | null;
  signOutEndTimeOverride?: string | null;
  lateToleranceMinutes?: number | null;
}

export interface IAttendanceRelatedShift {
  id: string;
  name: string;
  onDutyTime: string;
  offDutyTime: string;
}

export interface IPermission {
  id: string;
  employeeId: string;
  type: 'leave' | 'halfLeave' | 'lateArrival' | 'earlyLeave' | 1 | 2 | 3 | 4;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface IAttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'onLeave';
  workedMinutes?: number;
  delayMinutes?: number | null;
  earlyLeaveMinutes?: number | null;
  leaveCount?: number | null;
}

export interface IAttendanceResponse {
  data: IAttendanceLog[];
  total: number;
  page: number;
  limit: number;
}
export interface IEditAttendanceDay {
  id: string;
  employeeId: string;
  employeeName: string; // غالباً للعرض فقط
  date: string;
  status: 'present' | 'absent' | 'onLeave';
  shiftId?: string | null;
  shiftName?: string | null;
  shiftStart: string;
  shiftEnd: string;
  checkIn: string | null;
  checkOut: string | null;
  leaveTypeId?: string | null;
  notes?: string | null;
}
//for attendnce-log-page(readonly)
export interface IAttendanceDetails extends IEditAttendanceDay {
  sessionNumber?: string;
  source?: string;
}

export interface IAttendanceLogDetails {
  id: string;
  employeeName: string;
  employeeCode?: string | null;
  logDateTime: string;
  logDate: string;
  logTime: string;
  sourceDisplay: string;
  sourceLabelKey: string;
  sessionId: string;
  status: number;
  statusLabelKey: string;
  statusTone: string;
  invalidReason?: string | null;
}

export type IUpdateAttendancePayload = Omit<IEditAttendanceDay, 'employeeName' | 'shiftName'>;

export interface IShiftPayload {
  name: string;
  type: number;
  isActive: boolean;
  onDutyTime: string;
  offDutyTime: string;
  signInStartTime: string;
  signInEndTime: string;
  signOutStartTime: string;
  signOutEndTime: string;
  lateToleranceMinutes: number;
  lateStartRule: number;
  days: IShiftDayInput[];
}

export interface IShiftDayInput {
  dayOfWeek: number;
  isWorkDay: boolean;
  calculateAttendanceOnOffDay: boolean;
  onDutyTimeOverride: string | null;
  offDutyTimeOverride: string | null;
  signInStartTimeOverride: string | null;
  signInEndTimeOverride: string | null;
  signOutStartTimeOverride: string | null;
  signOutEndTimeOverride: string | null;
  lateToleranceMinutes: number | null;
}

//for view page
export interface IShiftListItem {
  id: string;
  name?: string;
  nameAr: string;
  nameEn: string;
  type: string;
  isActive?: boolean;
  days?: IShiftDay[];
  daysCount: number;
  employeeCount?: number;
  holidayDaysCount?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}
export interface IShiftListResponse {
  data: IShiftListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IShiftApiListResponse {
  items: IShift[];
  totalCount: number;
}

export interface ICustomShiftForm {
  shiftName: string;
  startDate: string;
  assignedShiftId: string;
  status: 'active' | 'inactive';
  assignmentMethod: 'rules' | 'manual';
  departmentId: string;
  jobTitleId: string;
  excludedEmployeeIds: string[];
}

export interface IShiftAssignmentPayload {
  name: string;
  assignedShiftId: string;
  startDate: string;
  isActive: boolean;
  criteriaType: 1 | 2;
  priority: number;
  departmentId: string | null;
  designationId: string | null;
  currentShiftId: string | null;
  employeeIds: string[];
  excludedEmployeeIds: string[];
}

export interface IShiftAssignment {
  id: string;
  name: string;
  assignedShiftId: string;
  assignedShiftName?: string | null;
  startDate: string;
  isActive: boolean;
  criteriaType: 1 | 2 | number;
  priority: number;
  departmentId?: string | null;
  designationId?: string | null;
  currentShiftId?: string | null;
  employeeIds: string[];
  excludedEmployeeIds: string[];
  creationTime?: string;
}

export interface IShiftAssignmentApiListResponse {
  items: IShiftAssignment[];
  totalCount: number;
}

export interface IShiftOption {
  id: string;
  displayName: string;
}

export interface ISpecificShiftDetails extends ICustomShiftForm {
  id: string;
  createdAt: string;
  departmentNameAr?: string;
  departmentNameEn?: string;
  jobTitleAr?: string;
  jobTitleEn?: string;
  excludedEmployees: Array<{ id: string; name: string }>;
}

export interface ISpecialShiftListItem {
  id: string;
  name?: string;
  nameAr: string;
  nameEn: string;
  assignedShiftName?: string | null;
  startDate: string;
  criteriaType?: number;
  priority?: number;
  isActive?: boolean;
  employeeCount?: number;
  excludedEmployeeCount?: number;
  departmentAr?: string;
  status?: 'active' | 'inactive';
  type?: string;
}

export interface ISpecialShiftListResponse {
  data: ISpecialShiftListItem[];
  total: number;
  page: number;
  limit: number;
}

