import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IDocument } from '@shared/models/idocument';
import { forkJoin, map, Observable, of } from 'rxjs';
import {
  IEmployeeDocumentApiItem,
  IEmployeeDocumentApiResponse,
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
    expiryDate?: string,
  ): Observable<IDocument[]> {
    const uploadableDocuments = documents.filter((document): document is IDocument & { file: File } =>
      document.file instanceof File,
    );

    if (!staffId || !documentTypeId || uploadableDocuments.length === 0) {
      return of([]);
    }

    return forkJoin(
      uploadableDocuments.map((document) =>
        this.upload(staffId, documentTypeId, document.file, document.expiryDate ?? expiryDate).pipe(
          map((createdDocument) => ({
            ...createdDocument,
            documentTypeId,
            documentTypeName,
            expiryDate: document.expiryDate ?? expiryDate ?? null,
          })),
        ),
      ),
    );
  }

  downloadDocument(documentId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.API_URL}/${documentId}/download-file`, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  private upload(
    staffId: string,
    documentTypeId: string,
    file: File,
    expiryDate?: string | null,
  ): Observable<IDocument> {
    const formData = new FormData();
    formData.append('staffId', staffId);
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', file, file.name);
    if (expiryDate?.trim()) {
      formData.append('expiryDate', expiryDate.trim());
    }

    return this.http
      .post<IEmployeeDocumentApiItem>(`${this.API_URL}/upload`, formData)
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
      expiryDate: item.expiryDate ?? null,
      fileReference: item.fileReference ?? null,
    };
  }

  getDownloadFileName(headers: HttpHeaders, fallbackName?: string | null) {
    const contentDisposition = headers.get('content-disposition') ?? '';
    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1]);
    }

    const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (basicMatch?.[1]) {
      return basicMatch[1];
    }

    return fallbackName?.trim() || 'document';
  }
}
