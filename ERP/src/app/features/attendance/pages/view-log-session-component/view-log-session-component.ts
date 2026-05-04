import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
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
  ],
  templateUrl: './view-log-session-component.html',
  styleUrl: './view-log-session-component.css',
  providers: [provideIcons({ lucideCheckCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewLogSessionComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  selectedStatus = signal('');
  sessionDate = signal('');

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
    const openSession = this.sessions().find(session => session.status === 1) ?? this.sessions()[0];

    if (!openSession) {
      return;
    }

    this.openSessionDetails(openSession.id);
  }

  handleBack() {
    this.router.navigate(['/attendance/view-log-session']);
  }
}
