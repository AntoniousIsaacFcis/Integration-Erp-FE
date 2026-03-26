import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateJobLevelDTO, IJobLevel, IJobLevelApiListResponse, IJobLevelResponse } from '../models/ijob-level';
import { environment } from '@env/environment.development';
import { map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobLevelService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/job-levels`; //for msw
  // private readonly API_URL = `${environment.baseUrl}/api/organization/organization-level`; //for real api

  getLevels(params: GetLevelsParams) {
    // Map frontend format to backend format
    const queryParams: ApiQueryParams = {
      page: params.page,
      limit: params.limit,
      ...(params.search && { q: params.search }),  // Check if backend wants 'q' or 'search'
      // ...(params.status && { isDeleted: params.status === 'inactive' })  //for real API
      ...(params.status && { status: params.status })//for msw
    };

    return this.http.get<IJobLevelApiListResponse>(this.API_URL, { params: queryParams })
      .pipe(
        map(response => this.mapApiResponse(response, params)),
        // Add error handling
        catchError(error => {
          console.error('Failed to load levels:', error);
          throw error; // Let component handle with error state
        })
      );
  }

  //for real api
  // private mapApiResponse(response: IJobLevelApiListResponse, params: GetLevelsParams): IJobLevelResponse {
  //   return {
  //     data: response.items.map(item => ({
  //       id: item.id,
  //       nameAr: item.name,
  //       employeeCount: 0,
  //       departmentId: '',
  //       status: item.isDeleted ? 'inactive' : 'active' as const,
  //       description: '',
  //       createdAt: item.creationTime
  //     })),
  //     total: response.totalCount,
  //     page: params.page,
  //     limit: params.limit
  //   };
  // }

  //for msw
  private mapApiResponse(response: any, params: GetLevelsParams): IJobLevelResponse {
    const items = response.items || response.data || [];
    const total = response.totalCount || response.total || 0;

    return {
      data: items.map((item: any) => ({
        id: item.id,
        nameAr: item.name || item.nameAr,
        employeeCount: item.employeeCount || 0,
        departmentId: item.departmentId || '',
        status: (item.status === 'inactive' || item.isDeleted) ? 'inactive' : 'active',
        description: item.description || '',
        createdAt: item.creationTime || item.createdAt
      })),
      total: total,
      page: params.page,
      limit: params.limit
    };
  }

  create(data: CreateJobLevelDTO) {
    return this.http.post<IJobLevel>(this.API_URL, data);
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
  q?: string;
  isDeleted?: boolean;
};
