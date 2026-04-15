import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import {
  CreateEmploymentTypeDTO,
  IEmploymentType,
  IEmploymentTypeApiItem,
  IEmploymentTypeApiResponse,
  IEmploymentTypeResponse,
} from '../models/iemployment-type';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmploymentTypesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/organization/employment-type`;

  // 1. Resource for Management Table (Paginated/Filtered)
getManagementData(params: { page: number; limit: number; search?: string;status?: string }) {
    const normalizedSearch = params.search?.trim();

    return this.http.get<IEmploymentTypeApiResponse>(this.API_URL, {
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
      }
    }).pipe(
      map((response) => ({
        data: response.items.map((item) => this.mapApiItem(item)),
        total: response.totalCount,
        page: params.page,
        limit: params.limit,
      }))
    );
  }

  // 2. Resource for Lookups (Dropdowns/Lists)
  // Used when other forms need to select an Employment Type
  public readonly lookupResource = rxResource({
    stream: () =>
      this.http
        .get<IEmploymentTypeApiResponse>(this.API_URL, {
          params: { skipCount: 0, maxResultCount: 1000 },
        })
        .pipe(
          map((response) => response.items.map((item) => this.mapApiItem(item))),
          catchError(() => of([])),
        ),
  });

  // Live translation computed list for dropdowns
  readonly lookupList = computed(() => {
    const data = this.lookupResource.value() ?? [];
    return data
      .filter((type) => type.status === 'active')
      .map(type => ({
      id: type.id,
      displayName: type.name
    }));
  });

  // 3. Actions
  create(data: CreateEmploymentTypeDTO) {
    return this.http
      .post<IEmploymentTypeApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  getById(id: string) {
    return this.http
      .get<IEmploymentTypeApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: CreateEmploymentTypeDTO) {
    return this.http
      .put<IEmploymentTypeApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  private mapApiItem(item: IEmploymentTypeApiItem): IEmploymentType {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      employeeCount: 0,
      status:
        (typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted)
          ? 'active'
          : 'inactive',
    };
  }

  private toApiPayload(data: CreateEmploymentTypeDTO) {
    return {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      isActive: data.status === 'active',
    };
  }
}
