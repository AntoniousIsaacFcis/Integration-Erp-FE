import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IEmployeeForm, IEmployeeResponse } from '../models/iemployee';
import { Observable } from 'rxjs';
import { IAttendanceDay } from '../models/iattendance-day';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/employees`;

  createEmployee(employeeData: IEmployeeForm): Observable<any> {
    return this.http.post<any>(this.API_URL, employeeData);
  }

  getEmployeeById(id: string): Observable<IEmployeeForm> {
    return this.http.get<IEmployeeForm>(`${this.API_URL}/${id}`);
  }

  getEmployees(params: any): Observable<IEmployeeResponse> {
    return this.http.get<IEmployeeResponse>(this.API_URL, { params });
  }


}
