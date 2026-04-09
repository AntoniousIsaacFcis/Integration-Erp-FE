import { ISalaryResponse } from '@features/core-hr/models/isalary';

export const MOCK_SALARY_STORE: Record<string, Record<string, Record<string, ISalaryResponse>>> = {
  '1': {
    '2025': {
      '10': {
        summary: { monthlySalary: 10500, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    },
  },
};
