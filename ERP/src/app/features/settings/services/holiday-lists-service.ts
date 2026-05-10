import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { map, Observable } from 'rxjs';
import {
  ICreateHolidayList,
  IGetHolidayListListInput,
  IHolidayList,
  IHolidayListApiItem,
  IHolidayListApiResponse,
  IHolidayListListResponse,
  IUpdateHolidayList,
} from '../models/iholiday-list';

@Injectable({
  providedIn: 'root',
})
export class HolidayListsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/attendance/holiday-list`;

  getManagementData(params: IGetHolidayListListInput): Observable<IHolidayListListResponse> {
    return this.http
      .get<IHolidayListApiResponse>(this.API_URL, {
        params: {
          Page: String(params.page),
          Limit: String(params.limit),
          Sorting: params.sorting ?? 'Name asc',
          ...(params.search?.trim() ? { SearchText: params.search.trim() } : {}),
        },
      })
      .pipe(
        map((response) => ({
          data: response.items.map((item) => this.mapApiItem(item)),
          total: response.totalCount,
          page: params.page,
          limit: params.limit,
        })),
      );
  }

  create(data: ICreateHolidayList) {
    return this.http
      .post<IHolidayListApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  getById(id: string) {
    return this.http
      .get<IHolidayListApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: IUpdateHolidayList) {
    return this.http
      .put<IHolidayListApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private mapApiItem(item: IHolidayListApiItem): IHolidayList {
    return {
      id: item.id,
      name: item.name.trim(),
      calculateAttendanceOnOffDays: item.calculateAttendanceOnOffDays ?? false,
      totalDays: item.totalDays ?? item.days?.length ?? 0,
      days: (item.days ?? [])
        .map((day) => ({
          id: day.id,
          date: day.date,
          title: day.title.trim(),
        }))
        .sort((left, right) => left.date.localeCompare(right.date)),
      creationTime: item.creationTime,
      creatorId: item.creatorId,
      lastModificationTime: item.lastModificationTime,
      lastModifierId: item.lastModifierId,
      deletionTime: item.deletionTime,
      deleterId: item.deleterId,
      isDeleted: item.isDeleted,
    };
  }

  private toApiPayload(data: ICreateHolidayList | IUpdateHolidayList) {
    return {
      name: data.name.trim(),
      calculateAttendanceOnOffDays: data.calculateAttendanceOnOffDays,
      days: data.days.map((day) => ({
        date: day.date.trim(),
        title: day.title.trim(),
      })),
    };
  }
}
