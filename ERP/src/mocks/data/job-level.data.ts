import { IEmployeeLevelTableItem } from '@features/organization/models/iemployee-level';

export const JOB_LEVELS_MOCK_DATA: IEmployeeLevelTableItem[] = [
  {
    id: '1',
    levelOrder: 1,
    nameAr: 'مدير عام',
    employeeCount: 30,
    departmentId: '1',
    status: 'active',
    description: 'مسؤول عن الإدارة العامة',
    createdAt: '2026-01-01',
  },
];
