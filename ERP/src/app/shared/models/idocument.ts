export interface IDocument {
  id?: string;
  file?: File | null;
  name: string;
  size: number;
  uploadDate: Date | string;
  type: string;
  staffId?: string;
  documentTypeId?: string;
  documentTypeName?: string;
  expiryDate?: string | null;
  fileReference?: string | null;
}
