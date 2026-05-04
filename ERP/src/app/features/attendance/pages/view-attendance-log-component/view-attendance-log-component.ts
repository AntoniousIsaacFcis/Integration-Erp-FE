import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideTrash2 } from '@ng-icons/lucide';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { NotificationService } from '@core/services/notification-service';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { IAttendanceLogListItem } from '@features/attendance/models/iattendance';

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

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  statusFilter = signal('');
  selectedDate = signal('');

  attendanceStatusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: '1', label: 'ATTENDANCE.LOG_STATUS.PENDING' },
    { value: '2', label: 'ATTENDANCE.LOG_STATUS.VALID' },
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
}
