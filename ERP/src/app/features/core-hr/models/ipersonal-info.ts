export interface IPersonalInfo {
  fullNameAr: string;
  fullNameEn: string;
  nationalId: string;
  gender: 'male' | 'female';
  nationality: string;
  birthDate: string;
  maritalStatus: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  fingerPrintNumber?: string;
}
