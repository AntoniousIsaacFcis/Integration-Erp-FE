import { IEmployeeForm } from '@features/core-hr/models/iemployee';

export const EMPLOYEES_MOCK_DATA: IEmployeeForm[] = [
  {
    id: '1',
    fullNameAr: 'فراس محمد',
    fullNameEn: 'Firas Mohammad',
    nationalId: '10087654321',
    gender: 'male',
    nationality: 'Saudi',
    birthDate: '1994-02-02',
    maritalStatus: 'Married',
    phone: '0512345678',
    email: 'employee.1@erp-system.com',
    address: 'حي الصحافة، الرياض، المملكة العربية السعودية',
    emergencyContact: 'Family Member - 05XXXXXXXX',
    jobTitleId: '1',
    jobTitleAr: 'مدير مشروع',
    jobTitleEn: 'Project Manager',
    departmentId: '1',
    employmentType: 'full-time',
    joiningDate: '2024-02-10',
    employmentStatus: 'STATUS_ACTIVE',
    fingerPrintNumber: 'FP-001-2025',
    probationPeriod: '90 Days',
    basicSalary: 8350,
    documents: [],
  },
];
