export interface IDesignation {
  id: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive?: boolean;
}

export interface IDesignationListItem extends IDesignation {
  employeeCount?: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface IDesignationListResponse {
  data: IDesignationListItem[];
  total: number;
  page: number;
  limit: number;
}

export type ICreateDesignation = Omit<IDesignation, 'id'>;

export type IUpdateDesignation = ICreateDesignation;
