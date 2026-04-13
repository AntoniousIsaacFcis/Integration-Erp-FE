export interface IDepartment {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  status: 'active' | 'inactive';
  managerStaffIds: string[];
  employeeStaffIds: string[];
}

export interface IDepartmentResponse {
  data: IDepartment[];
  total: number;
  page: number;
  limit: number;
}

export interface IDepartmentApiItem {
  name: string;
  abbreviation?: string;
  description?: string;
  isActive?: boolean;
  managerStaffIds?: string[];
  employeeStaffIds?: string[];
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

export interface IDepartmentStaffOption {
  id: string;
  fullNameAr: string;
  fullNameEn: string;
  displayName: string;
}

export interface CreateDepartmentDTO {
  name: string;
  abbreviation?: string;
  description?: string;
  status: 'active' | 'inactive';
  managerStaffIds: string[];
  employeeStaffIds: string[];
}
