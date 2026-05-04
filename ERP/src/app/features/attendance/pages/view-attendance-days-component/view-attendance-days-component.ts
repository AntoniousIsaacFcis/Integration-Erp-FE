import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCloudUpload, lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
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
  providers: [provideIcons({ lucidePencil, lucideEye, lucideTrash2, lucideCloudUpload, lucideCheckCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAttendanceDaysComponent {
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  fromDate = signal<string>('');
  toDate = signal<string>('');
  statusFilter = signal<'present' | 'absent' | 'onLeave' | ''>('');

  attendanceResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      fromDate: this.fromDate() || undefined,
      toDate: this.toDate() || undefined,
      status: this.statusFilter() || undefined
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


  attendanceStatusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'present', label: 'Enum:AttendanceStatus.Present' },
    { value: 'absent', label: 'Enum:AttendanceStatus.Absent' },
    { value: 'onLeave', label: 'Enum:AttendanceStatus.OnLeave' }
  ];
  calculateTotalHours(checkIn?: string, checkOut?: string, workedMinutes?: number): string {
    if (typeof workedMinutes === 'number' && workedMinutes > 0) {
      return this.formatDuration(workedMinutes);
    }

    const checkInMinutes = this.toMinutes(checkIn);
    const checkOutMinutes = this.toMinutes(checkOut);

    if (checkInMinutes === null || checkOutMinutes === null) {
      return '00:00';
    }

    let diffInMinutes = checkOutMinutes - checkInMinutes;
    if (diffInMinutes < 0) diffInMinutes += 24 * 60;

    return this.formatDuration(diffInMinutes);
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

  private toMinutes(value?: string | null) {
    if (!value) {
      return null;
    }

    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);

    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return null;
    }

    return (hours * 60) + minutes;
  }

  private formatDuration(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

