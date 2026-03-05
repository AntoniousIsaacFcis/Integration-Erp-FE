import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IAttendanceDay } from '@features/employees/models/iattendance-day';
import { ISelectOption } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api`;

  getAttendance(id: string, year: string, month: string): Observable<IAttendanceDay[]> {
    return this.http.get<IAttendanceDay[]>(`${this.API_URL}/employees/${id}/attendance`, {
      params: {
        year: year.toString(),
        month: month.toString()
      }
    });
  }

  getAvailableYears(): Observable<ISelectOption[]> {
  return this.http.get<ISelectOption[]>(`${this.API_URL}/attendance/available-years`);
}
}
