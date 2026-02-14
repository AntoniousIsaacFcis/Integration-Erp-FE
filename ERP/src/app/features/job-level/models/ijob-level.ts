export interface IJobLevel {
  id?: string;
  nameAr: string;
  employeeCount: number;
  departmentId: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
}
export type CreateJobLevelDTO = Omit<IJobLevel, 'id' | 'employeeCount' | 'createdAt'>;

export interface IJobLevelResponse {
  data: IJobLevel[];
  total: number;
  page: number;
  limit: number;
}

export interface IJobLevelForm {
  nameAr: string;
  departmentId: number | null;
  status: 'active' | 'inactive';
  description?: string;
}
