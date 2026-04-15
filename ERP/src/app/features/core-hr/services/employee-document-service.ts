import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IDocument } from '@shared/models/idocument';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  ICreateEmployeeDocumentPayload,
  IEmployeeDocumentApiItem,
  IEmployeeDocumentApiResponse,
  IEmployeeDocumentUploadResponse,
} from '../models/iemployee-document';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDocumentService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/core-hR/employee-document`;

  getDocuments(staffId: string): Observable<IDocument[]> {
    return this.http
      .get<IEmployeeDocumentApiResponse | IEmployeeDocumentApiItem[]>(this.API_URL, {
        params: {
          skipCount: 0,
          maxResultCount: 1000,
          staffId,
        },
      })
      .pipe(
        map((response) => {
          const items = Array.isArray(response) ? response : response.items ?? [];
          return items.map((item) => this.mapApiItem(item));
        }),
      );
  }

  createDocumentsForStaff(
    staffId: string,
    documents: IDocument[],
    documentTypeId?: string,
    documentTypeName?: string,
  ): Observable<IDocument[]> {
    const uploadableDocuments = documents.filter((document): document is IDocument & { file: File } =>
      document.file instanceof File,
    );

    if (!staffId || !documentTypeId || uploadableDocuments.length === 0) {
      return of([]);
    }

    return forkJoin(
      uploadableDocuments.map((document) =>
        this.upload(document.file).pipe(
          switchMap((uploadResponse) =>
            this.create({
              staffId,
              documentTypeId,
              fileName: document.name,
              size: document.size,
              uploadDate: this.toIsoString(document.uploadDate),
              fileReference: this.extractFileReference(uploadResponse),
            }),
          ),
          map((createdDocument) => ({
            ...createdDocument,
            documentTypeId,
            documentTypeName,
          })),
        ),
      ),
    );
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.post(`${this.API_URL}/${documentId}/download`, {}, { responseType: 'blob' });
  }

  private upload(file: File): Observable<IEmployeeDocumentUploadResponse | string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<IEmployeeDocumentUploadResponse | string>(`${this.API_URL}/upload`, formData);
  }

  private create(payload: ICreateEmployeeDocumentPayload): Observable<IDocument> {
    return this.http
      .post<IEmployeeDocumentApiItem>(this.API_URL, payload)
      .pipe(map((response) => this.mapApiItem(response)));
  }

  private mapApiItem(item: IEmployeeDocumentApiItem): IDocument {
    return {
      id: item.id,
      staffId: item.staffId ?? undefined,
      documentTypeId: item.documentTypeId ?? undefined,
      documentTypeName: item.documentTypeName ?? undefined,
      name: item.fileName?.trim() || 'Document',
      size: item.size ?? 0,
      uploadDate: item.uploadDate ? new Date(item.uploadDate) : new Date(),
      type: item.mimeType?.trim() || 'application/octet-stream',
      fileReference: item.fileReference ?? null,
    };
  }

  private extractFileReference(response: IEmployeeDocumentUploadResponse | string): string | null {
    if (typeof response === 'string') {
      return response;
    }

    return (
      response.fileReference ??
      response.reference ??
      response.blobName ??
      response.url ??
      response.id ??
      null
    );
  }

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
