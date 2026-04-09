import { IPermission } from '@features/attendance/models/iattendance';

export const MOCK_PERMISSIONS: IPermission[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    type: 'permission',
    date: '2026-04-10',
    reason: 'Doctor Appointment',
    status: 'approved',
  },
];
