export interface IAttendanceMachine {
  id: string;
  name: string;
  code: string;
  serialNumber: string;
  machineType: string;
  hostName: string;
  port: number | null;
  description: string;
  importFilePath: string;
  webhookUrl: string;
  isActive: boolean;
  lastPullTime?: string | null;
  lastPullDate?: string | null;
  lastPullRecordCount: number;
  totalPulledSigns: number;
  lastPullError: string;
  creationTime?: string;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  deletionTime?: string | null;
  deleterId?: string | null;
  isDeleted?: boolean;
}

export interface IAttendanceMachineApiItem {
  id: string;
  name: string;
  code: string;
  serialNumber: string;
  machineType: string;
  hostName?: string | null;
  port?: number | null;
  description?: string | null;
  importFilePath?: string | null;
  webhookUrl?: string | null;
  isActive: boolean;
  lastPullTime?: string | null;
  lastPullDate?: string | null;
  lastPullRecordCount?: number;
  totalPulledSigns?: number;
  lastPullError?: string | null;
  creationTime?: string;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  deletionTime?: string | null;
  deleterId?: string | null;
  isDeleted?: boolean;
}

export interface IAttendanceMachineApiResponse {
  totalCount: number;
  items: IAttendanceMachineApiItem[];
}

export interface IAttendanceMachineListResponse {
  data: IAttendanceMachine[];
  total: number;
  page: number;
  limit: number;
}

export interface IGetAttendanceMachineListInput {
  page: number;
  limit: number;
  search?: string;
  sorting?: string;
  isActive?: boolean | null;
  machineType?: string;
}

export interface ICreateAttendanceMachine {
  name: string;
  code?: string;
  serialNumber?: string;
  machineType: string;
  hostName?: string;
  port?: number | null;
  description?: string;
  importFilePath?: string;
  webhookUrl?: string;
  isActive: boolean;
}

export interface IUpdateAttendanceMachine extends ICreateAttendanceMachine {}
