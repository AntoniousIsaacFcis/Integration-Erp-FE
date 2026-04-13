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

export interface IEmploymentTypeApiItem {
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  deleterId: string | null;
  deletionTime: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string | null;
  id: string;
}

export interface IEmploymentTypeApiResponse {
  totalCount: number;
  items: IEmploymentTypeApiItem[];
}

export type CreateEmploymentTypeDTO = Omit<IEmploymentType, 'id' | 'employeeCount'>;
