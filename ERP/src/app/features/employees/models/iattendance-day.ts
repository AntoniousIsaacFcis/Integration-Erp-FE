export interface IAttendanceDay {
  dayName: 'DAYS.SATURDAY' | 'DAYS.SUNDAY' | 'DAYS.MONDAY' | 'DAYS.TUESDAY' | 'DAYS.WEDNESDAY' | 'DAYS.THURSDAY' | 'DAYS.FRIDAY';
  dayNumber: number;
  isWorkDay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  statusText: string;
}
