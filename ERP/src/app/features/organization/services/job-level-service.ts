import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ICreateEmployeeLevel,
  IEmployeeLevel,
  IEmployeeLevelApiListResponse,
  IEmployeeLevelListResponse,
  IUpdateEmployeeLevel,
} from '@features/organization/models/iemployee-level';
import { environment } from '@env/environment.development';
import { map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobLevelService {
  private http = inject(HttpClient);
  // private readonly API_URL = `${environment.baseUrl}/api/job-levels`; //for msw
  private readonly API_URL = `${environment.baseUrl}/api/organization/employee-level`;

  getLevels(params: GetLevelsParams) {
    const normalizedSearch = params.search?.trim();

    // Map frontend format to backend format
    const queryParams: ApiQueryParams = {
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
    };

    return this.http.get<IEmployeeLevelApiListResponse>(this.API_URL, { params: queryParams }).pipe(
      map((response) => this.mapApiResponse(response, params)),
      // Add error handling
      catchError((error) => {
        console.error('Failed to load levels:', error);
        throw error; // Let component handle with error state
      }),
    );
  }

  // for real api
  private mapApiResponse(
    response: IEmployeeLevelApiListResponse,
    params: GetLevelsParams,
  ): IEmployeeLevelListResponse {
    return {
      data: response.items.map((item) => ({
        id: item.id,
        levelOrder: item.levelOrder,
        nameAr: item.name,
        employeeCount: 0,
        departmentId: '',
        status:
          (typeof item.isActive === 'boolean'
            ? item.isActive
            : !item.isDeleted)
            ? 'active'
            : ('inactive' as const),
        description: item.description ?? '',
        createdAt: item.creationTime,
      })),
      total: response.totalCount,
      page: params.page,
      limit: params.limit,
    };
  }

  create(data: ICreateEmployeeLevel) {
    return this.http.post<IEmployeeLevel>(this.API_URL, this.withNormalizedActiveState(data));
  }

  getById(id: string) {
    return this.http.get<IEmployeeLevel>(`${this.API_URL}/${id}`);
  }

  update(id: string, data: IUpdateEmployeeLevel) {
    return this.http.put<IEmployeeLevel>(
      `${this.API_URL}/${id}`,
      this.withNormalizedActiveState(data),
    );
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  isLevelOrderTaken(levelOrder: number, excludedId?: string) {
    return this.http
      .get<IEmployeeLevelApiListResponse>(this.API_URL, {
        params: { skipCount: 0, maxResultCount: 1000 },
      })
      .pipe(
        map((response) =>
          response.items.some((item) => item.levelOrder === levelOrder && item.id !== excludedId),
        ),
      );
  }

  private withNormalizedActiveState<T extends ICreateEmployeeLevel | IUpdateEmployeeLevel>(
    data: T,
  ): T {
    return {
      ...data,
      ...(typeof data.isActive === 'boolean' ? { isActive: data.isActive } : {}),
    };
  }
}

type GetLevelsParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

type ApiQueryParams = {
  skipCount: number;
  maxResultCount: number;
  filter?: string;
  search?: string;
  searchTerm?: string;
  q?: string;
  status?: string;
  isActive?: boolean;
};
