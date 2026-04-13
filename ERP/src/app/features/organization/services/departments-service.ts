import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslationService } from '@core/services/translation-service';
import { environment } from '@env/environment.development';
import { EmployeeService } from '@features/core-hr/services/employee-service';
import {
  CreateDepartmentDTO,
  IDepartment,
  IDepartmentApiItem,
  IDepartmentApiResponse,
  IDepartmentLookupItem,
  IDepartmentStaffOption,
} from '../models/idepartment';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepartmentsService {
  private readonly http = inject(HttpClient);
  private readonly employeeService = inject(EmployeeService);
  private readonly translationService = inject(TranslationService);
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

  staffLookupResource = rxResource({
    stream: () =>
      this.employeeService.getEmployees({ page: 1, limit: 1000, search: '' }).pipe(
        map((response) =>
          response.data
            .filter((employee): employee is typeof employee & { id: string } => Boolean(employee.id))
            .map((employee) => ({
              id: employee.id,
              fullNameAr: employee.fullNameAr,
              fullNameEn: employee.fullNameEn,
              displayName: employee.fullNameAr,
            })),
        ),
        catchError(() => of([])),
      ),
  });

  staffLookupList = computed<IDepartmentStaffOption[]>(() => {
    const lang = this.translationService.lang();

    return (this.staffLookupResource.value() ?? []).map((staff) => ({
      ...staff,
      displayName: lang === 'ar' ? staff.fullNameAr : staff.fullNameEn || staff.fullNameAr,
    }));
  });

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
      abbreviation: item.abbreviation ?? '',
      description: item.description ?? '',
      status:
        (typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted)
          ? 'active'
          : 'inactive',
      managerStaffIds: this.uniqueIds(item.managerStaffIds),
      employeeStaffIds: this.uniqueIds(item.employeeStaffIds),
    };
  }

  private toApiPayload(data: CreateDepartmentDTO) {
    return {
      name: data.name.trim(),
      abbreviation: data.abbreviation?.trim() || '',
      description: data.description?.trim() || '',
      isActive: data.status === 'active',
      managerStaffIds: this.uniqueIds(data.managerStaffIds),
      employeeStaffIds: this.uniqueIds(data.employeeStaffIds),
    };
  }

  private uniqueIds(ids?: string[]) {
    return Array.from(new Set((ids ?? []).filter(Boolean)));
  }
}
