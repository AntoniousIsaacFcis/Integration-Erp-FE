import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { catchError, map, of } from 'rxjs';
import {
  IDocumentType,
  IDocumentTypeApiItem,
  IDocumentTypeApiResponse,
} from '../models/idocument-type';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypesService {
  private readonly DEFAULT_ALLOWED_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
  private readonly DEFAULT_MAX_FILE_SIZE_MB = 10;
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/organization/document-type`;

  readonly resource = rxResource({
    stream: () =>
      this.http
        .get<IDocumentTypeApiResponse>(this.API_URL, {
          params: { skipCount: 0, maxResultCount: 1000 },
        })
        .pipe(
          map((response) => response.items.map((item) => this.mapApiItem(item))),
          catchError(() => of([])),
        ),
  });

  readonly lookupList = computed(() =>
    (this.resource.value() ?? [])
      .filter((item) => item.status === 'active')
      .map((item) => ({
        id: item.id,
        displayName: item.name,
        allowedFileExtensions: item.allowedFileExtensions,
        maxFileSizeInMb: item.maxFileSizeInMb,
        isExpiryDateRequired: item.isExpiryDateRequired,
      })),
  );

  getById(id: string | null | undefined) {
    if (!id) {
      return undefined;
    }

    return (this.resource.value() ?? []).find((item) => item.id === id);
  }

  private mapApiItem(item: IDocumentTypeApiItem): IDocumentType {
    const allowedFileExtensions = this.normalizeExtensions(
      item.allowedFileExtensions,
      item.name,
    );

    return {
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      allowedFileExtensions,
      maxFileSizeInMb: item.maxFileSizeInMb && item.maxFileSizeInMb > 0
        ? item.maxFileSizeInMb
        : this.inferDefaultMaxFileSizeInMb(item.name),
      isExpiryDateRequired: item.isExpiryDateRequired ?? false,
      status:
        (typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted)
          ? 'active'
          : 'inactive',
    };
  }

  private normalizeExtensions(values: string[] | undefined, documentTypeName: string) {
    const normalizedValues = values
      ?.map((value) => value?.trim().replace(/^\./, '').toLowerCase())
      .filter((value): value is string => !!value) ?? [];

    if (normalizedValues.length) {
      return [...new Set(normalizedValues)];
    }

    const normalizedName = documentTypeName.trim().toLowerCase();

    if (normalizedName.includes('contract') || normalizedName.includes('عقد') || normalizedName === 'pdf') {
      return ['pdf'];
    }

    if (
      normalizedName.includes('passport') ||
      normalizedName.includes('جواز') ||
      normalizedName.includes('identity') ||
      normalizedName.includes('هوية') ||
      normalizedName.includes('certificate') ||
      normalizedName.includes('شهادة')
    ) {
      return ['pdf', 'jpg', 'jpeg', 'png'];
    }

    return this.DEFAULT_ALLOWED_FILE_EXTENSIONS;
  }

  private inferDefaultMaxFileSizeInMb(documentTypeName: string) {
    const normalizedName = documentTypeName.trim().toLowerCase();
    return normalizedName.includes('contract') || normalizedName.includes('عقد')
      ? 20
      : this.DEFAULT_MAX_FILE_SIZE_MB;
  }
}
