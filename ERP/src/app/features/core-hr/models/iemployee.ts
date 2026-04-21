import { IJobDetails } from "./ijob-details";
import { IPersonalInfo } from "./ipersonal-info";
import { ISalary } from "./isalary";
import { IDocument } from "@shared/models/idocument";

export interface IEmployeeForm extends IPersonalInfo, IJobDetails, ISalary {
  id?: string;
  staffCode?: string;
  allowances?: number;
  deductions?: number;
  totalSalary?: number;
  emergencyPhone?: string;
  designationName?: string;
  designationNameAr?: string;
  designationNameEn?: string;
  nationalityName?: string;
  nationalityNameAr?: string;
  nationalityNameEn?: string;
  documentTypeId?: string;
  documentTypeName?: string;
  documentExpiryDate?: string;
  documents?: IDocument[];
  isActive?: boolean;
  customData?: string | null;
}

export interface IEmployeeResponse {
  data: IEmployeeForm[];
  total: number;
  page: number;
  limit: number;
}
