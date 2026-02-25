import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IEmployeeForm } from '../models/iemployee-form';
import { Observable } from 'rxjs';

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
}
