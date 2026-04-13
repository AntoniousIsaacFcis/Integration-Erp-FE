export interface IDepartment {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface IDepartmentResponse {
  data: IDepartment[];
  total: number;
  page: number;
  limit: number;
}

export interface IDepartmentApiItem {
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

export interface IDepartmentApiResponse {
  totalCount: number;
  items: IDepartmentApiItem[];
}

export interface IDepartmentLookupItem {
  id: string;
  displayName: string;
}

export type CreateDepartmentDTO = Omit<IDepartment, 'id'>;
