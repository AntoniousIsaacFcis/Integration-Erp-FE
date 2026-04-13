export interface IEmploymentType {
  id: string;
  name: string; // Full Time or Part Time or Contractor or Internship or Temporary
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
