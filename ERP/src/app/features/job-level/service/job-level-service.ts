import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateJobLevelDTO, IJobLevel, IJobLevelResponse } from '../models/ijob-level';
import { environment } from '@env/environment.development';

@Injectable({
  providedIn: 'root',
})
export class JobLevelService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/job-levels`;

  getLevels(params: { page: number; limit: number; search?: string }) {
  const queryParams: any = {
    page: params.page,
    limit: params.limit
  };

  if (params.search) {
    queryParams['q'] = params.search; 
  }

  return this.http.get<IJobLevelResponse>(this.API_URL, { params: queryParams });
}

  create(data: CreateJobLevelDTO) {
    return this.http.post<IJobLevel>(this.API_URL, data);
  }
}
