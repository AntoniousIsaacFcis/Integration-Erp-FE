import { IDepartment } from "@features/organization/models/idepartment";

export const MOCK_DEPARTMENTS: IDepartment[] = [
  {
    id: '1',
    name: 'Development',
    abbreviation: 'DEV',
    description: 'Handles product engineering and technical delivery.',
    status: 'active',
    managerStaffIds: ['1'],
    employeeStaffIds: ['1', '2', '3'],
  },
  {
    id: '2',
    name: 'Human Resources',
    abbreviation: 'HR',
    description: 'Manages hiring, onboarding, and employee relations.',
    status: 'active',
    managerStaffIds: ['4'],
    employeeStaffIds: ['4'],
  },
  {
    id: '3',
    name: 'Accounting',
    abbreviation: 'ACC',
    description: 'Oversees financial records, payroll, and reporting.',
    status: 'inactive',
    managerStaffIds: ['3'],
    employeeStaffIds: ['3'],
  },
  {
    id: '4',
    name: 'Marketing',
    abbreviation: 'MKT',
    description: 'Leads campaigns, branding, and market communication.',
    status: 'active',
    managerStaffIds: ['2'],
    employeeStaffIds: ['2', '4'],
  }
];
