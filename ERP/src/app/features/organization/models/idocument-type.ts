export interface IDocumentType {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface IDocumentTypeApiItem {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IDocumentTypeApiResponse {
  totalCount: number;
  items: IDocumentTypeApiItem[];
}
