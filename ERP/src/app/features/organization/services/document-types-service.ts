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
      })),
  );

  private mapApiItem(item: IDocumentTypeApiItem): IDocumentType {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      status:
        (typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted)
          ? 'active'
          : 'inactive',
    };
  }
}
