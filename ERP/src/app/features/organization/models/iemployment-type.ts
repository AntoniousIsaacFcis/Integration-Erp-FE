export interface IEmploymentType {
  id: string;
  employmentTypeAr: string;
  employmentTypeEn: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  description?: string;
}

export interface IEmploymentTypeResponse {
  data: IEmploymentType[];
  total: number;
  page: number;
  limit: number;
}

export type CreateEmploymentTypeDTO = Omit<IEmploymentType, 'id' | 'employeeCount'>;
