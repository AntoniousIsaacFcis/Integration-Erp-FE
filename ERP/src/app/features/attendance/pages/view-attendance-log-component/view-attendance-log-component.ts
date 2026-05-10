import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideTrash2 } from '@ng-icons/lucide';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { IAttendanceLogListItem } from '@features/attendance/models/iattendance';
import { ATTENDANCE_LOG_PERMISSIONS, canManageAttendanceLog } from '@features/attendance/utils/attendance-log-auth';

@Component({
  selector: 'app-view-attendance-log-component',
  imports: [
    TranslocoModule,
    DatePipe,
    NgIcon,
    AppBaseTableComponent,
    DateFilterComponent,
    EmptyTablePlaceholderComponent,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './view-attendance-log-component.html',
  styleUrl: './view-attendance-log-component.css',
  providers: [provideIcons({ lucideEye, lucideTrash2 })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAttendanceLogComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  statusFilter = signal('');
  selectedDate = signal('');
  isSubmitting = signal(false);

  readonly isEmployeeScopedUser = computed(() => {
    const roles = (this.authService.currentUser()?.roles ?? []).map((role: string) => role.toLowerCase());
    return roles.includes('employee') && !roles.includes('admin') && !roles.includes('hr');
  });
  readonly canDeleteAttendanceLog = computed(() =>
    canManageAttendanceLog(this.authService, ATTENDANCE_LOG_PERMISSIONS.delete));

  attendanceStatusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: '1', label: 'ATTENDANCE.LOG_STATUS.PENDING' },
    { value: '2', label: 'ATTENDANCE.LOG_STATUS.FINALIZED' },
    { value: '3', label: 'ATTENDANCE.LOG_STATUS.INVALID' },
    { value: '4', label: 'ATTENDANCE.LOG_STATUS.CHECK_IN' },
    { value: '5', label: 'ATTENDANCE.LOG_STATUS.CHECK_OUT' },
    { value: '6', label: 'ATTENDANCE.LOG_STATUS.INVALID_OUTSIDE_PERIOD' },
    { value: '7', label: 'ATTENDANCE.LOG_STATUS.INVALID_WEEKEND' },
    { value: '8', label: 'ATTENDANCE.LOG_STATUS.INVALID_NO_OPEN_PERIOD' },
  ];

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.statusFilter();
      this.selectedDate();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  attendanceLogsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      date: this.selectedDate() || undefined,
    }),
    stream: ({ params }) => this.attendanceService.getAttendanceLogs(params),
  });

  attendanceLogs = computed(() => this.attendanceLogsResource.value()?.data ?? []);
  totalItems = computed(() => this.attendanceLogsResource.value()?.total ?? 0);

  handleViewDetails(id: string) {
    this.router.navigate(['/attendance/view-attendance-log/details', id]);
  }

  handleCheckIn() {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.attendanceService.checkInMyAttendance().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          message: 'ATTENDANCE.CHECK_IN_SUCCESS',
          isModal: false,
          actionLabel: 'COMMON.OK',
        });
        this.attendanceLogsResource.reload();
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
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

  handleCheckOut() {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.attendanceService.checkOutMyAttendance().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          message: 'ATTENDANCE.CHECK_OUT_SUCCESS',
          isModal: false,
          actionLabel: 'COMMON.OK',
        });
        this.attendanceLogsResource.reload();
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
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

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'COMMON.DELETE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteAttendanceLog(id),
    });
  }

  private deleteAttendanceLog(id: string) {
    this.attendanceService.deleteAttendanceLog(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.attendanceLogsResource.reload();
      },
      error: () => {
        this.notificationService.show({
          type: 'error',
          title: 'COMMON.MESSAGES.OPERATION_FAILED',
          message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
      },
    });
  }

  normalizeSource(log: IAttendanceLogListItem) {
    return log.sourceDisplay?.trim() || '';
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
