import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { catchError, map, of, Observable } from 'rxjs';
import {
  ICreateEmploymentStatus,
  IEmploymentStatusApiItem,
  IEmploymentStatusApiResponse,
  IEmploymentStatusListResponse,
  IEmploymentStatusRow,
  IGetEmploymentStatusListInput,
  IUpdateEmploymentStatus,
} from '../models/iemployment-status';

@Injectable({
  providedIn: 'root',
})
export class EmploymentStatusesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/organization/employment-status`;

  getManagementData(params: IGetEmploymentStatusListInput): Observable<IEmploymentStatusListResponse> {
    const normalizedSearch = params.search?.trim();

    return this.http
      .get<IEmploymentStatusApiResponse>(this.API_URL, {
        params: {
          skipCount: (params.page - 1) * params.limit,
          maxResultCount: params.limit,
          ...(normalizedSearch && {
            filter: normalizedSearch,
            search: normalizedSearch,
            searchTerm: normalizedSearch,
            q: normalizedSearch,
          }),
          ...(params.status && {
            status: params.status,
            isActive: params.status === 'active',
          }),
        },
      })
      .pipe(
        map((response) => ({
          data: response.items.map((item) => this.mapApiItem(item)),
          total: response.totalCount,
          page: params.page,
          limit: params.limit,
        })),
      );
  }

  readonly resource = rxResource({
    stream: () =>
      this.http
        .get<IEmploymentStatusApiResponse>(this.API_URL, {
          params: { skipCount: 0, maxResultCount: 1000 },
        })
        .pipe(
          map((response) => response.items.map((item) => this.mapApiItem(item))),
          catchError(() => of([])),
        ),
  });

  readonly lookupList = computed(() =>
    (this.resource.value() ?? [])
      .filter((item) => item.isActive)
      .map((item) => ({
        id: item.id,
        displayName: item.name,
      })),
  );

  create(data: ICreateEmploymentStatus) {
    return this.http
      .post<IEmploymentStatusApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  getById(id: string) {
    return this.http
      .get<IEmploymentStatusApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: IUpdateEmploymentStatus) {
    return this.http
      .put<IEmploymentStatusApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  reloadLookups() {
    this.resource.reload();
  }

  private mapApiItem(item: IEmploymentStatusApiItem): IEmploymentStatusRow {
    const isActive = typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted;

    return {
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      isActive,
      status: isActive ? 'active' : 'inactive',
      creationTime: item.creationTime,
      creatorId: item.creatorId,
      lastModificationTime: item.lastModificationTime,
      lastModifierId: item.lastModifierId,
      deletionTime: item.deletionTime,
      deleterId: item.deleterId,
      isDeleted: item.isDeleted,
    };
  }

  private toApiPayload(data: ICreateEmploymentStatus | IUpdateEmploymentStatus) {
    return {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      isActive: data.isActive,
    };
  }
}
