export type VacationStatus = 'EMPLOYEES.VACATIONS.APPROVED'
  | 'EMPLOYEES.VACATIONS.PENDING'
  | 'EMPLOYEES.VACATIONS.REJECTED'
  | 'EMPLOYEES.VACATIONS.CANCELLED';

export interface IVacation {
  id: string;
  empId:string;
  typeAr: string;
  startDate: string;
  endDate: string;
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
  type: number;
  description?: string | null;
  status: number;
}

export interface IEmployeeLeaveOverviewApiResponse {
  annualBalance: number;
  sickBalance: number;
  remainingBalance: number;
  totalCount: number;
  items: ILeaveApplicationApiDto[];
}
