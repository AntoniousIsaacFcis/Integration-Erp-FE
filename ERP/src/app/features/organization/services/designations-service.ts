import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { catchError, map, of } from 'rxjs';
import {
  CreateDesignationDTO,
  IDesignation,
  IDesignationApiItem,
  IDesignationApiResponse,
  IDesignationLookupItem,
  IDesignationResponse,
} from '../models/idesignation';

@Injectable({
  providedIn: 'root',
})
export class DesignationsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/organization/designation`;

  getManagementData(params: { page: number; limit: number; search?: string; status?: string }) {
    const normalizedSearch = params.search?.trim();

    return this.http
      .get<IDesignationApiResponse>(this.API_URL, {
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
        map(
          (response): IDesignationResponse => ({
            data: response.items.map((item) => this.mapApiItem(item)),
            total: response.totalCount,
            page: params.page,
            limit: params.limit,
          }),
        ),
      );
  }

  readonly lookupResource = rxResource({
    stream: () =>
      this.http
        .get<Array<IDesignation | IDesignationApiItem>>(`${this.API_URL}/lookup`)
        .pipe(
          map((items) =>
            items.map((item) => ('status' in item ? item : this.mapApiItem(item))),
          ),
          catchError(() =>
            this.http
              .get<IDesignationApiResponse>(this.API_URL, {
                params: { skipCount: 0, maxResultCount: 1000 },
              })
              .pipe(
                map((response) => response.items.map((item) => this.mapApiItem(item))),
                catchError(() => of([])),
              ),
          ),
        ),
  });

  readonly lookupList = computed<IDesignationLookupItem[]>(() => {
    const data = this.lookupResource.value() ?? [];
    return data.map((designation) => ({
      id: designation.id,
      departmentId: designation.departmentId,
      displayName: designation.name,
    }));
  });

  // Backward-compatible aliases used by employee job-title dropdowns.
  readonly resource = this.lookupResource;
  readonly list = computed(() => this.lookupList());

  create(data: CreateDesignationDTO) {
    return this.http
      .post<IDesignationApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  getById(id: string) {
    return this.http
      .get<IDesignationApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: CreateDesignationDTO) {
    return this.http
      .put<IDesignationApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private mapApiItem(item: IDesignationApiItem): IDesignation {
    return {
      id: item.id,
      name: item.name,
      departmentId: item.departmentId ?? null,
      description: item.description ?? '',
      status:
        (typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted)
          ? 'active'
          : 'inactive',
    };
  }

  private toApiPayload(data: CreateDesignationDTO) {
    return {
      name: data.name.trim(),
      departmentId: data.departmentId || null,
      description: data.description?.trim() || '',
      isActive: data.status === 'active',
    };
  }
}
