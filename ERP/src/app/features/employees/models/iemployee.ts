import { IJobDetails } from "./ijob-details";
import { IPersonalInfo } from "./ipersonal-info";
import { ISalary } from "./isalary";

export interface IEmployeeForm extends IPersonalInfo, IJobDetails, ISalary {
  id?: string;
  documents?: any[];
}

export interface IEmployeeResponse {
  data: IEmployeeForm[];
  total: number;
  page: number;
  limit: number;
}
