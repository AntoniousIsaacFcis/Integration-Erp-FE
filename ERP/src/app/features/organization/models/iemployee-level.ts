export interface IEmployeeLevel {
  id: string;
  levelOrder: number;
  name: string;
  description?: string;
  isActive?: boolean;

  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
}

export interface IEmployeeLevelTableItem {
  id?: string;
  levelOrder?: number;
  nameAr: string;
  employeeCount: number;
  departmentId: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
}

export interface IEmployeeLevelListResponse {
  data: IEmployeeLevelTableItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IEmployeeLevelApiResponse {
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

export interface IEmployeeLevelApiListResponse {
  totalCount: number;
  items: IEmployeeLevelApiResponse[];
}

export type ICreateEmployeeLevel = Omit<
  IEmployeeLevel,
  'id' | 'creationTime' | 'creatorId' | 'lastModificationTime'
>;

export interface IUpdateEmployeeLevel extends ICreateEmployeeLevel {}
