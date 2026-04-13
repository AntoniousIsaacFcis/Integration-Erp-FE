import { IDepartment } from "@features/organization/models/idepartment";

export const MOCK_DEPARTMENTS: IDepartment[] = [
  {
    id: '1',
    name: 'Development',
    description: 'Handles product engineering and technical delivery.',
    status: 'active',
  },
  {
    id: '2',
    name: 'Human Resources',
    description: 'Manages hiring, onboarding, and employee relations.',
    status: 'active',
  },
  {
    id: '3',
    name: 'Accounting',
    description: 'Oversees financial records, payroll, and reporting.',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Marketing',
    description: 'Leads campaigns, branding, and market communication.',
    status: 'active',
  }
];
