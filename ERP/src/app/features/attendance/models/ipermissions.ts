import { IDocument } from "@shared/models/idocument";

export type PermissionType = 'leave' | 'halfLeave' | 'lateArrival' | 'earlyLeave' | 1 | 2 | 3 | 4;

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
  fromDate: string;
  toDate: string;
  applicationDate: string;
  type: number;
  leaveTypeId?: string | null;
  leaveTypeName?: string | null;
  leaveCount: number;
  durationMinutes?: number | null;
  note?: string | null;
  status: number;
  leaveApplicationId?: string | null;
  attendanceFlagId?: string | null;
  attendanceSheetId?: string | null;
}

export interface IAttendancePermissionListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  dateRange: string;
  type: number;
  typeLabelKey: string;
  leaveTypeName: string | null;
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
