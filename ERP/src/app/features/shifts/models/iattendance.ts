export interface IAttendance {
}

export interface IAttendanceDay {
  dayName: 'DAYS.SATURDAY' | 'DAYS.SUNDAY' | 'DAYS.MONDAY' | 'DAYS.TUESDAY' | 'DAYS.WEDNESDAY' | 'DAYS.THURSDAY' | 'DAYS.FRIDAY';
  dayNumber: number;
  isWorkDay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  statusText: string;
}
export interface DayConfig {
  day: string;
  label: string;
  isWorkDay: boolean;
  calculateOnHoliday: boolean;
}

export interface IShift {
  id: string;
  nameAr: string;
  nameEn: string;
  startTime: string;
  endTime: string;
  workDays: string[]; // ['sunday', 'monday']
  status: 'active' | 'inactive';
}

export interface IPermission {
  id: string;
  employeeId: string;
  type: 'late' | 'early_leave' | 'excuse';
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
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface IAttendanceResponse {
  data: IAttendanceLog[];
  total: number;
  page: number;
  limit: number;
}

export interface IShiftPayload {
  name: string;
  type: 'daily' | 'weekly';
  workDays: DayConfig[];
  workStart: string;
  workEnd: string;
  checkInStart: string;
  checkInEnd: string;
  gracePeriod?: number;
}

//for view page
export interface IShiftListItem {
  id: string;
  nameAr: string;
  nameEn: string;
  type: string; // مثل 'ليلي' أو 'صباحي'
  daysCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}
export interface IShiftListResponse {
  data: IShiftListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ICustomShiftForm {
  shiftName: string;
  startDate: string;
  endDate: string;
  assignedShiftId: string;
  status: 'active' | 'inactive';
  assignmentMethod: 'rules' | 'manual';
  departmentId: string;
  jobTitleId: string;
  excludedEmployeeIds: string[];
}
