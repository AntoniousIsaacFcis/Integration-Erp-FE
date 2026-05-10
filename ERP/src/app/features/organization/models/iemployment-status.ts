export interface IEmploymentStatus {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  creationTime?: string;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  deletionTime?: string | null;
  deleterId?: string | null;
  isDeleted?: boolean;
}

export interface IEmploymentStatusRow extends IEmploymentStatus {
  status: 'active' | 'inactive';
}

export interface IEmploymentStatusApiItem {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  deleterId: string | null;
  deletionTime: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string | null;
}

export interface IEmploymentStatusApiResponse {
  totalCount: number;
  items: IEmploymentStatusApiItem[];
}

export interface IEmploymentStatusListResponse {
  data: IEmploymentStatusRow[];
  total: number;
  page: number;
  limit: number;
}

export interface IGetEmploymentStatusListInput {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive' | '';
}

export interface ICreateEmploymentStatus {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IUpdateEmploymentStatus extends ICreateEmploymentStatus {}
