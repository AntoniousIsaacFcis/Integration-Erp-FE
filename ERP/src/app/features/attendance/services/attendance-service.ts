import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IVacation, IVacationResponse, IVacationStats } from '@features/attendance/models/ivacation';
import { ISelectOption } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { Observable } from 'rxjs';
import { IAttendanceDay, IAttendanceResponse, IEditAttendanceDay, IShift, IShiftListResponse, ISpecialShiftListResponse, IUpdateAttendancePayload } from '../models/iattendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  getShiftById(params: any): Observable<unknown> {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api`;

  getAttendance(empId: string, year: string, month: string): Observable<IAttendanceDay[]> {
    return this.http.get<IAttendanceDay[]>(`${this.API_URL}/attendance/${empId}`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }

 getAllAttendance(params: {
  page: number;
  limit: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}): Observable<IAttendanceResponse> {
  let httpParams: any = {
    page: params.page.toString(),
    limit: params.limit.toString(),
  };

  if (params.search) httpParams.search = params.search;
  if (params.fromDate) httpParams.fromDate = params.fromDate;
  if (params.toDate) httpParams.toDate = params.toDate;
  if (params.status) httpParams.status = params.status;

  return this.http.get<IAttendanceResponse>(`${this.API_URL}/attendance/all`, {
    params: httpParams
  });
}

  getShifts(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    createdAt?: string;
  }): Observable<IShiftListResponse> {
    return this.http.get<IShiftListResponse>(`${this.API_URL}/shifts`, {
      params: {
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.createdAt && { createdAt: params.createdAt })
      }
    });
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

  getSpecialShifts(params: {
    page: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Observable<ISpecialShiftListResponse> {
    return this.http.get<ISpecialShiftListResponse>(`${this.API_URL}/special-shifts`, {
      params: {
        page: params.page.toString(),
        limit: (params.limit || 10).toString(),
        ...(params.search && { search: params.search }),
        ...(params.fromDate && { fromDate: params.fromDate }),
        ...(params.toDate && { toDate: params.toDate })
      }
    });
  }

  getAttendanceById(id: string): Observable<IEditAttendanceDay> {
    return this.http.get<IEditAttendanceDay>(`${this.API_URL}/attendance/details/${id}`);
  }

  updateAttendance(id: string, payload: IUpdateAttendancePayload): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/attendance/${id}`, payload);
  }
}
