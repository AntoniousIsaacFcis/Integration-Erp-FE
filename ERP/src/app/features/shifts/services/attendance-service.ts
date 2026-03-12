import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IVacation, IVacationResponse, IVacationStats } from '@features/vacations/models/ivacation';
import { ISelectOption } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { Observable } from 'rxjs';
import { IAttendanceDay, IAttendanceResponse, IShift } from '../models/iattendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api`;

  getAttendance(empId: string, year: string, month: string): Observable<IAttendanceDay[]> {
    return this.http.get<IAttendanceDay[]>(`${this.API_URL}/attendance/${empId}`, {
      params: {  year: year.toString(),  month: month.toString() }
    });
  }

  getAllAttendance(params: { date: string; departmentId?: string; page: number }) {
    return this.http.get<IAttendanceResponse>(`${this.API_URL}/attendance/all`, { params });
  }

  getShifts() {
    return this.http.get<IShift[]>(`${this.API_URL}/shifts`);
  }

  getAvailableYears(): Observable<ISelectOption[]> {
    return this.http.get<ISelectOption[]>(`${this.API_URL}/attendance/available-years`);
  }

  createShift(shift: Partial<IShift>) {
    return this.http.post<IShift>(`${this.API_URL}/shifts`, shift);
  }

  getVacations(params: { employeeId: string; year: string; month?: string; page: number; limit: number }): Observable<IVacationResponse> {
    return this.http.get<IVacationResponse>(
      `${this.API_URL}/employees/${params.employeeId}/vacations`,
      { params }
    );
  }
}
