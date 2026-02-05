export interface IJobLevel {
  id: string;
  name: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}


export interface IJobLevelResponse {
  data: IJobLevel[];
  total: number;
  page: number;
  limit: number;
}
