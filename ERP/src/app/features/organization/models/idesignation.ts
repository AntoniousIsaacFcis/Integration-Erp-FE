export interface IDesignation {
  id: string;
  name: string;
  departmentId: string | null;
  description?: string;
  status: 'active' | 'inactive';
}

export interface IDesignationResponse {
  data: IDesignation[];
  total: number;
  page: number;
  limit: number;
}

export interface IDesignationApiItem {
  name: string;
  departmentId?: string | null;
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

export interface IDesignationApiResponse {
  totalCount: number;
  items: IDesignationApiItem[];
}

export interface IDesignationLookupItem {
  id: string;
  departmentId: string | null;
  displayName: string;
}

export type CreateDesignationDTO = Omit<IDesignation, 'id'>;
