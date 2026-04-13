import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import {
  CreateDepartmentDTO,
  IDepartment,
  IDepartmentApiItem,
  IDepartmentApiResponse,
  IDepartmentLookupItem,
} from '../models/idepartment';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepartmentsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/organization/department`;

  getManagementData(params: { page: number; limit: number; search?: string; status?: string }) {
    const normalizedSearch = params.search?.trim();

    return this.http
      .get<IDepartmentApiResponse>(this.API_URL, {
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

  lookupResource = rxResource({
    stream: () =>
      this.http.get<Array<IDepartment | IDepartmentApiItem>>(`${this.API_URL}/lookup`).pipe(
        map((items) => items.map((item) => ('status' in item ? item : this.mapApiItem(item)))),
        catchError(() => of([])),
      ),
  });

  departmentsResource = this.lookupResource;

  lookupList = computed<IDepartmentLookupItem[]>(() => {
    const data = this.lookupResource.value() ?? [];
    return data.map((department) => ({
      id: department.id,
      displayName: department.name,
    }));
  });

  localizedDepartments = this.lookupList;

  create(data: CreateDepartmentDTO) {
    return this.http
      .post<IDepartmentApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  getById(id: string) {
    return this.http
      .get<IDepartmentApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: CreateDepartmentDTO) {
    return this.http
      .put<IDepartmentApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private mapApiItem(item: IDepartmentApiItem): IDepartment {
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

  private toApiPayload(data: CreateDepartmentDTO) {
    return {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      isActive: data.status === 'active',
    };
  }
}
