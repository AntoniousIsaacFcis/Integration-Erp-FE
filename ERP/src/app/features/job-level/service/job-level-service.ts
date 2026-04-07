import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IJobLevel, IJobLevelApiListResponse, IJobLevelResponse } from '../models/ijob-level';
import {
  ICreateOrganizationLevel,
  IOrganizationLevel,
  IUpdateOrganizationLevel,
} from '@features/organization/models/iorganization-level';
import { environment } from '@env/environment.development';
import { map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobLevelService {
  private http = inject(HttpClient);
  // private readonly API_URL = `${environment.baseUrl}/api/job-levels`; //for msw
  private readonly API_URL = `${environment.baseUrl}/api/organization/organization-level`; //for real api

  getLevels(params: GetLevelsParams) {
    const normalizedSearch = params.search?.trim();

    // Map frontend format to backend format
    const queryParams: ApiQueryParams = {
      page: params.page,
      limit: params.limit,
      ...(normalizedSearch && {
        searchTerm: normalizedSearch,
        search: normalizedSearch,
        q: normalizedSearch,
        filter: normalizedSearch,
      }),
      ...(params.status && { isActive: params.status === 'active' }),
    };

    return this.http.get<IJobLevelApiListResponse>(this.API_URL, { params: queryParams }).pipe(
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
    response: IJobLevelApiListResponse,
    params: GetLevelsParams,
  ): IJobLevelResponse {
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

  //for msw
  // private mapApiResponse(response: any, params: GetLevelsParams): IJobLevelResponse {
  //   const items = response.items || response.data || [];
  //   const total = response.totalCount || response.total || 0;

  //   return {
  //     data: items.map((item: any) => ({
  //       id: item.id,
  //       nameAr: item.name || item.nameAr,
  //       employeeCount: item.employeeCount || 0,
  //       departmentId: item.departmentId || '',
  //       status: (item.status === 'inactive' || item.isDeleted) ? 'inactive' : 'active',
  //       description: item.description || '',
  //       createdAt: item.creationTime || item.createdAt
  //     })),
  //     total: total,
  //     page: params.page,
  //     limit: params.limit
  //   };
  // }

  create(data: ICreateOrganizationLevel) {
    return this.http.post<IOrganizationLevel>(this.API_URL, data);
  }

  getById(id: string) {
    return this.http.get<IOrganizationLevel>(`${this.API_URL}/${id}`);
  }

  update(id: string, data: IUpdateOrganizationLevel) {
    return this.http.put<IOrganizationLevel>(`${this.API_URL}/${id}`, data);
  }

  isLevelOrderTaken(levelOrder: number, excludedId?: string) {
    return this.http
      .get<IJobLevelApiListResponse>(this.API_URL, {
        params: { page: 1, limit: 10000 },
      })
      .pipe(
        map((response) =>
          response.items.some((item) => item.levelOrder === levelOrder && item.id !== excludedId),
        ),
      );
  }
}

type GetLevelsParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

type ApiQueryParams = {
  page: number;
  limit: number;
  searchTerm?: string;
  search?: string;
  q?: string;
  filter?: string;
  isActive?: boolean;
};
