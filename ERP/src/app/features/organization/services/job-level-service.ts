import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ICreateEmployeeLevel,
  IEmployeeLevel,
  IEmployeeLevelApiResponse,
  IEmployeeLevelApiListResponse,
  IEmployeeLevelListResponse,
  IUpdateEmployeeLevel,
} from '@features/organization/models/iemployee-level';
import { environment } from '@env/environment.development';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

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
    return this.checkLevelsInPages(
      (item) => this.hasSameLevelOrder(item.levelOrder, levelOrder) && item.id !== excludedId,
    );
  }

  isNameTaken(name: string, excludedId?: string) {
    return this.checkLevelsInPages(
      (item) => this.hasSameName(item.name, name) && item.id !== excludedId,
    );
  }

  private hasSameLevelOrder(existingLevelOrder: unknown, requestedLevelOrder: number) {
    const parsedExistingLevelOrder = Number(existingLevelOrder);

    if (Number.isFinite(parsedExistingLevelOrder)) {
      return parsedExistingLevelOrder === requestedLevelOrder;
    }

    return String(existingLevelOrder).trim() === String(requestedLevelOrder).trim();
  }

  private hasSameName(existingName: unknown, requestedName: string) {
    return (
      String(existingName ?? '').trim().toLocaleLowerCase() ===
      requestedName.trim().toLocaleLowerCase()
    );
  }

  private checkLevelsInPages(
    matcher: (item: IEmployeeLevelApiResponse) => boolean,
    skipCount = 0,
  ): Observable<boolean> {
    const pageSize = 100;

    return this.http
      .get<IEmployeeLevelApiListResponse>(this.API_URL, {
        params: { skipCount, maxResultCount: pageSize },
      })
      .pipe(
        switchMap((response) => {
          const isFound = response.items.some(matcher);

          if (isFound) {
            return of(true);
          }

          const nextSkipCount = skipCount + response.items.length;
          const hasMoreItems = response.items.length > 0 && nextSkipCount < response.totalCount;

          if (!hasMoreItems) {
            return of(false);
          }

          return this.checkLevelsInPages(matcher, nextSkipCount);
        }),
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
