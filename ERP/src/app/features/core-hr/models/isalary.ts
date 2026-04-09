export interface ISalary {
  basicSalary?: number;
}

export type SalaryStatus = 'PAID' | 'PENDING' | 'PROCESSING';

export interface ISalaryElement {
  nameAr: string;
  days?: number;
  hours?: number;
  value: number;
}

export interface ISalarySummary {
  monthlySalary: number;
  status: SalaryStatus;
  currency: string;
}

export interface ISalaryResponse {
  summary: ISalarySummary;
  elements: ISalaryElement[];
  total: number;
  page: number;
  limit: number;
}
