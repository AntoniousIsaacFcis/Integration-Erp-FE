export interface IEmployeeEnumOption {
  value: string;
  label: string;
}

export const STAFF_GENDER_OPTIONS: IEmployeeEnumOption[] = [
  { value: 'male', label: 'EMPLOYEES.MALE' },
  { value: 'female', label: 'EMPLOYEES.FEMALE' },
  { value: 'not-to-say', label: 'EMPLOYEES.NOT_TO_SAY' },
];

export const STAFF_MARITAL_STATUS_OPTIONS: IEmployeeEnumOption[] = [
  { value: 'single', label: 'EMPLOYEES.SINGLE' },
  { value: 'married', label: 'EMPLOYEES.MARRIED' },
  { value: 'divorced', label: 'EMPLOYEES.DIVORCED' },
  { value: 'widowed', label: 'EMPLOYEES.WIDOWED' },
];
