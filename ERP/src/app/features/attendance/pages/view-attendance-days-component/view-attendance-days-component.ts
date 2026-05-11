import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { ATTENDANCE_DAY_PERMISSIONS, canManageAttendanceDay } from '@features/attendance/utils/attendance-day-auth';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCloudUpload, lucideEye, lucidePencil, lucideRefreshCcw, lucideTrash2 } from '@ng-icons/lucide';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";

@Component({
  selector: 'app-view-attendance-days-component',
  imports: [TranslocoModule,
    DatePipe,
    AppBaseTableComponent,
  ActionBtnComponent,
  DateFilterComponent,
  EmptyTablePlaceholderComponent,
  NgIcon, StatusBadgeComponent, TableStatusBadgeComponent],
  templateUrl: './view-attendance-days-component.html',
  styleUrl: './view-attendance-days-component.css',
  providers: [provideIcons({ lucidePencil, lucideEye, lucideTrash2, lucideCloudUpload, lucideCheckCircle, lucideRefreshCcw })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAttendanceDaysComponent {
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);
  private authService = inject(AuthService);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  fromDate = signal<string>('');
  toDate = signal<string>('');
  statusFilter = signal<'present' | 'absent' | 'onLeave' | 'holiday' | 'dayOff' | 'lateArrival' | 'earlyLeave' | 'halfLeave' | 'onPermission' | 'checkInOnly' | 'checkOutOnly' | ''>('');

  attendanceResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      fromDate: this.fromDate() || undefined,
      toDate: this.toDate() || undefined,
      status: this.statusFilter() || undefined,
      refreshVersion: this.attendanceService.attendanceDayRefreshVersion(),
    }),
    stream: ({ params }) => {
      return this.attendanceService.getAllAttendance(params);
    }
  });

  attendanceLogs = computed(() => {
    return this.attendanceResource.value()?.data ?? [];
  });

  totalItems = computed(() => this.attendanceResource.value()?.total ?? 0);
  isLoading = computed(() => this.attendanceResource.isLoading());
  canCreateAttendanceDay = computed(() => canManageAttendanceDay(this.authService, ATTENDANCE_DAY_PERMISSIONS.create));
  canEditAttendanceDay = computed(() => canManageAttendanceDay(this.authService, ATTENDANCE_DAY_PERMISSIONS.update));
  canRecalculateAttendanceDay = computed(() => canManageAttendanceDay(this.authService, ATTENDANCE_DAY_PERMISSIONS.update));
  canDeleteAttendanceDay = computed(() => canManageAttendanceDay(this.authService, ATTENDANCE_DAY_PERMISSIONS.delete));


  attendanceStatusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'present', label: 'Enum:AttendanceStatus.Present' },
    { value: 'absent', label: 'Enum:AttendanceStatus.Absent' },
    { value: 'onLeave', label: 'Enum:AttendanceStatus.OnLeave' },
    { value: 'lateArrival', label: 'Enum:AttendanceStatus.LateArrival' },
    { value: 'earlyLeave', label: 'Enum:AttendanceStatus.EarlyLeave' },
    { value: 'halfLeave', label: 'Enum:AttendanceStatus.HalfLeave' },
    { value: 'onPermission', label: 'Enum:AttendanceStatus.OnPermission' },
    { value: 'checkInOnly', label: 'Enum:AttendanceStatus.CheckInOnly' },
    { value: 'checkOutOnly', label: 'Enum:AttendanceStatus.CheckOutOnly' },
    { value: 'holiday', label: 'Enum:AttendanceStatus.Holiday' },
    { value: 'dayOff', label: 'Enum:AttendanceStatus.DayOff' }
  ];

  formatDuration(totalMinutes?: number | null) {
    if (totalMinutes === null || totalMinutes === undefined) {
      return '--';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  formatLeaveCount(value?: number | null) {
    if (value === null || value === undefined) {
      return '--';
    }

    if (value === 1) {
      return this.translocoService.translate('ATTENDANCE.LEAVE_COUNT_FULL');
    }

    if (value === 0.5) {
      return this.translocoService.translate('ATTENDANCE.LEAVE_COUNT_HALF');
    }

    return this.translocoService.translate('ATTENDANCE.LEAVE_COUNT_VALUE', { value });
  }

  handleImport() {
    console.log('Importing logic...');
  }

  handleDailyRegistration() {
    this.router.navigate(['/attendance/view-attendance-days/create']);
  }

  handleViewDetails(id: string) {
    this.router.navigate(['/attendance/view-attendance-days/details', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/attendance/view-attendance-days/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'COMMON.DELETE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteAttendanceDay(id),
    });
  }

  handleRecalculate(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'ATTENDANCE.RECALCULATE_ATTENDANCE_DAY',
      message: 'ATTENDANCE.RECALCULATE_ATTENDANCE_DAY_CONFIRMATION',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.recalculateAttendanceDay(id),
    });
  }

  private deleteAttendanceDay(id: string) {
    this.attendanceService.deleteAttendanceDay(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.attendanceResource.reload();
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

  private recalculateAttendanceDay(id: string) {
    this.attendanceService.recalculateAttendanceDay(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.attendanceResource.reload();
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
}
