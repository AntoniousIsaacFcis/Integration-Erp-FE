export interface IEmployeeEnumOption {
  value: string;
  label: string;
}

export const STAFF_GENDER_OPTIONS: IEmployeeEnumOption[] = [
  { value: 'male', label: 'Enum:StaffGender.Male' },
  { value: 'female', label: 'Enum:StaffGender.Female' },
  { value: 'notToSay', label: 'Enum:StaffGender.NotToSay' },
];

export const STAFF_MARITAL_STATUS_OPTIONS: IEmployeeEnumOption[] = [
  { value: 'single', label: 'Enum:StaffMaritalStatus.Single' },
  { value: 'married', label: 'Enum:StaffMaritalStatus.Married' },
  { value: 'divorced', label: 'Enum:StaffMaritalStatus.Divorced' },
  { value: 'widowed', label: 'Enum:StaffMaritalStatus.Widowed' },
];
