import { IDesignation } from '@features/organization/models/idesignation';

export const JOB_TITLES_DATA: IDesignation[] = [
  {
    id: '1',
    name: 'Project Manager',
    departmentId: '1',
    description: 'Leads project delivery and coordination.',
    status: 'active',
  },
  {
    id: '2',
    name: 'Software Developer',
    departmentId: '1',
    description: 'Builds and maintains business applications.',
    status: 'active',
  },
  {
    id: '3',
    name: 'General Accountant',
    departmentId: '3',
    description: 'Handles accounting records and reconciliations.',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'HR Specialist',
    departmentId: '2',
    description: 'Supports hiring and employee operations.',
    status: 'active',
  },
  {
    id: '5',
    name: 'Sales Manager',
    departmentId: '4',
    description: 'Owns sales strategy and team performance.',
    status: 'active',
  },
];
