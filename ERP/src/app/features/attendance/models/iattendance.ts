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
  type: 'holiday' | 'permission' | 'excuse';
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
export interface IEditAttendanceDay {
  id: string;
  employeeName: string; // غالباً للعرض فقط
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  shiftStart: string;
  shiftEnd: string;
  checkIn: string | null;
  checkOut: string | null;
}
//for attendnce-log-page(readonly)
export interface IAttendanceDetails extends IEditAttendanceDay {
  sessionNumber?: string;
  source?: string;
}

export type IUpdateAttendancePayload = Omit<IEditAttendanceDay, 'employeeName'>;

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
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  departmentAr: string;
  status: 'active' | 'inactive';
  type: string;
}

export interface ISpecialShiftListResponse {
  data: ISpecialShiftListItem[];
  total: number;
  page: number;
  limit: number;
}

