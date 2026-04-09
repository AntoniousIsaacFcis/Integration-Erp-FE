export interface IEmploymentType {
  id: string;
  employmentTypeAr: string; //Full Time or Part Time or Contractor or Internship or Temporary
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
