import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendanceLogListItem, IAttendanceLogSessionApiDto } from '@features/attendance/models/iattendance';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { TabSwitcherComponent } from '@shared/components/molecules/tab-switcher-component/tab-switcher-component';
import { SignAttendanceLogModalComponent } from '../../components/sign-attendance-log-modal-component/sign-attendance-log-modal-component';

@Component({
  selector: 'app-log-session-details-component',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    DatePipe,
    AppInputComponent,
    AppDateInputComponent,
    TableStatusBadgeComponent,
    ActionBtnComponent,
    TabSwitcherComponent,
    SignAttendanceLogModalComponent,
  ],
  templateUrl: './log-session-details-component.html',
  styleUrl: './log-session-details-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogSessionDetailsComponent {
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly translocoService = inject(TranslocoService);

  sessionId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  activeTab = signal<'details' | 'logs'>('details');
  showSignModal = signal(false);
  sessionDateRaw = signal('');
  sessionDateDisplay = signal('');

  sessionForm = this.fb.nonNullable.group({
    code: [{ value: '', disabled: true }],
    sessionDate: [{ value: '', disabled: true }],
    openedAt: [{ value: '', disabled: true }],
    closedAt: [{ value: '', disabled: true }],
    source: [{ value: '', disabled: true }],
    status: [{ value: '', disabled: true }],
    signsCount: [{ value: '', disabled: true }],
    notes: [{ value: '', disabled: true }],
  });

  sessionResource = rxResource({
    params: () => ({ id: this.sessionId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceLogSessionById(params.id),
  });

  logsResource = rxResource({
    params: () => ({ id: this.sessionId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceLogs({
      page: 1,
      limit: 50,
      sessionId: params.id,
    }),
  });

  constructor() {
    effect(() => {
      const session = this.sessionResource.value();

      if (!session) {
        return;
      }

      this.sessionForm.patchValue({
        code: session.code,
        sessionDate: session.sessionDate,
        openedAt: this.formatDateTime(session.openedAt),
        closedAt: session.closedAt ? this.formatDateTime(session.closedAt) : '-',
        source: this.formatSource(session),
        status: this.translocoService.translate(this.getStatusLabelKey(session.status)),
        signsCount: String(session.signsCount ?? 0),
        notes: session.notes ?? '',
      });
      this.sessionDateRaw.set(session.sessionDate);
      this.sessionDateDisplay.set(this.formatDate(session.sessionDate));

      this.breadcrumbService.setCurrentBreadcrumbLabel(session.code, this.route);
    });
  }

  getControl(name: keyof typeof this.sessionForm.controls): FormControl {
    return this.sessionForm.controls[name] as FormControl;
  }

  openSignModal() {
    this.showSignModal.set(true);
  }

  handleDailyRegistration() {
    this.openSignModal();
  }

  closeSignModal() {
    this.showSignModal.set(false);
  }

  handleSigned() {
    this.logsResource.reload();
    this.activeTab.set('logs');
  }

  navigateBack() {
    this.router.navigate(['/attendance/view-log-session']);
  }

  get logs(): IAttendanceLogListItem[] {
    return this.logsResource.value()?.data ?? [];
  }

  private formatDate(value?: string | null) {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy') ?? value;
  }

  private formatDateTime(value?: string | null) {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') ?? value;
  }

  private formatSource(session: IAttendanceLogSessionApiDto) {
    return session.sourceName?.trim()
      || this.translocoService.translate(this.getSourceLabelKey(session.sourceType));
  }

  private getStatusLabelKey(status: number) {
    return status === 2
      ? 'ATTENDANCE.LOG_SESSION_STATUS.CLOSED'
      : 'ATTENDANCE.LOG_SESSION_STATUS.OPEN';
  }

  private getSourceLabelKey(sourceType?: string | null) {
    const normalized = String(sourceType ?? '').trim().toLowerCase();

    if (normalized === 'self' || normalized === 'self-service') {
      return 'ATTENDANCE.LOG_SOURCE.SELF_SERVICE';
    }

    if (normalized === 'admin' || normalized === 'supervisor') {
      return 'ATTENDANCE.LOG_SOURCE.ADMIN';
    }

    return 'ATTENDANCE.LOG_SOURCE.MACHINE';
  }
}
