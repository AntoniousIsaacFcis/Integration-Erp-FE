export type VacationStatus = 'EMPLOYEES.VACATIONS.APPROVED'
  | 'EMPLOYEES.VACATIONS.PENDING'
  | 'EMPLOYEES.VACATIONS.REJECTED'
  | 'EMPLOYEES.VACATIONS.CANCELLED';

export interface IVacation {
  id: string;
  empId:string;
  typeLabel: string;
  typeLabelIsTranslationKey: boolean;
  applicationDate?: string | null;
  startDate: string;
  endDate: string | null;
  status: VacationStatus;
  reason: string;
}

export interface IVacationStats {
  annualBalance: number;
  sickBalance: number;
  remainingBalance: number;
}

export interface IVacationResponse {
  data: IVacation[];
  stats: IVacationStats;
  total: number;
  page: number;
  limit: number;
}

export interface ILeaveApplicationApiDto {
  id: string;
  staffId: string;
  leaveTypeId?: string | null;
  leaveTypeName?: string | null;
  days: number;
  dateFrom: string;
  dateTo: string;
  applicationDate?: string | null;
  creationTime?: string | null;
  creationDate?: string | null;
  type: number;
  shiftName?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  durationMinutes?: number | null;
  lateTime?: string | null;
  earlyTime?: string | null;
  description?: string | null;
  attachments?: string | null;
  status: number;
}

export interface ILeaveApplicationUpdatePayload {
  staffId: string;
  leaveTypeId: string | null;
  days: number;
  dateFrom: string;
  dateTo: string;
  applicationDate: string | null;
  type: number;
  durationMinutes: number | null;
  lateTime: string | null;
  earlyTime: string | null;
  description: string | null;
  attachments: string | null;
  status: number;
}

export interface ILeaveApplicationListApiResponse {
  items: ILeaveApplicationApiDto[];
  totalCount: number;
}

export interface ILeaveApplicationListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  dateFrom: string;
  dateTo: string;
  type: number;
  leaveTypeName?: string | null;
  typeLabelKey: string;
  dateRange: string;
  status: number;
}

export interface ILeaveApplicationListViewResponse {
  data: ILeaveApplicationListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IEmployeeLeaveOverviewApiResponse {
  annualBalance: number;
  sickBalance: number;
  remainingBalance: number;
  totalCount: number;
  items: ILeaveApplicationApiDto[];
}

export interface ILeaveTypeApiDto {
  id: string;
  code?: string | null;
  name: string;
  maxDaysPerYear?: number | null;
}

export interface ILeaveTypeListResponse {
  items: ILeaveTypeApiDto[];
  totalCount: number;
}

