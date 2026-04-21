export interface IDocumentType {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  allowedFileExtensions: string[];
  maxFileSizeInMb: number;
  isExpiryDateRequired: boolean;
}

export interface IDocumentTypeApiItem {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  allowedFileExtensions?: string[];
  maxFileSizeInMb?: number;
  isExpiryDateRequired?: boolean;
}

export interface IDocumentTypeApiResponse {
  totalCount: number;
  items: IDocumentTypeApiItem[];
}
