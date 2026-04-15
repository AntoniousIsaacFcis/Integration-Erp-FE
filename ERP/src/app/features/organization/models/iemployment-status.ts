export interface IEmploymentStatus {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface IEmploymentStatusApiItem {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IEmploymentStatusApiResponse {
  totalCount: number;
  items: IEmploymentStatusApiItem[];
}
