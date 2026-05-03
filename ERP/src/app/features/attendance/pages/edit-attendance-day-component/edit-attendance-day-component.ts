import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { IShiftOption, IUpdateAttendancePayload } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { timeRangeValidator } from '@shared/validators/time-range.validator';
import { catchError, map, of, startWith } from 'rxjs';

type AttendanceStatusValue = 'present' | 'absent' | 'onLeave';

@Component({
  selector: 'app-edit-attendance-day-component',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppDateInputComponent,
    AppSelectComponent,
    TimeInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
  ],
  templateUrl: './edit-attendance-day-component.html',
  styleUrl: './edit-attendance-day-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAttendanceDayComponent {
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);

  attendanceId = signal(this.route.snapshot.params['id']);
  submitted = signal(false);
  isSaving = signal(false);
  private readonly employeeId = signal('');

  attendanceForm = this.fb.nonNullable.group({
    employeeId: [''],
    employeeName: [{ value: '', disabled: true }],
    date: ['', [Validators.required]],
    status: ['present' as AttendanceStatusValue, [Validators.required]],
    shiftId: [''],
    shiftName: [''],
    leaveTypeId: [''],
    shiftStart: [''],
    shiftEnd: [''],
    checkIn: [''],
    checkOut: [''],
    notes: [''],
  }, {
    validators: [
      timeRangeValidator('shiftStart', 'shiftEnd'),
      timeRangeValidator('checkIn', 'checkOut'),
    ],
  });

  statusOptions = [
    { label: 'ATTENDANCE.PRESENT', value: 'present' },
    { label: 'ATTENDANCE.ABSENT', value: 'absent' },
    { label: 'ATTENDANCE.ON_LEAVE', value: 'onLeave' },
  ];

  private readonly statusValue = toSignal(
    this.attendanceForm.controls.status.valueChanges.pipe(startWith(this.attendanceForm.controls.status.value)),
  );
  private readonly shiftIdValue = toSignal(
    this.attendanceForm.controls.shiftId.valueChanges.pipe(startWith(this.attendanceForm.controls.shiftId.value)),
  );
  private readonly dateValue = toSignal(
    this.attendanceForm.controls.date.valueChanges.pipe(startWith(this.attendanceForm.controls.date.value)),
  );

  isPresent = computed(() => this.statusValue() === 'present');
  isLeave = computed(() => this.statusValue() === 'onLeave');

  shiftOptionsResource = rxResource({
    stream: () => this.attendanceService.getShiftOptions().pipe(
      catchError(() => of([] as IShiftOption[])),
    ),
  });

  selectedShiftResource = rxResource({
    params: () => this.shiftIdValue() || null,
    stream: ({ params }) => {
      if (!params) {
        return of(null);
      }

      return this.attendanceService.getShiftById(params).pipe(catchError(() => of(null)));
    },
  });

  relatedShiftResource = rxResource({
    params: () => {
      const employeeId = this.employeeId();
      const date = this.dateValue();

      return employeeId && date ? { employeeId, date } : null;
    },
    stream: ({ params }) => {
      if (!params) {
        return of(null);
      }

      return this.attendanceService.getRelatedAttendanceShift(params.employeeId, params.date).pipe(
        catchError(() => of(null)),
      );
    },
  });

  resolvedShift = computed(() => this.relatedShiftResource.value() ?? null);
  selectedShift = computed(() => this.selectedShiftResource.value() ?? null);
  hasResolvedShift = computed(() => Boolean(this.resolvedShift()));
  hasSelectedShift = computed(() => Boolean(this.selectedShift()));
  showShiftSelector = computed(() => Boolean(this.employeeId()) && !this.relatedShiftResource.isLoading() && !this.hasResolvedShift());
  shiftOptions = computed(() => this.shiftOptionsResource.value() ?? []);
  lockManualShiftTimes = computed(() => Boolean(this.shiftIdValue()) || this.hasResolvedShift());

  leaveTypesResource = rxResource({
    stream: () => this.attendanceService.getLeaveTypes().pipe(
      map(response => response ?? []),
      catchError(() => of([])),
    ),
  });

  leaveTypeOptions = computed(() => this.leaveTypesResource.value() ?? []);

  detailsResource = rxResource({
    params: () => ({ id: this.attendanceId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceById(params.id),
  });

  isLoading = computed(() => this.detailsResource.isLoading() || this.relatedShiftResource.isLoading() || this.isSaving());

  constructor() {
    effect(() => {
      this.configureConditionalValidators(this.statusValue() ?? 'present');
    });

    effect(() => {
      const data = this.detailsResource.value();
      if (!data) {
        return;
      }

      this.attendanceForm.patchValue({
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        date: data.date,
        status: data.status,
        shiftId: data.shiftId ?? '',
        shiftName: data.shiftName ?? '',
        leaveTypeId: data.leaveTypeId ?? '',
        shiftStart: data.shiftStart ?? '',
        shiftEnd: data.shiftEnd ?? '',
        checkIn: data.checkIn ?? '',
        checkOut: data.checkOut ?? '',
        notes: data.notes ?? '',
      });

      this.breadcrumbService.setCurrentBreadcrumbLabel(
        this.toBreadcrumbLabel(data.employeeName, data.date),
        this.route,
      );

      this.employeeId.set(data.employeeId);
    });

    effect(() => {
      const shift = this.resolvedShift();
      if (!shift) {
        return;
      }

      this.attendanceForm.patchValue({
        shiftId: shift.id,
        shiftName: shift.name,
        shiftStart: this.toTimeInputValue(shift.onDutyTime),
        shiftEnd: this.toTimeInputValue(shift.offDutyTime),
      }, { emitEvent: false });
    });

    effect(() => {
      this.patchSelectedShift(this.selectedShift());
    });
  }

  onSave() {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.submitted.set(true);

    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      this.isSaving.set(false);
      return;
    }

    this.attendanceService.updateAttendance(this.attendanceId(), this.toPayload()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notification.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          actionLabel: 'COMMON.OK',
        });
        this.router.navigate(['/attendance/view-attendance-days']);
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.notification.show({
          type: 'error',
          title: 'COMMON.MESSAGES.OPERATION_FAILED',
          message: this.getErrorMessage(error),
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/attendance/view-attendance-days']);
  }

  getControl(name: keyof typeof this.attendanceForm.controls): FormControl {
    return this.attendanceForm.controls[name] as FormControl;
  }

  private configureConditionalValidators(status: AttendanceStatusValue) {
    const timeControls = [
      this.attendanceForm.controls.shiftStart,
      this.attendanceForm.controls.shiftEnd,
      this.attendanceForm.controls.checkIn,
      this.attendanceForm.controls.checkOut,
    ];

    for (const control of timeControls) {
      control.setValidators(status === 'present' ? Validators.required : null);
      control.updateValueAndValidity({ emitEvent: false });
    }

    this.attendanceForm.controls.leaveTypeId.setValidators(status === 'onLeave' ? Validators.required : null);
    this.attendanceForm.controls.leaveTypeId.updateValueAndValidity({ emitEvent: false });
    this.attendanceForm.updateValueAndValidity({ emitEvent: false });
  }

  private toPayload(): IUpdateAttendancePayload {
    const value = this.attendanceForm.getRawValue();

    return {
      id: this.attendanceId(),
      employeeId: value.employeeId,
      date: value.date,
      status: value.status,
      shiftId: value.shiftId || null,
      shiftStart: value.status === 'present' ? value.shiftStart : '',
      shiftEnd: value.status === 'present' ? value.shiftEnd : '',
      checkIn: value.status === 'present' ? value.checkIn : null,
      checkOut: value.status === 'present' ? value.checkOut : null,
      leaveTypeId: value.status === 'onLeave' ? value.leaveTypeId || null : null,
      notes: value.notes?.trim() || null,
    };
  }

  private toBreadcrumbLabel(employeeName: string, dateValue?: string) {
    const dateLabel = this.formatDateForBreadcrumb(dateValue);

    return dateLabel
      ? `${employeeName} - ${dateLabel}`
      : employeeName;
  }

  private formatDateForBreadcrumb(value?: string) {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'dd-MMM-yyyy', undefined, 'en-US') || '';
  }

  private patchSelectedShift(shift: { name?: string; onDutyTime?: string; offDutyTime?: string } | null) {
    if (!shift) {
      return;
    }

    this.attendanceForm.patchValue({
      shiftName: shift.name,
      shiftStart: this.toTimeInputValue(shift.onDutyTime),
      shiftEnd: this.toTimeInputValue(shift.offDutyTime),
    }, { emitEvent: false });
  }

  private toTimeInputValue(value?: string | null) {
    if (!value) {
      return '';
    }

    const timePart = value.includes('T') ? value.slice(11) : value;
    return timePart.slice(0, 5);
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
