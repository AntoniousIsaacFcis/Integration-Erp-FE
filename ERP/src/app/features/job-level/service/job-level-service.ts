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
  // private readonly API_URL = `${environment.baseUrl}/api/job-levels`; //for msw
  private readonly API_URL = `${environment.baseUrl}/api/organization/organization-level`;

  getLevels(params: GetLevelsParams) {
    // Map frontend format to backend format
    const queryParams: ApiQueryParams = {
      page: params.page,
      limit: params.limit,
      ...(params.search && { q: params.search }),  // Check if backend wants 'q' or 'search'
      ...(params.status && { isDeleted: params.status === 'inactive' })  // Convert to boolean
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

  private mapApiResponse(response: IJobLevelApiListResponse, params: GetLevelsParams): IJobLevelResponse {
    return {
      data: response.items.map(item => ({
        id: item.id,
        nameAr: item.name,
        employeeCount: 0,
        departmentId: '',
        status: item.isDeleted ? 'inactive' : 'active' as const,
        description: '',
        createdAt: item.creationTime
      })),
      total: response.totalCount,
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
