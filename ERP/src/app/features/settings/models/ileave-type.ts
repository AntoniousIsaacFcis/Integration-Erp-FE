export interface ILeaveType {
  id: string;
  code: string;
  name: string;
  color: string;
  description: string;
  maxDaysPerYear: number | null;
  maxContinuousDaysApplicable: number | null;
  applicableAfterDays: number | null;
  requiresPermission: boolean;
  overrideWeekendOffDays: boolean;
  allowOutsideLeavePolicy: boolean;
  paid: boolean;
  creationTime?: string;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  deletionTime?: string | null;
  deleterId?: string | null;
  isDeleted?: boolean;
}

export interface ILeaveTypeApiItem {
  id: string;
  code?: string | null;
  name: string;
  color?: string | null;
  description?: string | null;
  maxDaysPerYear?: number | null;
  maxContinuousDaysApplicable?: number | null;
  applicableAfterDays?: number | null;
  requiresPermission?: boolean;
  overrideWeekendOffDays?: boolean;
  allowOutsideLeavePolicy?: boolean;
  paid?: boolean;
  creationTime: string;
  creatorId: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  deletionTime: string | null;
  deleterId: string | null;
  isDeleted?: boolean;
}

export interface ILeaveTypeApiResponse {
  totalCount: number;
  items: ILeaveTypeApiItem[];
}

export interface ILeaveTypeListResponse {
  data: ILeaveType[];
  total: number;
  page: number;
  limit: number;
}

export interface IGetLeaveTypeListInput {
  page: number;
  limit: number;
  search?: string;
}

export interface ICreateLeaveType {
  code?: string;
  name: string;
  color?: string;
  description?: string;
  maxDaysPerYear?: number | null;
  maxContinuousDaysApplicable?: number | null;
  applicableAfterDays?: number | null;
  requiresPermission: boolean;
  overrideWeekendOffDays: boolean;
  allowOutsideLeavePolicy: boolean;
  paid: boolean;
}

export interface IUpdateLeaveType extends ICreateLeaveType {}

export interface ILeaveTypeLookupItem {
  id: string;
  displayName: string;
  color?: string;
}
