import { IDocument } from "@shared/models/idocument";

export type PermissionType = 'lateArrival' | 'earlyLeave' | 1 | 2;

export interface ICreatePermissionRequest {
  employeeId: string;
  calender: string;
  type: PermissionType;
  leaveType?: string;
  fromDate: string;
  toDate: string;
  applayDate: string;
  notes?: string;
  attachedFiles?: [IDocument]
}

export type AttendancePermissionType = 1 | 2;

export interface ICreateAttendancePermissionPayload {
  employeeId: string;
  date: string;
  durationMinutes: number;
  note?: string | null;
  type: AttendancePermissionType;
  applicationDate?: string | null;
  status?: number;
}

export interface IPermission {
  id: string;
  employeeId: string;
  type: PermissionType;
  date: string; // لاحظ الفرق هنا
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface IAttendancePermissionApiDto {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  employeeCode?: string | null;
  date: string;
  durationMinutes: number;
  type: AttendancePermissionType;
  note?: string | null;
  applicationDate?: string | null;
  status: number;
}

export interface IAttendancePermissionListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  dateRange: string;
  durationMinutes: number;
  type: AttendancePermissionType;
  typeLabelKey: string;
  status: number;
  statusLabelKey: string;
  statusTone: string;
}

export interface IAttendancePermissionListResponse {
  data?: IAttendancePermissionListItem[];
  total?: number;
  items?: IAttendancePermissionApiDto[];
  totalCount?: number;
  page?: number;
  limit?: number;
}

