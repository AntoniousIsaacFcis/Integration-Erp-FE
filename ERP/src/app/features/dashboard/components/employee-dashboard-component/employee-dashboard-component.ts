import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { NotificationService } from '@core/services/notification-service';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBarChart3,
  lucideBell,
  lucideCalendarDays,
  lucideClipboardList,
  lucideClock3,
  lucideFileText,
  lucideShieldCheck,
  lucideSun,
} from '@ng-icons/lucide';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendanceDay, IAttendanceRelatedShift, IShift } from '@features/attendance/models/iattendance';
import { IUnifiedRequestListItem } from '@features/attendance/models/ipermissions';
import { IVacationResponse } from '@features/attendance/models/ivacation';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { isDashboardAdminUser } from '@features/dashboard/utils/dashboard-role';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { HolidayListsService } from '@features/settings/services/holiday-lists-service';
import { catchError, map, of, switchMap } from 'rxjs';

type ShiftCardData = {
  summary: IAttendanceRelatedShift;
  details: IShift | null;
};

type AttendanceActionKind = 'check-in' | 'check-out' | 'view-logs';
type CalendarTone = 'present' | 'absent' | 'leave' | 'off' | 'partial' | 'empty';

interface QuickActionItem {
  labelKey: string;
  route: string;
  icon: string;
  accent: 'green' | 'blue' | 'gold' | 'slate';
}

interface CalendarLegendItem {
  tone: CalendarTone;
  labelKey: string;
}

interface CalendarCell {
  kind: 'empty' | 'day';
  dayNumber?: number;
  attendance?: IAttendanceDay | null;
  isToday?: boolean;
  isWorkDay?: boolean;
  tone?: CalendarTone;
}

interface UpcomingHolidayItem {
  title: string;
  date: string;
  listName: string;
}

@Component({
  selector: 'app-employee-dashboard-component',
  imports: [
    TranslocoModule,
    NgIcon,
    EmptyTablePlaceholderComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './employee-dashboard-component.html',
  styleUrl: './employee-dashboard-component.css',
  providers: [provideIcons({ lucideShieldCheck, lucideCalendarDays, lucideClipboardList, lucideFileText, lucideClock3, lucideBell, lucideBarChart3 ,lucideSun})],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDashboardComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly holidayListsService = inject(HolidayListsService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly staffService = inject(StaffService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  private readonly today = new Date();
  readonly currentDateLabel = this.formatLongDate(this.today);
  readonly currentMonthLabel = this.formatMonthYear(this.today);
  readonly currentDateKey = this.toDateKey(this.today);
  readonly currentYear = String(this.today.getFullYear());
  readonly currentMonth = String(this.today.getMonth() + 1);
  readonly calendarWeekdayKeys = [
    'DAYS.SATURDAY',
    'DAYS.SUNDAY',
    'DAYS.MONDAY',
    'DAYS.TUESDAY',
    'DAYS.WEDNESDAY',
    'DAYS.THURSDAY',
    'DAYS.FRIDAY',
  ];
  readonly calendarLegend: CalendarLegendItem[] = [
    { tone: 'present', labelKey: 'Enum:AttendanceStatus.Present' },
    { tone: 'absent', labelKey: 'Enum:AttendanceStatus.Absent' },
    { tone: 'leave', labelKey: 'Enum:AttendanceStatus.OnLeave' },
    { tone: 'off', labelKey: 'Enum:AttendanceStatus.DayOff' },
  ];

  readonly quickActions: QuickActionItem[] = [
    {
      labelKey: 'MENU.VIEW_ATTENDANCE_DAYS',
      route: '/attendance/view-attendance-days',
      icon: 'lucideCalendarDays',
      accent: 'blue',
    },
    {
      labelKey: 'BUTTON.ADD_LEAVE_APPLICATION',
      route: '/attendance/view-permissions/create-leave-application',
      icon: 'lucideClipboardList',
      accent: 'green',
    },
    {
      labelKey: 'BUTTON.ADD_ATTENDANCE_PERMISSION',
      route: '/attendance/view-permissions/create-attendance-permission',
      icon: 'lucideShieldCheck',
      accent: 'gold',
    },
    {
      labelKey: 'MENU.VIEW_ATTENDANCE_LOGS',
      route: '/attendance/view-attendance-log',
      icon: 'lucideFileText',
      accent: 'slate',
    },
  ];

  readonly currentStaffResource = rxResource({
    stream: () => this.attendanceService.getCurrentLeaveApplicationStaff(),
  });

  readonly employeeId = computed(() => this.currentStaffResource.value()?.id ?? '');
  readonly employeeName = computed(() =>
    this.currentStaffResource.value()?.displayName?.trim()
      || this.authService.currentUser()?.userName
      || '',
  );
  readonly employeeCode = computed(() => this.currentStaffResource.value()?.staffCode?.trim() ?? '');
  readonly employeeEmail = computed(() => this.authService.currentUser()?.email?.trim() ?? '');
  readonly canOpenAdminStatistics = computed(() => isDashboardAdminUser(this.authService));

  readonly staffDirectoryResource = rxResource({
    stream: () => this.staffService.getStaff({ skipCount: 0, maxResultCount: 1000, filter: '' }).pipe(
      catchError(() => of({ totalCount: 0, items: [] })),
    ),
  });

  readonly staffDirectory = computed(() => this.staffDirectoryResource.value()?.items ?? []);
  readonly currentStaffDetails = computed(() =>
    this.staffDirectory().find(staff => staff.id === this.employeeId()) ?? null,
  );
  readonly currentDepartment = computed(() => {
    const employeeId = this.employeeId();
    const departmentId = this.currentStaffDetails()?.departmentId;
    const departments = this.departmentsService.departmentsResource.value() ?? [];

    return departments.find(department => department.id === departmentId)
      ?? departments.find(department => department.employeeStaffIds.includes(employeeId))
      ?? null;
  });
  readonly employeeDepartmentName = computed(() => this.currentDepartment()?.name?.trim() ?? '');
  readonly departmentManagerName = computed(() => {
    const managerIds = this.currentDepartment()?.managerStaffIds ?? [];
    const managerNames = managerIds
      .map(managerId => this.staffDirectory().find(staff => staff.id === managerId))
      .filter((staff): staff is IStaffApiItem => Boolean(staff))
      .map(staff => this.getStaffDisplayName(staff))
      .filter(Boolean);

    return managerNames.join(', ');
  });

  readonly attendanceDaysResource = rxResource({
    params: () => {
      const employeeId = this.employeeId();
      return employeeId
        ? { employeeId, year: this.currentYear, month: this.currentMonth }
        : undefined;
    },
    stream: ({ params }) => this.attendanceService.getAttendance(params.employeeId, params.year, params.month).pipe(
      catchError(() => of([] as IAttendanceDay[])),
    ),
  });

  readonly attendanceDays = computed(() =>
    (this.attendanceDaysResource.value() ?? []).slice().sort((a, b) => a.dayNumber - b.dayNumber),
  );
  readonly todayAttendance = computed(() =>
    this.attendanceDays().find(day => this.toDateKey(day.date) === this.currentDateKey) ?? null,
  );

  readonly currentShiftResource = rxResource({
    params: () => {
      const employeeId = this.employeeId();
      return employeeId
        ? { employeeId, date: this.currentDateKey }
        : undefined;
    },
    stream: ({ params }) => this.attendanceService.getRelatedAttendanceShift(params.employeeId, params.date).pipe(
      switchMap(shift => {
        if (!shift) {
          return of(null);
        }

        return this.attendanceService.getShiftById(shift.id).pipe(
          map(details => ({ summary: shift, details } satisfies ShiftCardData)),
          catchError(() => of({ summary: shift, details: null } satisfies ShiftCardData)),
        );
      }),
      catchError(() => of(null)),
    ),
  });

  readonly currentShift = computed(() => this.currentShiftResource.value() ?? null);
  readonly currentShiftWorkDays = computed(() =>
    this.currentShift()?.details?.days
      ?.filter(day => day.isWorkDay)
      .map(day => this.toDayLabel(day.dayOfWeek))
      ?? [],
  );

  readonly vacationResource = rxResource({
    params: () => {
      const employeeId = this.employeeId();
      return employeeId
        ? { employeeId, year: this.currentYear, month: this.currentMonth, page: 1, limit: 5 }
        : undefined;
    },
    stream: ({ params }) => this.attendanceService.getVacations(params).pipe(
      catchError(() => of(this.emptyVacationResponse())),
    ),
  });

  readonly leaveStats = computed(() => this.vacationResource.value()?.stats ?? this.emptyVacationResponse().stats);
  readonly latestVacation = computed(() => this.vacationResource.value()?.data?.[0] ?? null);

  readonly requestsResource = rxResource({
    params: () => {
      const employeeId = this.employeeId();
      return employeeId
        ? { employeeId, page: 1, limit: 5 }
        : undefined;
    },
    stream: ({ params }) => this.attendanceService.getUnifiedRequests(params).pipe(
      catchError(() => of(this.emptyRequestViewResponse())),
    ),
  });

  readonly requests = computed(() => this.requestsResource.value()?.data ?? []);

  readonly updatesResource = rxResource({
    params: () => {
      const employeeId = this.employeeId();
      return employeeId
        ? { employeeId, page: 1, limit: 3 }
        : undefined;
    },
    stream: ({ params }) => this.attendanceService.getAttendanceLogs(params).pipe(
      catchError(() => of(this.emptyLogsViewResponse())),
    ),
  });

  readonly updates = computed(() => this.updatesResource.value()?.data ?? []);

  readonly holidayListsResource = rxResource({
    stream: () => this.holidayListsService.getManagementData({
      page: 1,
      limit: 100,
      sorting: 'Name asc',
    }).pipe(
      catchError(() => of({ data: [], total: 0, page: 1, limit: 100 })),
    ),
  });

  readonly upcomingHoliday = computed<UpcomingHolidayItem | null>(() => {
    const startOfToday = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    const upcomingDays = (this.holidayListsResource.value()?.data ?? [])
      .flatMap(list => (list.days ?? []).map(day => ({
        title: day.title,
        date: day.date,
        listName: list.name,
      })))
      .filter(day => {
        const parsedDate = this.toCalendarDate(day.date);
        return parsedDate && parsedDate.getTime() >= startOfToday.getTime();
      })
      .sort((left, right) => left.date.localeCompare(right.date));

    return upcomingDays[0] ?? null;
  });

  readonly attendanceAction = computed(() => {
    const todayAttendance = this.todayAttendance();

    if (todayAttendance?.checkIn && todayAttendance?.checkOut) {
      return { kind: 'view-logs' as const, labelKey: 'MENU.VIEW_ATTENDANCE_LOGS', icon: 'lucideFileText' };
    }

    if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
      return { kind: 'check-out' as const, labelKey: 'ATTENDANCE.CHECK_OUT', icon: 'lucideClock3' };
    }

    return { kind: 'check-in' as const, labelKey: 'ATTENDANCE.CHECK_IN', icon: 'lucideClock3' };
  });

  readonly isAttendanceActionLoading = signal(false);

  readonly currentAttendanceStatusTone = computed(() => this.todayAttendance()?.status ?? 'empty');
  readonly currentAttendanceStatusLabel = computed(() => {
    const attendance = this.todayAttendance();

    if (!attendance) {
      return 'DASHBOARD.NO_ATTENDANCE_DATA';
    }

    return attendance.statusText || 'DASHBOARD.NO_ATTENDANCE_DATA';
  });

  readonly currentAttendanceSummary = computed(() => {
    const attendance = this.todayAttendance();

    if (!attendance) {
      return null;
    }

    const checkIn = this.formatClock(attendance.checkIn);
    const checkOut = this.formatClock(attendance.checkOut);

    if (!checkIn && !checkOut) {
      return null;
    }

    return `${checkIn || '--:--'} · ${checkOut || '--:--'}`;
  });

  readonly attendanceTimeSummaryKey = computed(() =>
    this.currentAttendanceSummary() ? null : 'DASHBOARD.NO_ATTENDANCE_DATA',
  );

  readonly attendanceState = computed(() => {
    const todayAttendance = this.todayAttendance();

    if (todayAttendance?.checkIn && todayAttendance?.checkOut) {
      return 'completed';
    }

    if (todayAttendance?.checkIn) {
      return 'in-progress';
    }

    return 'idle';
  });

  readonly monthCalendarCells = computed<CalendarCell[]>(() => {
    const year = this.today.getFullYear();
    const monthIndex = this.today.getMonth();
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const leadingEmptyCells = (new Date(year, monthIndex, 1).getDay() + 1) % 7;
    const attendanceByDay = new Map(this.attendanceDays().map(day => [day.dayNumber, day]));
    const cells: CalendarCell[] = Array.from({ length: leadingEmptyCells }, () => ({ kind: 'empty' }));

    for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
      const attendance = attendanceByDay.get(dayNumber) ?? null;
      const calendarDate = new Date(year, monthIndex, dayNumber);

      cells.push({
        kind: 'day',
        dayNumber,
        attendance,
        isToday: dayNumber === this.today.getDate(),
        isWorkDay: attendance?.isWorkDay ?? calendarDate.getDay() !== 5,
        tone: this.toCalendarTone(attendance),
      });
    }

    return cells;
  });

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  handleAttendanceAction() {
    if (this.isAttendanceActionLoading()) {
      return;
    }

    const action = this.attendanceAction();

    if (action.kind === 'view-logs') {
      this.router.navigate(['/attendance/view-attendance-log']);
      return;
    }

    this.isAttendanceActionLoading.set(true);

    const request$ = action.kind === 'check-in'
      ? this.attendanceService.checkInMyAttendance()
      : this.attendanceService.checkOutMyAttendance();

    request$.subscribe({
      next: () => {
        this.isAttendanceActionLoading.set(false);
        this.reloadDashboardSections();
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          message: action.kind === 'check-in' ? 'ATTENDANCE.CHECK_IN_SUCCESS' : 'ATTENDANCE.CHECK_OUT_SUCCESS',
          isModal: false,
          actionLabel: 'COMMON.OK',
        });
      },
      error: (error: unknown) => {
        this.isAttendanceActionLoading.set(false);
        this.notificationService.show({
          type: 'error',
          title: 'COMMON.MESSAGES.OPERATION_FAILED',
          message: this.getErrorMessage(error),
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
      },
    });
  }

  openRequest(request: IUnifiedRequestListItem) {
    if (this.isLeaveRequest(request)) {
      this.router.navigate(['/attendance/view-permissions/leave-application-details', request.id]);
      return;
    }

    this.router.navigate(['/attendance/view-permissions/attendance-permission-details', request.id]);
  }

  openAllRequests() {
    this.router.navigate(['/attendance/view-permissions']);
  }

  isLeaveRequest(request: IUnifiedRequestListItem) {
    return request.requestType === 1 || request.requestType === 2;
  }

  isDayMetric(request: IUnifiedRequestListItem) {
    return request.daysCount !== null && request.daysCount !== undefined;
  }

  formatMetric(request: IUnifiedRequestListItem) {
    if (request.daysCount !== null && request.daysCount !== undefined) {
      return `${request.daysCount}`;
    }

    if (request.durationMinutes !== null && request.durationMinutes !== undefined) {
      return `${request.durationMinutes}`;
    }

    return '--';
  }

  formatRequestTypeKey(request: IUnifiedRequestListItem) {
    return request.typeLabelKey;
  }

  formatDateTime(value: string) {
    return this.formatLongDateTime(new Date(value));
  }

  formatDisplayDate(value: string) {
    const parsedDate = this.toCalendarDate(value);

    if (!parsedDate) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  formatLogSource(value: string) {
    return value?.trim() || '';
  }

  attendanceCardClass() {
    return `dashboard-card dashboard-card--attendance dashboard-card--attendance-${this.attendanceState()}`;
  }

  quickActionClass(action: QuickActionItem) {
    return `quick-action quick-action--${action.accent}`;
  }

  calendarCellClass(cell: CalendarCell) {
    if (cell.kind === 'empty') {
      return 'calendar-card__day calendar-card__day--empty';
    }

    const toneClass = `calendar-card__day--${cell.tone ?? 'empty'}`;
    const todayClass = cell.isToday ? ' calendar-card__day--today' : '';
    const offClass = cell.isWorkDay === false ? ' calendar-card__day--off' : '';

    return `calendar-card__day ${toneClass}${todayClass}${offClass}`;
  }

  calendarMarkerClass(tone?: CalendarTone) {
    return `calendar-card__marker calendar-card__marker--${tone ?? 'empty'}`;
  }

  requestReference(request: IUnifiedRequestListItem) {
    return request.referenceNumber || request.id.slice(0, 8).toUpperCase();
  }

  private reloadDashboardSections() {
    this.attendanceDaysResource.reload();
    this.currentShiftResource.reload();
    this.vacationResource.reload();
    this.requestsResource.reload();
    this.updatesResource.reload();
  }

  formatClock(value: string | null | undefined) {
    if (!value) {
      return '';
    }

    const clockOnly = value.match(/^(\d{1,2}):(\d{2})/);
    if (clockOnly) {
      return `${String(Number(clockOnly[1])).padStart(2, '0')}:${clockOnly[2]}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private toDateKey(value: string | Date | null | undefined) {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDayLabel(dayOfWeek: number) {
    const labels = [
      'DAYS.SUNDAY',
      'DAYS.MONDAY',
      'DAYS.TUESDAY',
      'DAYS.WEDNESDAY',
      'DAYS.THURSDAY',
      'DAYS.FRIDAY',
      'DAYS.SATURDAY',
    ];

    return labels[dayOfWeek] ?? 'DAYS.SUNDAY';
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

  private toCalendarTone(attendance: IAttendanceDay | null): CalendarTone {
    switch (attendance?.status) {
      case 'present':
        return 'present';
      case 'lateArrival':
      case 'earlyLeave':
      case 'checkInOnly':
      case 'checkOutOnly':
      case 'onPermission':
      case 'halfLeave':
        return 'partial';
      case 'onLeave':
        return 'leave';
      case 'holiday':
      case 'dayOff':
        return 'off';
      case 'absent':
        return 'absent';
      default:
        return 'empty';
    }
  }

  private toCalendarDate(value: string) {
    const datePart = value.slice(0, 10);
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatLongDate(value: Date) {
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    }).format(value);
  }

  private formatLongDateTime(value: Date) {
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  private formatMonthYear(value: Date) {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(value);
  }

  private emptyVacationResponse(): IVacationResponse {
    return {
      data: [],
      stats: {
        annualBalance: 0,
        sickBalance: 0,
        remainingBalance: 0,
      },
      total: 0,
      page: 1,
      limit: 5,
    };
  }

  private emptyRequestViewResponse() {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 5,
    };
  }

  private emptyLogsViewResponse() {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 5,
    };
  }

  private getErrorMessage(error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error
      ? (error as { message?: unknown }).message
      : null;

    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'COMMON.MESSAGES.PLEASE_TRY_AGAIN';
  }
}
