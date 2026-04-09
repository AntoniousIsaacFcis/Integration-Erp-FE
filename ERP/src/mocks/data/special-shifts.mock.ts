import { ISpecialShiftListItem } from '@features/attendance/models/iattendance';

export const SPECIAL_SHIFTS_MOCK: ISpecialShiftListItem[] = [
  {
    id: '1',
    nameAr: 'مناوبة ليلية - رمضان',
    nameEn: 'Night Shift - Ramadan',
    startDate: '2026-03-01',
    endDate: '2026-03-30',
    departmentAr: 'البرمجة',
    status: 'active',
    type: 'ليلي',
  },
];
