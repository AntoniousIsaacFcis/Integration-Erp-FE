import { IVacation, IVacationStats } from '@features/attendance/models/ivacation';

export const MOCK_VACATIONS_STORE: Record<string, { stats: IVacationStats; data: IVacation[] }> = {
  '1': {
    stats: { annualBalance: 21, sickBalance: 9, remainingBalance: 4 },
    data: [
      {
        id: 'v1-1',
        empId: '1',
        typeLabel: 'إجازة سنوية',
        typeLabelIsTranslationKey: false,
        startDate: '2025-10-20',
        endDate: '2025-10-29',
        status: 'EMPLOYEES.VACATIONS.APPROVED',
        reason: 'سفر عائلي',
      },
    ],
  },
};
