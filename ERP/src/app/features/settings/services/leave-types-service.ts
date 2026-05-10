import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { catchError, map, of, Observable } from 'rxjs';
import {
  ICreateLeaveType,
  IGetLeaveTypeListInput,
  ILeaveType,
  ILeaveTypeApiItem,
  ILeaveTypeApiResponse,
  ILeaveTypeListResponse,
  ILeaveTypeLookupItem,
  IUpdateLeaveType,
} from '../models/ileave-type';

@Injectable({
  providedIn: 'root',
})
export class LeaveTypesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/core-hR/leave-type`;

  getManagementData(params: IGetLeaveTypeListInput): Observable<ILeaveTypeListResponse> {
    const normalizedSearch = params.search?.trim().toLowerCase();

    return this.http
      .get<ILeaveTypeApiResponse>(this.API_URL, {
        params: {
          skipCount: '0',
          maxResultCount: '1000',
        },
      })
      .pipe(
        map((response) => response.items.map((item) => this.mapApiItem(item))),
        map((items) => {
          const filtered = normalizedSearch
            ? items.filter((item) =>
                [item.code, item.name, item.description, item.color]
                  .filter(Boolean)
                  .some((value) => value.toLowerCase().includes(normalizedSearch)),
              )
            : items;

          const sorted = [...filtered].sort((left, right) => left.name.localeCompare(right.name));
          const total = sorted.length;
          const start = (params.page - 1) * params.limit;

          return {
            data: sorted.slice(start, start + params.limit),
            total,
            page: params.page,
            limit: params.limit,
          };
        }),
      );
  }

  readonly lookupResource = rxResource({
    stream: () =>
      this.http
        .get<ILeaveTypeApiResponse>(this.API_URL, {
          params: { skipCount: '0', maxResultCount: '1000' },
        })
        .pipe(
          map((response) => response.items.map((item) => this.mapApiItem(item))),
          catchError(() => of([])),
        ),
  });

  readonly lookupList = computed<ILeaveTypeLookupItem[]>(() =>
    (this.lookupResource.value() ?? []).map((leaveType) => ({
      id: leaveType.id,
      displayName: leaveType.name,
      color: leaveType.color,
    })),
  );

  create(data: ICreateLeaveType) {
    return this.http
      .post<ILeaveTypeApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  getById(id: string) {
    return this.http
      .get<ILeaveTypeApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: IUpdateLeaveType) {
    return this.http
      .put<ILeaveTypeApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  reloadLookups() {
    this.lookupResource.reload();
  }

  private mapApiItem(item: ILeaveTypeApiItem): ILeaveType {
    return {
      id: item.id,
      code: item.code?.trim() || '',
      name: item.name.trim(),
      color: item.color?.trim() || '#4e5381',
      description: item.description?.trim() || '',
      maxDaysPerYear: this.toNullableNumber(item.maxDaysPerYear),
      maxContinuousDaysApplicable: this.toNullableNumber(item.maxContinuousDaysApplicable),
      applicableAfterDays: this.toNullableNumber(item.applicableAfterDays),
      requiresPermission: item.requiresPermission ?? false,
      overrideWeekendOffDays: item.overrideWeekendOffDays ?? false,
      allowOutsideLeavePolicy: item.allowOutsideLeavePolicy ?? true,
      paid: item.paid ?? true,
      creationTime: item.creationTime,
      creatorId: item.creatorId,
      lastModificationTime: item.lastModificationTime,
      lastModifierId: item.lastModifierId,
      deletionTime: item.deletionTime,
      deleterId: item.deleterId,
      isDeleted: item.isDeleted,
    };
  }

  private toApiPayload(data: ICreateLeaveType | IUpdateLeaveType) {
    return {
      code: data.code?.trim() || null,
      name: data.name.trim(),
      color: data.color?.trim() || '#4e5381',
      description: data.description?.trim() || null,
      maxDaysPerYear: this.toNullableNumber(data.maxDaysPerYear),
      maxContinuousDaysApplicable: this.toNullableNumber(data.maxContinuousDaysApplicable),
      applicableAfterDays: this.toNullableNumber(data.applicableAfterDays),
      requiresPermission: data.requiresPermission,
      overrideWeekendOffDays: data.overrideWeekendOffDays,
      allowOutsideLeavePolicy: data.allowOutsideLeavePolicy,
      paid: data.paid,
    };
  }

  private toNullableNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = typeof value === 'number' ? value : Number.parseInt(value.trim(), 10);
    return Number.isFinite(normalized) ? normalized : null;
  }
}
