export interface IJobLevel {
  id?: string;
  levelOrder?: number;
  nameAr: string;
  employeeCount: number;
  departmentId: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
}

export interface IJobLevelResponse {
  data: IJobLevel[];
  total: number;
  page: number;
  limit: number;
}

export interface IJobLevelForm {
  levelOrder: number | null;
  name: string;
  description: string;
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
  searchTerm?: string;
  isActive?: boolean; // convert status to isActive
}
export interface IJobLevelApiResponse {
  levelOrder: number;
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

export interface IJobLevelApiListResponse {
  totalCount: number;
  items: IJobLevelApiResponse[];
}
