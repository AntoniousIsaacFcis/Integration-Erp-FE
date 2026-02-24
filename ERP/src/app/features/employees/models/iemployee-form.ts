import { IDocument } from "@core/models/idocument";
import { IJobDetails } from "./ijob-details";
import { IPersonalInfo } from "./ipersonal-info";
import { ISalary } from "./isalary";

export interface IEmployeeForm {
  personalInfo: IPersonalInfo;
  jobDetails: IJobDetails;
  salary: ISalary;
  documents: IDocument[];
}
