import { IAttendanceDay } from '@features/attendance/models/iattendance';

export const MOCK_ATTENDANCE_DATA: Record<string, Record<string, Record<string, IAttendanceDay[]>>> = {
  '1': {
    '2025': {
      '10': [
        {
          dayName: 'DAYS.WEDNESDAY',
          dayNumber: 1,
          isWorkDay: true,
          checkIn: '09:00',
          checkOut: '17:00',
          statusText: 'STATUS.WORK',
        },
      ],
    },
  },
};
