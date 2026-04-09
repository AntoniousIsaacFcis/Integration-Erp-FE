export interface IOrganizationLevel {
  id: string; // Required for trackBy, editing, and deleting
  levelOrder: number;
  name: string;
  description?: string;
  isActive?: boolean;
  // Audit properties (Read-only on Frontend)
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export interface IOrganizationLevelTableItem {
  id?: string;
  levelOrder?: number;
  nameAr: string;
  employeeCount: number;
  departmentId: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
}

export interface IOrganizationLevelListResponse {
  data: IOrganizationLevelTableItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IOrganizationLevelApiResponse {
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

export interface IOrganizationLevelApiListResponse {
  totalCount: number;
  items: IOrganizationLevelApiResponse[];
}

export type ICreateOrganizationLevel = Omit<
  IOrganizationLevel,
  'id' | 'creationTime' | 'creatorId' | 'lastModificationTime'
>;

export interface IUpdateOrganizationLevel extends ICreateOrganizationLevel {} // id passed via URL param
