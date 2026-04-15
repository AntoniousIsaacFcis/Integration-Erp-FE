export interface INationality {
  id: string;
  code?: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  status?: 'active' | 'inactive';
}

export interface INationalityApiItem {
  id: string;
  code?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface INationalityApiResponse {
  totalCount: number;
  items: INationalityApiItem[];
}

export interface INationalityView extends INationality {
  displayName: string;
}
