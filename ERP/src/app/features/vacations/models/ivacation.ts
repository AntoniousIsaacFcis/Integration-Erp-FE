export type VacationStatus = 'EMPLOYEES.VACATIONS.APPROVED'
  | 'EMPLOYEES.VACATIONS.PENDING'
  | 'EMPLOYEES.VACATIONS.REJECTED';

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
