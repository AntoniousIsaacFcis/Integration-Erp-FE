import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { Observable } from 'rxjs';
import { IPermission } from '../models/iattendance';
import { ICreatePermissionRequest } from '../models/ipermissions';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/permissions`;

  createPermission(payload: ICreatePermissionRequest): Observable<IPermission> {
  return this.http.post<IPermission>(this.API_URL, payload);
}

  getPermissions(params: any): Observable<any> {
    return this.http.get<any>(this.API_URL, { params });
  }
}
