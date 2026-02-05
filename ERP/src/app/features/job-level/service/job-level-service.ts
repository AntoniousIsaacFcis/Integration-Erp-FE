import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IJobLevel, IJobLevelResponse } from '../models/ijob-level';
import { environment } from '@env/environment.development';

@Injectable({
  providedIn: 'root',
})
export class JobLevelService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/job-levels`;

  getLevels(params: { page: number; limit: number }) {
    return this.http.get<IJobLevelResponse>(this.API_URL, { params });
  }
}
