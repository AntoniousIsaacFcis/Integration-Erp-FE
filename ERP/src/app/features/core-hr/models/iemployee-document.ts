import { IDocument } from '@shared/models/idocument';

export interface ICreateEmployeeDocumentPayload {
  staffId: string;
  documentTypeId: string;
  fileName: string;
  size: number;
  uploadDate: string;
  fileReference: string | null;
  expiryDate?: string | null;
}

export interface IEmployeeDocumentApiItem {
  id: string;
  staffId?: string | null;
  documentTypeId?: string | null;
  documentTypeName?: string | null;
  fileName?: string | null;
  size?: number | null;
  uploadDate?: string | null;
  expiryDate?: string | null;
  fileReference?: string | null;
  mimeType?: string | null;
}

export interface IEmployeeDocumentApiResponse {
  totalCount: number;
  items: IEmployeeDocumentApiItem[];
}

export interface IEmployeeDocumentUploadResponse {
  fileReference?: string | null;
  reference?: string | null;
  blobName?: string | null;
  url?: string | null;
  id?: string | null;
}

export type EmployeeDocumentRecord = IDocument;
