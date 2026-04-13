import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { Observable } from 'rxjs';
import { IStaffApiResponse } from '../models/istaff';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/core-hR/staff`;

  getStaff(params: {
    skipCount?: number;
    maxResultCount?: number;
    filter?: string;
  }): Observable<IStaffApiResponse> {
    return this.http.get<IStaffApiResponse>(this.API_URL, { params });
  }
}
