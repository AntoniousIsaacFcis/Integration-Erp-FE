export interface IStaffApiItem {
  id: string;
  staffCode?: string | null;
  firstName?: string | null;
  firstNameEn?: string | null;
  middleName?: string | null;
  middleNameEn?: string | null;
  lastName?: string | null;
  lastNameEn?: string | null;
  fullName?: string | null;
  fullNameEn?: string | null;
  fullNameAr?: string | null;
  email?: string | null;
  phone?: string | null;
  mobileNumber?: string | null;
  emergencyContactPhone?: string | null;
  nationalId?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationalityId?: string | null;
  nationalityCode?: string | null;
  presentAddressLine1?: string | null;
  address?: string | null;
  departmentId?: string | null;
  designationId?: string | null;
  employmentTypeId?: string | null;
  employmentStatusId?: string | null;
  probationEndDate?: string | null;
  basicSalary?: number | null;
  allowanceAmount?: number | null;
  deductionAmount?: number | null;
  totalSalary?: number | null;
  hireDate?: string | null;
  isActive?: boolean;
  customData?: string | null;
}

export interface IStaffApiResponse {
  totalCount: number;
  items: IStaffApiItem[];
}

export interface ICreateStaffPayload {
  staffCode?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  firstNameEn?: string | null;
  middleNameEn?: string | null;
  lastNameEn?: string | null;
  email?: string | null;
  phone?: string | null;
  emergencyContactPhone?: string | null;
  nationalId?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  departmentId?: string | null;
  designationId?: string | null;
  employmentTypeId?: string | null;
  employmentStatusId?: string | null;
  probationEndDate?: string | null;
  nationalityId?: string | null;
  hireDate?: string | null;
  presentAddressLine1?: string | null;
  isActive?: boolean;
  customData?: string | null;
}
