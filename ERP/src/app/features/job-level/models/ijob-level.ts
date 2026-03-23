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
interface GetLevelsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive';
}

interface ApiQueryParams {
  page: number;
  limit: number;
  q?: string;           // or whatever your backend expects
  isDeleted?: boolean;  // convert status to isDeleted
}
export interface IJobLevelApiResponse {
  levelOrder: number;
  name: string;
  isDeleted: boolean;
  deleterId: string | null;
  deletionTime: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string | null;
  id: string;
}

export interface IJobLevelApiListResponse {
  totalCount: number;
  items: IJobLevelApiResponse[];
}
