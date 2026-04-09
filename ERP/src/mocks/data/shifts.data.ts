import { IShiftListItem } from '@features/attendance/models/iattendance';

export const SHIFTS_MOCK_DATA: IShiftListItem[] = [
  {
    id: 'SHIFT-001',
    nameAr: 'الوردية الصباحية',
    nameEn: 'Morning Shift',
    type: 'صباحي',
    daysCount: 5,
    status: 'active',
    createdAt: '2026-01-15',
  },
];
