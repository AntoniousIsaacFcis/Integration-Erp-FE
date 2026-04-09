import { IOrganizationLevelTableItem } from '@features/organization/models/iorganization-level';

export const JOB_LEVELS_MOCK_DATA: IOrganizationLevelTableItem[] = [
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
