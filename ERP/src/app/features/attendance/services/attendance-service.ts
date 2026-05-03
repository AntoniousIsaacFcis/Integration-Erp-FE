import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { IEmployeeLeaveOverviewApiResponse, ILeaveApplicationApiDto, ILeaveApplicationUpdatePayload, ILeaveTypeApiDto, ILeaveTypeListResponse, IVacationResponse, VacationStatus } from '@features/attendance/models/ivacation';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { ISelectOption } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap, tap, timeout } from 'rxjs';
import { IAttendanceAvailablePeriod, IAttendanceDay, IAttendanceDayApiDto, IAttendanceDayListResponse, IAttendanceLogApiDto, IAttendanceLogListResponse, IAttendanceRelatedShift, IAttendanceResponse, ICreateAttendanceDayPayload, ICustomShiftForm, IEditAttendanceDay, IShift, IShiftApiListResponse, IShiftAssignment, IShiftAssignmentApiListResponse, IShiftAssignmentPayload, IShiftListItem, IShiftListResponse, IShiftOption, IShiftPayload, ISpecialShiftListResponse, IUpdateAttendancePayload } from '../models/iattendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);
  private staffService = inject(StaffService);
  private readonly API_URL = `${environment.baseUrl}/api`;
  private readonly SHIFT_API_URL = `${this.API_URL}/attendance/shift`;
  private readonly SHIFT_ASSIGNMENT_API_URL = `${this.API_URL}/attendance/shift-assignment`;
  private readonly relatedShiftRequests = new Map<string, Observable<IAttendanceRelatedShift | null>>();

  getAttendance(empId: string, year: string, month: string): Observable<IAttendanceDay[]> {
    const yearNumber = Number(year);
    const monthNumber = Number(month);
    const fromDate = new Date(yearNumber, monthNumber - 1, 1);
    const toDate = new Date(yearNumber, monthNumber, 0, 23, 59, 59);

    return this.http.get<IAttendanceLogListResponse | { data?: IAttendanceLogApiDto[] } | IAttendanceLogApiDto[]>(`${this.API_URL}/attendance/attendance-log`, {
      params: {
        EmployeeId: empId,
        FromLogDateTime: this.toDateTimeParam(fromDate),
        ToLogDateTime: this.toDateTimeParam(toDate),
        SkipCount: '0',
        MaxResultCount: '1000',
      }
    }).pipe(
      timeout(8000),
      map(response => {
        return this.toAttendanceDaysFromLogs(this.extractAttendanceLogs(response));
      }),
    );
  }

  getAllAttendance(params: {
    page: number;
    limit: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
  }): Observable<IAttendanceResponse> {
    const mappedStatus = this.mapAttendanceStatusFilter(params.status);
    const normalizedSearch = this.normalizeSearchText(params.search);
    const requiresLocalSearch = Boolean(normalizedSearch);

    return forkJoin({
      attendance: this.http.get<IAttendanceDayListResponse>(`${this.API_URL}/attendance/attendance-day`, {
        params: {
          skipCount: (requiresLocalSearch ? 0 : (params.page - 1) * params.limit).toString(),
          maxResultCount: (requiresLocalSearch ? 1000 : params.limit).toString(),
          sorting: 'Date DESC',
          ...(params.fromDate && { fromDate: params.fromDate }),
          ...(params.toDate && { toDate: params.toDate }),
          ...(mappedStatus && { status: mappedStatus.toString() }),
        }
      }),
      staff: this.staffService.getStaff({ skipCount: 0, maxResultCount: 1000, filter: '' }).pipe(
        catchError(() => of({ totalCount: 0, items: [] })),
      ),
    }).pipe(
      map(({ attendance, staff }) => {
        const staffLookup = new Map(
          staff.items
            .filter((item): item is IStaffApiItem & { id: string } => Boolean(item.id))
            .map(item => [item.id, this.getStaffDisplayName(item)]),
        );
        const data = attendance.items
          .map(item => this.toAttendanceLog(item, staffLookup))
          .filter(item => this.matchesAttendanceSearch(item, normalizedSearch))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const pagedData = requiresLocalSearch
          ? data.slice((params.page - 1) * params.limit, params.page * params.limit)
          : data;

        return {
          data: pagedData,
          total: requiresLocalSearch ? data.length : attendance.totalCount,
          page: params.page,
          limit: params.limit,
        };
      }),
    );
  }

  getShifts(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    createdAt?: string;
  }): Observable<IShiftListResponse> {
    const normalizedSearch = params.search?.trim();
    const typeSearch = this.getShiftTypeSearch(normalizedSearch);
    const requiresLocalFiltering = Boolean(typeSearch || params.status);
    const requestLimit = requiresLocalFiltering ? 1000 : params.limit;

    return this.http.get<IShiftApiListResponse | IShiftListResponse>(this.SHIFT_API_URL, {
      params: {
        skipCount: (requiresLocalFiltering ? 0 : (params.page - 1) * params.limit).toString(),
        maxResultCount: requestLimit.toString(),
        ...(normalizedSearch && !typeSearch && {
          filter: normalizedSearch,
          search: normalizedSearch,
          searchTerm: normalizedSearch,
          q: normalizedSearch
        }),
        ...(typeSearch && {
          type: typeSearch,
          shiftType: typeSearch,
          Type: typeSearch,
        }),
        ...(params.status && {
          status: params.status,
          isActive: String(params.status === 'active'),
          IsActive: String(params.status === 'active'),
        }),
        ...(params.createdAt && { creationTime: params.createdAt, createdAt: params.createdAt })
      }
    }).pipe(
      map(response => this.toShiftListResponse(response, params.page, params.limit, params.createdAt, normalizedSearch, params.status))
    );
  }

  getShiftById(id: string): Observable<IShift> {
    return this.http.get<IShift>(`${this.SHIFT_API_URL}/${id}`);
  }

  deleteShift(id: string): Observable<void> {
    return this.http.delete<void>(`${this.SHIFT_API_URL}/${id}`);
  }

  private toShiftListResponse(
    response: IShiftApiListResponse | IShiftListResponse,
    page: number,
    limit: number,
    createdAt?: string,
    search?: string,
    status?: string,
  ): IShiftListResponse {
    if ('data' in response) {
      const data = response.data
        .filter(shift => this.matchesCreationDate(shift.createdAt, createdAt))
        .map(shift => this.normalizeShiftListItem(shift))
        .filter(shift => this.matchesShiftSearch(shift, search))
        .filter(shift => this.matchesShiftStatus(shift, status));
      const requiresLocalFiltering = Boolean(this.getShiftTypeSearch(search) || status);

      return {
        ...response,
        data: requiresLocalFiltering ? data.slice((page - 1) * limit, page * limit) : data,
        total: requiresLocalFiltering ? data.length : response.total,
      };
    }

    const data = response.items
      .map(shift => this.normalizeShiftListItem(shift))
      .filter(shift => this.matchesCreationDate(shift.createdAt, createdAt))
      .filter(shift => this.matchesShiftSearch(shift, search))
      .filter(shift => this.matchesShiftStatus(shift, status));
    const requiresLocalFiltering = Boolean(this.getShiftTypeSearch(search) || status);
    const pagedData = requiresLocalFiltering ? data.slice((page - 1) * limit, page * limit) : data;

    return {
      data: pagedData,
      total: requiresLocalFiltering ? data.length : response.totalCount,
      page,
      limit,
    };
  }

  private normalizeShiftListItem(shift: IShift | IShiftListItem): IShiftListItem {
    const record = shift as unknown as Record<string, unknown>;
    const days = shift.days ?? [];
    const workDaysCount = days.filter(day => day.isWorkDay).length;
    const daysCount = 'daysCount' in shift && typeof shift.daysCount === 'number'
      ? shift.daysCount
      : workDaysCount;
    const holidayDaysCount = 'holidayDaysCount' in shift && typeof shift.holidayDaysCount === 'number'
      ? shift.holidayDaysCount
      : Math.max(days.length ? days.length - workDaysCount : 0, 0);
    const employeeCount = this.getNumericField(shift, 'employeeCount', 'employeesCount', 'assignedEmployeesCount');
    const isActive = typeof shift.isActive === 'boolean' ? shift.isActive : shift.status === 'active';

    return {
      ...shift,
      name: shift.name || shift.nameAr || shift.nameEn || '',
      nameAr: shift.nameAr || shift.name || shift.nameEn || '',
      nameEn: shift.nameEn || shift.name || shift.nameAr || '',
      type: String(shift.type ?? ''),
      daysCount,
      employeeCount,
      holidayDaysCount,
      status: isActive ? 'active' : 'inactive',
      createdAt: String(record['createdAt'] ?? record['creationTime'] ?? ''),
    };
  }

  private getNumericField(source: unknown, ...keys: string[]) {
    const record = source as Record<string, unknown>;
    const value = keys.map(key => record[key]).find(item => typeof item === 'number');

    return typeof value === 'number' ? value : 0;
  }

  private matchesCreationDate(createdAt: string, selectedDate?: string) {
    if (!selectedDate) {
      return true;
    }

    return createdAt?.slice(0, 10) === selectedDate;
  }

  private matchesShiftSearch(shift: IShiftListItem, search?: string) {
    const normalizedSearch = this.normalizeSearchText(search);

    if (!normalizedSearch) {
      return true;
    }

    return [
      shift.name,
      shift.nameAr,
      shift.nameEn,
      shift.type,
      ...this.getShiftTypeSearchLabels(shift.type),
    ].some(value => this.normalizeSearchText(value).includes(normalizedSearch));
  }

  private matchesShiftStatus(shift: IShiftListItem, status?: string) {
    return !status || shift.status === status;
  }

  private getShiftTypeSearch(search?: string) {
    const normalizedSearch = this.normalizeSearchText(search);

    if (!normalizedSearch) {
      return '';
    }

    const labelsByType: Record<string, string[]> = {
      '1': ['قياسية', 'قياسيه', 'standard'],
      '2': ['مرنة', 'مرنه', 'flexible'],
    };

    return Object.entries(labelsByType)
      .find(([, labels]) => labels.some(label => this.normalizeSearchText(label).includes(normalizedSearch)))?.[0] ?? '';
  }

  private getShiftTypeSearchLabels(type: string | number) {
    return Number(type) === 2
      ? ['مرنة', 'مرنه', 'flexible']
      : ['قياسية', 'قياسيه', 'standard'];
  }

  private normalizeSearchText(value?: string | number | null) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه');
  }

  createShift(shift: IShiftPayload | ICustomShiftForm) {
    return this.http.post<IShift>(this.SHIFT_API_URL, shift);
  }

  updateShift(id: string, shift: IShiftPayload) {
    return this.http.put<IShift>(`${this.SHIFT_API_URL}/${id}`, shift);
  }

  getShiftOptions(): Observable<IShiftOption[]> {
    return this.http.get<IShiftApiListResponse>(this.SHIFT_API_URL, {
      params: {
        skipCount: '0',
        maxResultCount: '1000',
      },
    }).pipe(
      map(response => response.items
        .filter(shift => shift.isActive !== false)
        .map(shift => ({
          id: shift.id,
          displayName: shift.name || shift.nameAr || shift.nameEn || shift.id,
        }))),
    );
  }

  createShiftAssignment(payload: IShiftAssignmentPayload) {
    return this.http.post<IShiftAssignment>(this.SHIFT_ASSIGNMENT_API_URL, payload);
  }

  getShiftAssignmentById(id: string): Observable<IShiftAssignment> {
    return this.http.get<IShiftAssignment>(`${this.SHIFT_ASSIGNMENT_API_URL}/${id}`);
  }

  updateShiftAssignment(id: string, payload: IShiftAssignmentPayload): Observable<IShiftAssignment> {
    return this.http.put<IShiftAssignment>(`${this.SHIFT_ASSIGNMENT_API_URL}/${id}`, payload);
  }

  deleteShiftAssignment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.SHIFT_ASSIGNMENT_API_URL}/${id}`);
  }

  getAvailableYears(): Observable<ISelectOption[]> {
    return this.http.get<ISelectOption[]>(`${this.API_URL}/attendance/available-years`);
  }

  getAvailablePeriods(employeeId: string): Observable<IAttendanceAvailablePeriod[]> {
    return this.http.get<IAttendanceAvailablePeriod[] | { result?: IAttendanceAvailablePeriod[] }>(
      `${this.API_URL}/attendance/attendance-log/available-periods`,
      { params: { EmployeeId: employeeId } },
    ).pipe(
      map(response => Array.isArray(response) ? response : response.result ?? []),
    );
  }

  getAttendanceDayForDate(employeeId: string, date: string): Observable<IAttendanceDayApiDto | null> {
    return this.http.get<IAttendanceDayListResponse>(`${this.API_URL}/attendance/attendance-day`, {
      params: {
        EmployeeId: employeeId,
        FromDate: date,
        ToDate: date,
        SkipCount: '0',
        MaxResultCount: '1',
      },
    }).pipe(
      map(response => response.items?.[0] ?? null),
    );
  }

  createAttendanceDay(payload: ICreateAttendanceDayPayload): Observable<IAttendanceDayApiDto> {
    return this.http.post<IAttendanceDayApiDto>(`${this.API_URL}/attendance/attendance-day`, payload);
  }

  deleteAttendanceDay(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/attendance/attendance-day/${id}`);
  }

  getRelatedAttendanceShift(employeeId: string, date: string): Observable<IAttendanceRelatedShift | null> {
    const key = `${employeeId}|${date}`;
    const cachedRequest = this.relatedShiftRequests.get(key);

    if (cachedRequest) {
      return cachedRequest;
    }

    const request = this.http.get<IAttendanceRelatedShift | null>(
      `${this.API_URL}/attendance/attendance-lookup/related-shift/${employeeId}`,
      { params: { date } },
    ).pipe(
      tap(shift => {
        if (!shift) {
          this.relatedShiftRequests.delete(key);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.relatedShiftRequests.set(key, request);
    return request;
  }

  getVacations(params: { employeeId: string; year: string; month?: string; page: number; limit: number }): Observable<IVacationResponse> {
    const month = params.month && params.month !== '0' ? params.month : undefined;

    return this.http.get<IEmployeeLeaveOverviewApiResponse>(
      `${this.API_URL}/core-hR/leave-application/employee-overview`,
      {
        params: {
          StaffId: params.employeeId,
          Year: params.year,
          ...(month && { Month: month }),
          SkipCount: String((params.page - 1) * params.limit),
          MaxResultCount: String(params.limit),
        }
      }
    ).pipe(
      map(response => ({
        data: response.items.map(item => this.toVacation(item)),
        stats: {
          annualBalance: response.annualBalance,
          sickBalance: response.sickBalance,
          remainingBalance: response.remainingBalance,
        },
        total: response.totalCount,
        page: params.page,
        limit: params.limit,
      })),
    );
  }

  getLeaveApplicationById(id: string): Observable<ILeaveApplicationApiDto> {
    return this.http.get<ILeaveApplicationApiDto>(`${this.API_URL}/core-hR/leave-application/${id}`);
  }

  updateLeaveApplication(id: string, payload: ILeaveApplicationUpdatePayload): Observable<ILeaveApplicationApiDto> {
    return this.http.put<ILeaveApplicationApiDto>(`${this.API_URL}/core-hR/leave-application/${id}`, payload);
  }

  approveLeaveApplication(id: string): Observable<ILeaveApplicationApiDto> {
    return this.http.post<ILeaveApplicationApiDto>(`${this.API_URL}/core-hR/leave-application/${id}/approve`, {});
  }

  rejectLeaveApplication(id: string): Observable<ILeaveApplicationApiDto> {
    return this.http.post<ILeaveApplicationApiDto>(`${this.API_URL}/core-hR/leave-application/${id}/reject`, {});
  }

  cancelLeaveApplication(id: string): Observable<ILeaveApplicationApiDto> {
    return this.http.post<ILeaveApplicationApiDto>(`${this.API_URL}/core-hR/leave-application/${id}/cancel`, {});
  }

  getLeaveTypes(): Observable<ILeaveTypeApiDto[]> {
    return this.http.get<ILeaveTypeListResponse>(`${this.API_URL}/core-hR/leave-type`, {
      params: {
        SkipCount: '0',
        MaxResultCount: '1000',
      },
    }).pipe(
      map(response => response.items ?? []),
    );
  }

  getSpecialShifts(params: {
    page: number;
    limit?: number;
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Observable<ISpecialShiftListResponse> {
    const limit = params.limit || 10;
    const normalizedSearch = params.search?.trim();

    return this.http.get<IShiftAssignmentApiListResponse>(this.SHIFT_ASSIGNMENT_API_URL, {
      params: {
        skipCount: ((params.page - 1) * limit).toString(),
        maxResultCount: limit.toString(),
        ...(normalizedSearch && {
          filter: normalizedSearch,
          search: normalizedSearch,
          searchTerm: normalizedSearch,
          q: normalizedSearch,
        }),
        ...(params.fromDate && { startDate: params.fromDate }),
        ...(params.toDate && { endDate: params.toDate }),
        ...(params.status && {
          status: params.status,
          isActive: String(params.status === 'active'),
          IsActive: String(params.status === 'active'),
        }),
      }
    }).pipe(
      map(response => ({
        data: (response.items ?? []).map(item => ({
          id: item.id,
          name: item.name,
          nameAr: item.name,
          nameEn: item.name,
          assignedShiftName: item.assignedShiftName,
          startDate: item.startDate,
          endDate: item.endDate,
          isActive: item.isActive !== false,
          criteriaType: Number(item.criteriaType),
          priority: Number(item.priority),
          employeeCount: item.employeeIds?.length ?? 0,
          excludedEmployeeCount: item.excludedEmployeeIds?.length ?? 0,
        })),
        total: response.totalCount,
        page: params.page,
        limit,
      })),
    );
  }

  getAttendanceById(id: string): Observable<IEditAttendanceDay> {
    return forkJoin({
      attendance: this.http.get<IAttendanceDayApiDto>(`${this.API_URL}/attendance/attendance-day/${id}`),
      staff: this.staffService.getStaff({ skipCount: 0, maxResultCount: 1000, filter: '' }).pipe(
        catchError(() => of({ totalCount: 0, items: [] })),
      ),
    }).pipe(
      map(({ attendance, staff }) => {
        const staffLookup = new Map(
          staff.items
            .filter((item): item is IStaffApiItem & { id: string } => Boolean(item.id))
            .map(item => [item.id, this.getStaffDisplayName(item)]),
        );

        return this.toEditAttendanceDay(attendance, staffLookup);
      }),
    );
  }

  updateAttendance(id: string, payload: IUpdateAttendancePayload): Observable<void> {
    return this.http.get<IAttendanceDayApiDto>(`${this.API_URL}/attendance/attendance-day/${id}`).pipe(
      switchMap(current =>
        this.http.put<IAttendanceDayApiDto>(
          `${this.API_URL}/attendance/attendance-day/${id}`,
          this.toUpdateAttendanceDayPayload(current, payload),
        ),
      ),
      map(() => undefined),
    );
  }

  private extractAttendanceLogs(response: IAttendanceLogListResponse | { data?: IAttendanceLogApiDto[] } | IAttendanceLogApiDto[]) {
    if (Array.isArray(response)) {
      return response;
    }

    const record = response as IAttendanceLogListResponse & { data?: IAttendanceLogApiDto[] };
    return record.items ?? record.data ?? [];
  }

  private toAttendanceDaysFromLogs(logs: IAttendanceLogApiDto[]): IAttendanceDay[] {
    const logsByDate = new Map<string, IAttendanceLogApiDto[]>();

    for (const log of logs) {
      const dateKey = this.toLogDateKey(log);

      if (!dateKey) {
        continue;
      }

      const dayLogs = logsByDate.get(dateKey) ?? [];
      dayLogs.push(log);
      logsByDate.set(dateKey, dayLogs);
    }

    return Array.from(logsByDate.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateKey, dayLogs]) => this.toAttendanceDayFromLogs(dateKey, dayLogs));
  }

  private toAttendanceDayFromLogs(dateKey: string, logs: IAttendanceLogApiDto[]): IAttendanceDay {
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(this.getLogDateTime(a)).getTime() - new Date(this.getLogDateTime(b)).getTime(),
    );
    const signInLog = sortedLogs.find(log => this.getLogDirection(log) === 1) ?? sortedLogs[0];
    const signOutLog = [...sortedLogs].reverse().find(log => this.getLogDirection(log) === 2) ?? sortedLogs.at(-1);
    const date = new Date(`${dateKey}T00:00:00`);
    const signInTime = this.getLogDateTime(signInLog);
    const signOutTime = signOutLog ? this.getLogDateTime(signOutLog) : null;

    return {
      dayNumber: date.getDate(),
      date: dateKey,
      dayName: this.toDayNameKey(date),
      isWorkDay: true,
      checkIn: this.toTimeLabel(signInTime),
      checkOut: signOutLog && this.getLogId(signOutLog) !== this.getLogId(signInLog)
        ? this.toTimeLabel(signOutTime)
        : null,
      status: 'present',
      statusText: 'STATUS.WORK',
    };
  }

  private toLogDateKey(log: IAttendanceLogApiDto) {
    const value = this.getLogAttendanceDate(log) || this.getLogDateTime(log);
    return value ? value.slice(0, 10) : '';
  }

  private getLogId(log: IAttendanceLogApiDto | undefined) {
    return this.getLogValue<string>(log, 'id', 'Id');
  }

  private getLogDateTime(log: IAttendanceLogApiDto | undefined) {
    return this.getLogValue<string>(log, 'logDateTime', 'LogDateTime') ?? '';
  }

  private getLogAttendanceDate(log: IAttendanceLogApiDto | undefined) {
    return this.getLogValue<string>(log, 'attendanceDate', 'AttendanceDate');
  }

  private getLogDirection(log: IAttendanceLogApiDto) {
    const rawDirection = this.getLogValue<number | string>(log, 'direction', 'Direction');

    if (typeof rawDirection === 'number') {
      return rawDirection;
    }

    const normalizedDirection = String(rawDirection ?? '').trim().toLowerCase();

    if (normalizedDirection === 'in' || normalizedDirection === 'signin' || normalizedDirection === 'sign in') {
      return 1;
    }

    if (normalizedDirection === 'out' || normalizedDirection === 'signout' || normalizedDirection === 'sign out') {
      return 2;
    }

    return Number(normalizedDirection);
  }

  private getLogValue<T>(log: IAttendanceLogApiDto | undefined, camelKey: string, pascalKey: string): T | undefined {
    if (!log) {
      return undefined;
    }

    const record = log as unknown as Record<string, T | undefined>;
    return record[camelKey] ?? record[pascalKey];
  }

  private toDayNameKey(date: Date): IAttendanceDay['dayName'] {
    const days: IAttendanceDay['dayName'][] = [
      'DAYS.SUNDAY',
      'DAYS.MONDAY',
      'DAYS.TUESDAY',
      'DAYS.WEDNESDAY',
      'DAYS.THURSDAY',
      'DAYS.FRIDAY',
      'DAYS.SATURDAY',
    ];

    return days[date.getDay()];
  }

  private toTimeLabel(value?: string | null) {
    if (!value) {
      return null;
    }

    const timeOnlyMatch = value.match(/^(\d{1,2}):(\d{2})/);

    if (timeOnlyMatch) {
      const hours = Number(timeOnlyMatch[1]);
      const minutes = Number(timeOnlyMatch[2]);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return this.formatTime(date);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return this.formatTime(date);
  }

  private formatTime(value: Date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(value);
  }

  private toDateKey(value: string) {
    return value.slice(0, 10);
  }

  private toDateParam(value: Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toDateTimeParam(value: Date) {
    return `${this.toDateParam(value)}T${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}:${String(value.getSeconds()).padStart(2, '0')}`;
  }

  private toVacation(item: ILeaveApplicationApiDto) {
    const isDurationBasedType = item.type === 3 || item.type === 4;
    const isSameDayRequest = item.type === 2 || isDurationBasedType;
    const leaveTypeName = this.toLeaveTypeDisplayName(item.leaveTypeName);

    return {
      id: item.id,
      empId: item.staffId,
      typeLabel: isDurationBasedType
        ? this.toLeaveTypeLabelKey(item.type)
        : leaveTypeName || this.toLeaveTypeLabelKey(item.type),
      typeLabelIsTranslationKey: isDurationBasedType || !leaveTypeName,
      applicationDate: item.applicationDate ?? item.creationDate ?? item.creationTime ?? '',
      startDate: item.dateFrom,
      endDate: isSameDayRequest ? null : this.toReturnDate(item.dateTo),
      status: this.toVacationStatus(item.status),
      reason: item.description?.trim() || '-',
    };
  }

  private toLeaveTypeLabelKey(type: number) {
    const labels: Record<number, string> = {
      1: 'EMPLOYEES.VACATIONS.TYPE_FULL_DAY',
      2: 'EMPLOYEES.VACATIONS.TYPE_HALF_DAY',
      3: 'EMPLOYEES.VACATIONS.TYPE_LATE_ARRIVAL',
      4: 'EMPLOYEES.VACATIONS.TYPE_EARLY_LEAVE',
    };

    return labels[type] ?? 'EMPLOYEES.VACATIONS.TYPE_FULL_DAY';
  }

  private toLeaveTypeDisplayName(value?: string | null) {
    return (value ?? '')
      .replace(/^\s*[A-Za-z0-9_]+\s*-\s*/u, '')
      .replace(/\s*-\s*[A-Za-z0-9_]+\s*$/u, '')
      .trim();
  }

  private toVacationStatus(status: number): VacationStatus {
    const statuses: Record<number, VacationStatus> = {
      1: 'EMPLOYEES.VACATIONS.PENDING',
      2: 'EMPLOYEES.VACATIONS.APPROVED',
      3: 'EMPLOYEES.VACATIONS.REJECTED',
      4: 'EMPLOYEES.VACATIONS.CANCELLED',
    };

    return statuses[status] ?? 'EMPLOYEES.VACATIONS.PENDING';
  }

  private toAttendanceLog(item: IAttendanceDayApiDto, staffLookup: Map<string, string>): IAttendanceResponse['data'][number] {
    const checkIn = this.toClockTime(item.signInTime);
    const checkOut = this.toClockTime(item.signOutTime);

    return {
      id: item.id,
      employeeId: item.employeeId,
      employeeName: staffLookup.get(item.employeeId) ?? item.employeeId,
      department: '',
      date: item.date,
      checkIn: checkIn ?? '',
      checkOut: checkOut ?? '',
      status: this.toAttendanceStatusKey(item.status),
      workedMinutes: item.workedMinutes,
    };
  }

  private toEditAttendanceDay(item: IAttendanceDayApiDto, staffLookup: Map<string, string>): IEditAttendanceDay {
    return {
      id: item.id,
      employeeId: item.employeeId,
      employeeName: staffLookup.get(item.employeeId) ?? item.employeeId,
      date: this.toDateKey(item.date),
      status: this.toAttendanceStatusKey(item.status),
      shiftId: item.shiftId ?? null,
      shiftName: null,
      shiftStart: this.toClockTime(item.onDutyTime) ?? '',
      shiftEnd: this.toClockTime(item.offDutyTime) ?? '',
      checkIn: this.toClockTime(item.signInTime),
      checkOut: this.toClockTime(item.signOutTime),
      leaveTypeId: item.leaveTypeId ?? null,
      notes: item.notes ?? null,
    };
  }

  private toUpdateAttendanceDayPayload(current: IAttendanceDayApiDto, payload: IUpdateAttendancePayload) {
    const isPresent = payload.status === 'present';
    const isOnLeave = payload.status === 'onLeave';

    return {
      employeeId: current.employeeId,
      shiftId: payload.shiftId ?? current.shiftId ?? null,
      date: payload.date,
      status: this.mapAttendanceStatusFilter(payload.status) ?? current.status,
      dayOffReason: current.dayOffReason ?? null,
      onDutyTime: isPresent ? this.toApiDateTime(payload.date, payload.shiftStart) : null,
      offDutyTime: isPresent ? this.toApiDateTime(payload.date, payload.shiftEnd) : null,
      signInTime: isPresent ? this.toApiDateTime(payload.date, payload.checkIn) : null,
      signOutTime: isPresent ? this.toApiDateTime(payload.date, payload.checkOut) : null,
      calculationType: current.calculationType,
      workedMinutes: current.workedMinutes,
      delayMinutes: current.delayMinutes,
      earlyLeaveMinutes: current.earlyLeaveMinutes,
      calculatedAt: current.calculatedAt ?? null,
      leaveTypeId: isOnLeave ? payload.leaveTypeId ?? null : null,
      leaveCount: isOnLeave ? 1 : 0,
      notes: payload.notes?.trim() || null,
      attendanceSheetId: current.attendanceSheetId ?? null,
      attendancePermissionId: current.attendancePermissionId ?? null,
    };
  }

  private toAttendanceStatusKey(status: number): IAttendanceResponse['data'][number]['status'] {
    switch (status) {
      case 1:
        return 'present';
      case 2:
        return 'absent';
      case 3:
        return 'onLeave';
      default:
        return 'absent';
    }
  }

  private mapAttendanceStatusFilter(status?: string) {
    switch (status) {
      case 'present':
        return 1;
      case 'absent':
        return 2;
      case 'onLeave':
        return 3;
      default:
        return undefined;
    }
  }

  private toClockTime(value?: string | null) {
    if (!value) {
      return null;
    }

    const timeOnlyMatch = value.match(/^(\d{1,2}):(\d{2})/);

    if (timeOnlyMatch) {
      const hours = String(Number(timeOnlyMatch[1])).padStart(2, '0');
      const minutes = timeOnlyMatch[2];

      return `${hours}:${minutes}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private toApiDateTime(dateValue: string, timeValue?: string | null) {
    if (!timeValue) {
      return null;
    }

    const timeOnlyMatch = timeValue.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);

    if (!timeOnlyMatch) {
      return timeValue;
    }

    const hours = String(Number(timeOnlyMatch[1])).padStart(2, '0');
    const minutes = timeOnlyMatch[2];
    const seconds = timeOnlyMatch[3] ?? '00';

    return `${this.toDateKey(dateValue)}T${hours}:${minutes}:${seconds}`;
  }

  private getStaffDisplayName(staff: IStaffApiItem) {
    const composedName = [staff.firstName, staff.middleName, staff.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ')
      .trim();

    return staff.fullNameAr?.trim()
      || staff.fullName?.trim()
      || staff.fullNameEn?.trim()
      || composedName
      || staff.staffCode?.trim()
      || staff.id;
  }

  private matchesAttendanceSearch(item: IAttendanceResponse['data'][number], normalizedSearch: string) {
    if (!normalizedSearch) {
      return true;
    }

    return [
      item.employeeName,
      item.employeeId,
    ].some(value => this.normalizeSearchText(value).includes(normalizedSearch));
  }

  private toReturnDate(dateValue: string) {
    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    date.setDate(date.getDate() + 1);
    return this.toDateParam(date);
  }
}


