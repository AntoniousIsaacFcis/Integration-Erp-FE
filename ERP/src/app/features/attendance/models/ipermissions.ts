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
