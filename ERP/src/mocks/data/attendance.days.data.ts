import { IAttendanceLog } from '@features/attendance/models/iattendance';

export const MOCK_ATTENDANCE_LOGS: IAttendanceLog[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'محمد علي',
    department: 'الموارد البشرية',
    date: '2026-03-25',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present',
  },
];
