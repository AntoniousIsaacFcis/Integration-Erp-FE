import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { ISalaryResponse } from '@features/core-hr/models/isalary';
import { ISelectOption } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalaryService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api`;

  getSalaryDetails(params: { employeeId: string; year: string; month: string; page: number; limit: number }): Observable<ISalaryResponse> {
    return this.http.get<ISalaryResponse>(`${this.API_URL}/employees/${params.employeeId}/salary`, { params });
  }

  getAvailableYears(employeeId?: string): Observable<ISelectOption[]> {
  return this.http.get<ISelectOption[]>(`${this.API_URL}/salary/available-years`, { params: employeeId ? { employeeId } : {} });
}

}
