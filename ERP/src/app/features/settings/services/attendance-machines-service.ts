import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { map, Observable } from 'rxjs';
import {
  IAttendanceMachine,
  IAttendanceMachineApiItem,
  IAttendanceMachineApiResponse,
  IAttendanceMachineListResponse,
  ICreateAttendanceMachine,
  IGetAttendanceMachineListInput,
  IUpdateAttendanceMachine,
} from '../models/iattendance-machine';

@Injectable({
  providedIn: 'root',
})
export class AttendanceMachinesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/api/attendance/attendance-machine`;

  getManagementData(params: IGetAttendanceMachineListInput): Observable<IAttendanceMachineListResponse> {
    return this.http
      .get<IAttendanceMachineApiResponse>(this.API_URL, {
        params: {
          Page: String(params.page),
          Limit: String(params.limit),
          Sorting: params.sorting ?? 'Name asc',
          ...(params.search?.trim() ? { SearchText: params.search.trim() } : {}),
          ...(typeof params.isActive === 'boolean' ? { IsActive: String(params.isActive) } : {}),
          ...(params.machineType?.trim() ? { MachineType: params.machineType.trim() } : {}),
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

  getById(id: string) {
    return this.http
      .get<IAttendanceMachineApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((item) => this.mapApiItem(item)));
  }

  create(data: ICreateAttendanceMachine) {
    return this.http
      .post<IAttendanceMachineApiItem>(this.API_URL, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  update(id: string, data: IUpdateAttendanceMachine) {
    return this.http
      .put<IAttendanceMachineApiItem>(`${this.API_URL}/${id}`, this.toApiPayload(data))
      .pipe(map((item) => this.mapApiItem(item)));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private mapApiItem(item: IAttendanceMachineApiItem): IAttendanceMachine {
    const normalizedCode = item.code?.trim() || item.serialNumber?.trim() || '';

    return {
      id: item.id,
      name: item.name.trim(),
      code: normalizedCode,
      serialNumber: item.serialNumber?.trim() || normalizedCode,
      machineType: item.machineType.trim(),
      hostName: item.hostName?.trim() || '',
      port: this.toNullableNumber(item.port),
      description: item.description?.trim() || '',
      importFilePath: item.importFilePath?.trim() || '',
      webhookUrl: item.webhookUrl?.trim() || '',
      isActive: item.isActive ?? true,
      lastPullTime: item.lastPullTime ?? null,
      lastPullDate: item.lastPullDate ?? null,
      lastPullRecordCount: item.lastPullRecordCount ?? 0,
      totalPulledSigns: item.totalPulledSigns ?? 0,
      lastPullError: item.lastPullError?.trim() || '',
      creationTime: item.creationTime,
      creatorId: item.creatorId,
      lastModificationTime: item.lastModificationTime,
      lastModifierId: item.lastModifierId,
      deletionTime: item.deletionTime,
      deleterId: item.deleterId,
      isDeleted: item.isDeleted,
    };
  }

  private toApiPayload(data: ICreateAttendanceMachine | IUpdateAttendanceMachine) {
    const code = data.code?.trim() || '';
    const serialNumber = data.serialNumber?.trim() || '';
    const normalizedIdentifier = serialNumber || code;

    return {
      name: data.name.trim(),
      code: code || normalizedIdentifier || null,
      serialNumber: serialNumber || normalizedIdentifier || null,
      machineType: data.machineType.trim(),
      hostName: data.hostName?.trim() || null,
      port: this.toNullableNumber(data.port),
      description: data.description?.trim() || null,
      importFilePath: data.importFilePath?.trim() || null,
      webhookUrl: data.webhookUrl?.trim() || null,
      isActive: data.isActive,
    };
  }

  private toNullableNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const normalized = typeof value === 'number' ? value : Number.parseInt(value.trim(), 10);
    return Number.isFinite(normalized) ? normalized : null;
  }
}
