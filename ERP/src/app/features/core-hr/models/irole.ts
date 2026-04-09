export interface IRole {
  id: string;
  name: string;
  description?: string;
  status: IRoleStatus;
  userCount: number;
  type?: string;
  createdAt: string;
}

export type IRoleStatus = 'active' | 'inactive';

export interface ICreateRoleRequest {
  name: string;
  type: string;
  description: string;
  status: IRoleStatus;
  permissions: string[];
}

export interface IPermissionAction {
  key: string;
  label: string;
  enabled: boolean;
}

export interface IPermissionCategory {
  id: string;
  categoryName: string;
  icon?: string;
  permissions: IPermissionAction[];
}

export interface IRoleDetails extends IRole {
  permissionCategories: IPermissionCategory[];
}

export interface IRolesResponse {
  data: IRole[];
  total: number;
}
