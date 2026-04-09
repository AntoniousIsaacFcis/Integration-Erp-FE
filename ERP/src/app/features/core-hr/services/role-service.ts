import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { Observable } from 'rxjs';
import { ICreateRoleRequest, IPermissionCategory, IRole, IRoleDetails, IRolesResponse } from '../models/irole';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/roles`;

  getRoles(params: any): Observable<IRolesResponse> {
    return this.http.get<IRolesResponse>(this.API_URL, { params });
  }

  getRoleById(id: string): Observable<IRoleDetails> {
    return this.http.get<IRoleDetails>(`${this.API_URL}/${id}`);
  }

  getPermissionsSchema(): Observable<IPermissionCategory[]> {
    return this.http.get<IPermissionCategory[]>(`${this.API_URL}/schema`);
  }

  createRole(payload: ICreateRoleRequest): Observable<IRole> {
    return this.http.post<IRole>(this.API_URL, payload);
  }

  updateRole(id: string, payload: Partial<IRoleDetails>): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, payload);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
