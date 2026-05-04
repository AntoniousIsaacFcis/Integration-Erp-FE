import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { NotificationService } from '@core/services/notification-service';
import { IAttendanceLogListItem } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock3, lucideX } from '@ng-icons/lucide';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { AttendanceEmployeeLookupComponent, IAttendanceEmployeeLookupItem } from '../employee-lookup-component/employee-lookup-component';

@Component({
  selector: 'app-sign-attendance-log-modal-component',
  imports: [
    TranslocoModule,
    NgIcon,
    AttendanceEmployeeLookupComponent,
    TableStatusBadgeComponent,
    DatePipe,
  ],
  templateUrl: './sign-attendance-log-modal-component.html',
  styleUrl: './sign-attendance-log-modal-component.css',
  providers: [DatePipe, provideIcons({ lucideX, lucideClock3 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignAttendanceLogModalComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly datePipe = inject(DatePipe);

  sessionId = input.required<string>();
  sessionDate = input.required<string>();
  recentLogs = input<IAttendanceLogListItem[]>([]);

  closed = output<void>();
  signed = output<void>();

  selectedEmployee = signal<IAttendanceEmployeeLookupItem | null>(null);
  lookupResetKey = signal(0);
  isSubmitting = signal(false);
  private readonly openedAt = Date.now();
  private readonly clockTick = signal(Date.now());

  readonly elapsedTime = computed(() => {
    const diff = Math.max(0, this.clockTick() - this.openedAt);
    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  });

  readonly sessionTitle = computed(() => {
    const dateValue = new Date(this.sessionDate());
    const formattedDate = Number.isNaN(dateValue.getTime())
      ? this.sessionDate()
      : this.datePipe.transform(dateValue, 'dd/MM/yyyy') ?? this.sessionDate();

    return `جلسة حضور ${formattedDate}`;
  });

  constructor() {
    const intervalId = window.setInterval(() => {
      this.clockTick.set(Date.now());
    }, 1000);

    this.destroyRef.onDestroy(() => window.clearInterval(intervalId));
  }

  onClose() {
    this.closed.emit();
  }

  onSign() {
    const employee = this.selectedEmployee();
    if (!employee || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.attendanceService.signAttendanceLog({
      employeeId: employee.id,
      sessionId: this.sessionId(),
    }).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          message: 'ATTENDANCE.SIGN_ATTENDANCE_SUCCESS',
          isModal: false,
          actionLabel: 'COMMON.OK',
        });

        this.lookupResetKey.update(value => value + 1);
        this.selectedEmployee.set(null);
        this.isSubmitting.set(false);
        this.signed.emit();
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

  private getErrorMessage(error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error
      ? (error as { message?: unknown }).message
      : null;

    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'COMMON.MESSAGES.PLEASE_TRY_AGAIN';
  }
}
