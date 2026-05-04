import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendanceLogSessionListItem } from '@features/attendance/models/iattendance';
import { TranslocoModule } from '@jsverse/transloco';
import { lucideCheckCircle } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { NgIcon } from '@ng-icons/core';
import { lucideEye, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-view-log-session-component',
  imports: [
    TranslocoModule,
    DatePipe,
    AppBaseTableComponent,
    ActionBtnComponent,
    DateFilterComponent,
    EmptyTablePlaceholderComponent,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
    NgIcon,
  ],
  templateUrl: './view-log-session-component.html',
  styleUrl: './view-log-session-component.css',
  providers: [provideIcons({ lucideCheckCircle, lucideEye, lucideTrash2 })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewLogSessionComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  selectedStatus = signal('');
  sessionDate = signal('');
  isCreatingSession = signal(false);

  statusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: '1', label: 'ATTENDANCE.LOG_SESSION_STATUS.OPEN' },
    { value: '2', label: 'ATTENDANCE.LOG_SESSION_STATUS.CLOSED' },
  ];

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.selectedStatus();
      this.sessionDate();
      this.currentPage.set(1);
    },
  { allowSignalWrites: true },
);

  sessionsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.selectedStatus() || undefined,
      sessionDate: this.sessionDate() || undefined,
    }),
    stream: ({ params }) => this.attendanceService.getAttendanceLogSessions(params),
  });

  sessions = computed(() => this.sessionsResource.value()?.data ?? []);
  totalItems = computed(() => this.sessionsResource.value()?.total ?? 0);

  normalizeSource(session: IAttendanceLogSessionListItem) {
    return session.sourceDisplay?.trim() || '';
  }

  openSessionDetails(sessionId: string) {
    this.router.navigate(['/attendance/view-log-session/details', sessionId]);
  }

  handleDailyRegistration() {
    if (this.isCreatingSession()) {
      return;
    }

    this.isCreatingSession.set(true);

    const now = new Date();
    const payload = {
      sessionDate: this.toLocalDateTime(now).slice(0, 10) + 'T00:00:00',
      openedAt: this.toLocalDateTime(now),
    };

    this.attendanceService.createAttendanceLogSession(payload).subscribe({
      next: session => {
        this.isCreatingSession.set(false);
        this.router.navigate(['/attendance/view-log-session/details', session.id]);
      },
      error: () => {
        this.isCreatingSession.set(false);
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

  handleBack() {
    this.router.navigate(['/attendance/view-log-session']);
  }

  handleDelete(sessionId: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'COMMON.DELETE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteSession(sessionId),
    });
  }

  private deleteSession(sessionId: string) {
    this.attendanceService.deleteAttendanceLogSession(sessionId).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.sessionsResource.reload();
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

  private toLocalDateTime(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
