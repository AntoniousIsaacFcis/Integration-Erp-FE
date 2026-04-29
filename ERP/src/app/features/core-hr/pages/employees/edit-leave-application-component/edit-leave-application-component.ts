import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { forkJoin, Observable, of, startWith, switchMap } from 'rxjs';

type LeaveApplicationType = 1 | 2 | 3 | 4;
type LeaveApplicationStatus = 1 | 2 | 3 | 4;

const LeaveApplicationTypes = {
  Leave: 1,
  HalfLeave: 2,
  LateArrival: 3,
  EarlyLeave: 4,
} as const;

function leaveApplicationDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dateFromControl = control.get('dateFrom');
    const dateToControl = control.get('dateTo');
    const dateFrom = toLocalDate(dateFromControl?.value);
    const dateTo = toLocalDate(dateToControl?.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    removeControlError(dateFromControl, 'pastDate');
    removeControlError(dateToControl, 'dateRangeInvalid');

    if (dateFrom && dateFrom < today) {
      setControlError(dateFromControl, 'pastDate');
    }

    if (dateFrom && dateTo && dateTo < dateFrom) {
      setControlError(dateToControl, 'dateRangeInvalid');
    }

    return null;
  };
}

function toLocalDate(value: unknown) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function setControlError(control: AbstractControl | null | undefined, errorKey: string) {
  if (!control) {
    return;
  }

  control.setErrors({ ...(control.errors ?? {}), [errorKey]: true });
}

function removeControlError(control: AbstractControl | null | undefined, errorKey: string) {
  if (!control?.errors?.[errorKey]) {
    return;
  }

  const { [errorKey]: _removed, ...remainingErrors } = control.errors;
  control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
}

@Component({
  selector: 'app-edit-leave-application-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppDateInputComponent,
    AppSelectComponent,
    AppTextareaComponent,
    TimeInputComponent,
    FormCancelButtonComponent,
    FormSaveButtonComponent,
  ],
  templateUrl: './edit-leave-application-component.html',
  styleUrl: './edit-leave-application-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLeaveApplicationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly descriptionCharacterLimit = 1000;
  readonly leaveTypeOptions = signal<Array<{ id: string; displayName: string }>>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly isFormSubmitted = signal(false);
  readonly normalAttendanceTime = signal<string | null>(null);
  readonly durationMinutesLabelKey = computed(() => {
    if (this.isLateArrivalApplication()) {
      return 'EMPLOYEES.VACATIONS.LATE_ARRIVAL_MINUTES';
    }

    if (this.isEarlyLeaveApplication()) {
      return 'EMPLOYEES.VACATIONS.EARLY_LEAVE_MINUTES';
    }

    return 'EMPLOYEES.VACATIONS.DURATION_MINUTES';
  });
  private readonly shiftContextDate = signal('');
  private attendanceTimeRequestId = 0;
  private isApplyingLoadedApplication = false;
  readonly statusWorkflowPolicies = [
    'CoreHR.LeaveApplications.Approve',
    'CoreHR.LeaveApplications.Reject',
    'CoreHR.LeaveApplications.Cancel',
  ];

  private readonly empId = this.route.snapshot.paramMap.get('empId') ?? '';
  private readonly leaveId = this.route.snapshot.paramMap.get('leaveId') ?? '';
  private attachments: string | null = null;
  private readonly originalStatus = signal('1');

  readonly leaveApplicationForm = this.fb.nonNullable.group({
    leaveTypeId: ['', [Validators.required]],
    type: ['1', [Validators.required]],
    dateFrom: ['', [Validators.required]],
    dateTo: ['', [Validators.required]],
    days: ['1', [Validators.required, Validators.min(0.5)]],
    durationMinutes: [''],
    shiftStartTime: [{ value: '', disabled: true }],
    shiftEndTime: [{ value: '', disabled: true }],
    lateTime: [''],
    earlyTime: [''],
    status: ['1', [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  }, { validators: [leaveApplicationDateValidator()] });

  private readonly descriptionValue = toSignal(
    this.leaveApplicationForm.controls.description.valueChanges,
    { initialValue: '' },
  );

  private readonly applicationTypeValue = toSignal(
    this.leaveApplicationForm.controls.type.valueChanges,
    { initialValue: this.leaveApplicationForm.controls.type.value },
  );

  readonly selectedApplicationType = computed(
    () => Number(this.applicationTypeValue()) as LeaveApplicationType,
  );
  readonly isLateArrivalApplication = computed(
    () => this.selectedApplicationType() === LeaveApplicationTypes.LateArrival,
  );
  readonly isHalfDayApplication = computed(
    () => this.selectedApplicationType() === LeaveApplicationTypes.HalfLeave,
  );
  readonly isEarlyLeaveApplication = computed(
    () => this.selectedApplicationType() === LeaveApplicationTypes.EarlyLeave,
  );
  readonly isDurationBasedApplication = computed(
    () => this.isDurationBasedType(this.selectedApplicationType()),
  );
  readonly characterCount = computed(() => this.descriptionValue().length);
  readonly isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);
  readonly canManageStatus = computed(() => {
    return this.hasStatusManagerRole() &&
      this.statusWorkflowPolicies.some(policy => this.authService.hasPermission(policy));
  });
  readonly statusOptions = computed(() => {
    const options: Array<{ value: string; labelKey: string }> = [];
    const currentStatus = this.originalStatus();

    if (currentStatus === '1') {
      options.push({ value: '1', labelKey: 'EMPLOYEES.VACATIONS.PENDING' });
    }

    if (this.authService.hasPermission('CoreHR.LeaveApplications.Approve')) {
      options.push({ value: '2', labelKey: 'EMPLOYEES.VACATIONS.APPROVED' });
    }

    if (this.authService.hasPermission('CoreHR.LeaveApplications.Reject')) {
      options.push({ value: '3', labelKey: 'EMPLOYEES.VACATIONS.REJECTED' });
    }

    if (this.authService.hasPermission('CoreHR.LeaveApplications.Cancel')) {
      options.push({ value: '4', labelKey: 'EMPLOYEES.VACATIONS.CANCELLED' });
    }

    return options.some(option => option.value === currentStatus)
      ? options
      : [{ value: currentStatus, labelKey: this.statusLabelKey(currentStatus) }, ...options];
  });

  constructor() {
    if (!this.empId || !this.leaveId) {
      this.navigateBack();
      return;
    }

    this.leaveApplicationForm.controls.type.valueChanges
      .pipe(startWith(this.leaveApplicationForm.controls.type.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isApplyingLoadedApplication) {
          return;
        }

        this.configureTypeFields();
        this.loadNormalAttendanceTime();
      });

    this.leaveApplicationForm.controls.dateFrom.valueChanges
      .pipe(startWith(this.leaveApplicationForm.controls.dateFrom.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isApplyingLoadedApplication) {
          return;
        }

        this.syncSingleDayDateTo();
        this.leaveApplicationForm.updateValueAndValidity({ emitEvent: false });
        this.updateCalculatedDays();
        this.loadNormalAttendanceTime();
      });

    this.leaveApplicationForm.controls.dateTo.valueChanges
      .pipe(startWith(this.leaveApplicationForm.controls.dateTo.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isApplyingLoadedApplication) {
          return;
        }

        this.leaveApplicationForm.updateValueAndValidity({ emitEvent: false });
        this.updateCalculatedDays();
      });

    this.leaveApplicationForm.controls.lateTime.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateDurationMinutes());

    this.leaveApplicationForm.controls.earlyTime.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateDurationMinutes());

    forkJoin({
      leaveTypes: this.attendanceService.getLeaveTypes(),
      leaveApplication: this.attendanceService.getLeaveApplicationById(this.leaveId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ leaveTypes, leaveApplication }) => {
          this.leaveTypeOptions.set(
            leaveTypes.map(type => ({
              id: type.id,
              displayName: this.toArabicLeaveTypeName(type.name || type.code || ''),
            })),
          );

          this.originalStatus.set(String(leaveApplication.status || 1));
          this.attachments = leaveApplication.attachments ?? null;
          const dateFrom = this.toDateInputValue(leaveApplication.dateFrom);
          this.shiftContextDate.set(dateFrom);
          this.isApplyingLoadedApplication = true;
          this.leaveApplicationForm.patchValue({
            leaveTypeId: leaveApplication.leaveTypeId ?? '',
            type: String(leaveApplication.type || LeaveApplicationTypes.Leave),
            dateFrom,
            dateTo: this.toDateInputValue(leaveApplication.dateTo),
            days: String(leaveApplication.days || 1),
            durationMinutes: leaveApplication.durationMinutes?.toString() ?? '',
            shiftStartTime: this.toTimeInputValue(leaveApplication.shiftStartTime),
            shiftEndTime: this.toTimeInputValue(leaveApplication.shiftEndTime),
            lateTime: this.toTimeInputValue(leaveApplication.lateTime),
            earlyTime: this.toTimeInputValue(leaveApplication.earlyTime),
            status: this.originalStatus(),
            description: leaveApplication.description ?? '',
          });
          this.isApplyingLoadedApplication = false;
          this.configureTypeFields();
          this.updateCalculatedDays();
          this.loadNormalAttendanceTime();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load leave application:', error);
          this.isLoading.set(false);
          this.navigateBack();
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) {
      return;
    }

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.configureTypeFields();
    this.updateDurationMinutes();
    this.leaveApplicationForm.updateValueAndValidity();

    if (this.leaveApplicationForm.invalid) {
      this.leaveApplicationForm.markAllAsTouched();
      return;
    }

    const formValue = this.leaveApplicationForm.getRawValue();
    const applicationType = Number(formValue.type) as LeaveApplicationType;
    const isDurationBased = this.isDurationBasedType(applicationType);

    if (isDurationBased && Number(formValue.durationMinutes) <= 0) {
      const timeControl = applicationType === LeaveApplicationTypes.LateArrival
        ? this.leaveApplicationForm.controls.lateTime
        : this.leaveApplicationForm.controls.earlyTime;
      setControlError(timeControl, 'timeRangeInvalid');
      timeControl.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.attendanceService.updateLeaveApplication(this.leaveId, {
      staffId: this.empId,
      leaveTypeId: isDurationBased ? null : formValue.leaveTypeId || null,
      days: isDurationBased ? 0 : Number(formValue.days),
      dateFrom: formValue.dateFrom,
      dateTo: applicationType === LeaveApplicationTypes.HalfLeave || isDurationBased ? formValue.dateFrom : formValue.dateTo,
      applicationDate: null,
      type: applicationType,
      durationMinutes: isDurationBased ? Number(formValue.durationMinutes) : null,
      lateTime: applicationType === LeaveApplicationTypes.LateArrival ? formValue.lateTime || null : null,
      earlyTime: applicationType === LeaveApplicationTypes.EarlyLeave ? formValue.earlyTime || null : null,
      description: formValue.description || null,
      attachments: this.attachments,
      status: Number(this.originalStatus()),
    })
      .pipe(
        switchMap(() => this.applyStatusWorkflow(Number(formValue.status) as LeaveApplicationStatus)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.navigateBack();
        },
        error: (error) => {
          console.error('Update leave application failed:', error);
          this.isSubmitting.set(false);
        },
      });
  }

  onCancel() {
    this.navigateBack();
  }

  private configureTypeFields() {
    const type = Number(this.leaveApplicationForm.controls.type.value) as LeaveApplicationType;
    const isDurationBased = this.isDurationBasedType(type);
    const isSingleDayWithoutReturnDate = type === LeaveApplicationTypes.HalfLeave || isDurationBased;
    const controls = this.leaveApplicationForm.controls;

    if (isDurationBased) {
      controls.leaveTypeId.clearValidators();
      controls.days.clearValidators();
      controls.durationMinutes.setValidators([Validators.required, Validators.min(1)]);
      controls.durationMinutes.disable({ emitEvent: false });
    } else {
      controls.leaveTypeId.setValidators([Validators.required]);
      controls.days.setValidators([Validators.required, Validators.min(0.5)]);
      controls.durationMinutes.clearValidators();
      controls.durationMinutes.enable({ emitEvent: false });
    }

    if (isSingleDayWithoutReturnDate) {
      controls.dateTo.clearValidators();
      this.syncSingleDayDateTo();
    } else {
      controls.dateTo.setValidators([Validators.required]);
    }

    if (type === LeaveApplicationTypes.LateArrival) {
      controls.lateTime.setValidators([Validators.required]);
    } else {
      controls.lateTime.clearValidators();
    }

    if (type === LeaveApplicationTypes.EarlyLeave) {
      controls.earlyTime.setValidators([Validators.required]);
    } else {
      controls.earlyTime.clearValidators();
    }

    controls.leaveTypeId.updateValueAndValidity({ emitEvent: false });
    controls.days.updateValueAndValidity({ emitEvent: false });
    controls.dateTo.updateValueAndValidity({ emitEvent: false });
    controls.durationMinutes.updateValueAndValidity({ emitEvent: false });
    controls.lateTime.updateValueAndValidity({ emitEvent: false });
    controls.earlyTime.updateValueAndValidity({ emitEvent: false });
    this.updateDurationMinutes();
    this.updateCalculatedDays();
  }

  private normalizeStringFields() {
    const descriptionControl = this.leaveApplicationForm.controls.description;
    const durationMinutesControl = this.leaveApplicationForm.controls.durationMinutes;
    const trimmedDescription = descriptionControl.value.trim();
    const trimmedDurationMinutes = durationMinutesControl.value.trim();

    if (descriptionControl.value !== trimmedDescription) {
      descriptionControl.setValue(trimmedDescription);
    }

    if (durationMinutesControl.value !== trimmedDurationMinutes) {
      durationMinutesControl.setValue(trimmedDurationMinutes);
    }
  }

  private syncSingleDayDateTo() {
    const controls = this.leaveApplicationForm.controls;
    const type = Number(controls.type.value) as LeaveApplicationType;

    if (type !== LeaveApplicationTypes.HalfLeave && !this.isDurationBasedType(type)) {
      return;
    }

    const dateFrom = controls.dateFrom.value;

    if (dateFrom && controls.dateTo.value !== dateFrom) {
      controls.dateTo.setValue(dateFrom, { emitEvent: false });
    }
  }

  private loadNormalAttendanceTime() {
    const requestId = ++this.attendanceTimeRequestId;
    const type = Number(this.leaveApplicationForm.controls.type.value) as LeaveApplicationType;
    const dateFrom = this.leaveApplicationForm.controls.dateFrom.value;

    if (!this.isDurationBasedType(type) || !dateFrom) {
      this.normalAttendanceTime.set(null);
      return;
    }

    const shiftTime = type === LeaveApplicationTypes.LateArrival
      ? this.leaveApplicationForm.controls.shiftStartTime.value
      : this.leaveApplicationForm.controls.shiftEndTime.value;

    if (shiftTime && this.shiftContextDate() === dateFrom) {
      this.normalAttendanceTime.set(shiftTime);
      this.defaultDurationTimeFromShift();
      this.updateDurationMinutes();
      return;
    }

    this.attendanceService.getAttendanceDayForDate(this.empId, dateFrom)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: attendanceDay => {
          if (!this.isCurrentAttendanceTimeRequest(requestId, type, dateFrom)) {
            return;
          }

          const shiftStartTime = this.toTimeInputValue(attendanceDay?.onDutyTime);
          const shiftEndTime = this.toTimeInputValue(attendanceDay?.offDutyTime);
          const normalTime = type === LeaveApplicationTypes.LateArrival ? shiftStartTime : shiftEndTime;
          const hasAttendanceShiftTimes = Boolean(shiftStartTime || shiftEndTime);

          if (hasAttendanceShiftTimes) {
            this.leaveApplicationForm.controls.shiftStartTime.setValue(shiftStartTime, { emitEvent: false });
            this.leaveApplicationForm.controls.shiftEndTime.setValue(shiftEndTime, { emitEvent: false });
            this.shiftContextDate.set(dateFrom);
            this.normalAttendanceTime.set(normalTime || null);
          } else {
            const currentShiftTime = type === LeaveApplicationTypes.LateArrival
              ? this.leaveApplicationForm.controls.shiftStartTime.value
              : this.leaveApplicationForm.controls.shiftEndTime.value;

            this.normalAttendanceTime.set(currentShiftTime || null);
          }

          this.defaultDurationTimeFromShift();
          this.updateDurationMinutes();
        },
        error: () => {
          if (!this.isCurrentAttendanceTimeRequest(requestId, type, dateFrom)) {
            return;
          }

          this.normalAttendanceTime.set(null);
          this.leaveApplicationForm.controls.shiftStartTime.setValue('', { emitEvent: false });
          this.leaveApplicationForm.controls.shiftEndTime.setValue('', { emitEvent: false });
          this.shiftContextDate.set('');
          this.updateDurationMinutes();
        },
      });
  }

  private defaultDurationTimeFromShift() {
    const controls = this.leaveApplicationForm.controls;
    const type = Number(controls.type.value) as LeaveApplicationType;
    const normalTime = type === LeaveApplicationTypes.LateArrival
      ? controls.shiftStartTime.value
      : controls.shiftEndTime.value;

    if (!normalTime) {
      return;
    }

    if (type === LeaveApplicationTypes.LateArrival && !controls.lateTime.value) {
      controls.lateTime.setValue(normalTime, { emitEvent: false });
    }

    if (type === LeaveApplicationTypes.EarlyLeave && !controls.earlyTime.value) {
      controls.earlyTime.setValue(normalTime, { emitEvent: false });
    }
  }

  private updateDurationMinutes() {
    const controls = this.leaveApplicationForm.controls;
    const type = Number(controls.type.value) as LeaveApplicationType;
    const timeControl = type === LeaveApplicationTypes.LateArrival
      ? controls.lateTime
      : controls.earlyTime;

    removeControlError(timeControl, 'timeRangeInvalid');

    if (!this.isDurationBasedType(type)) {
      if (controls.durationMinutes.value) {
        controls.durationMinutes.setValue('', { emitEvent: false });
      }
      return;
    }

    const normalTime = type === LeaveApplicationTypes.LateArrival
      ? controls.shiftStartTime.value
      : controls.shiftEndTime.value;
    const normalMinutes = this.toMinutes(normalTime);
    const selectedMinutes = this.toMinutes(
      type === LeaveApplicationTypes.LateArrival
        ? controls.lateTime.value
        : controls.earlyTime.value,
    );

    if (normalMinutes === null || selectedMinutes === null) {
      if (controls.durationMinutes.value) {
        controls.durationMinutes.setValue('', { emitEvent: false });
      }
      return;
    }

    const duration = type === LeaveApplicationTypes.LateArrival
      ? selectedMinutes - normalMinutes
      : normalMinutes - selectedMinutes;
    const nextValue = String(Math.max(0, duration));

    if (controls.durationMinutes.value !== nextValue) {
      controls.durationMinutes.setValue(nextValue, { emitEvent: false });
    }

    if (duration <= 0) {
      setControlError(timeControl, 'timeRangeInvalid');
    }
  }

  private applyStatusWorkflow(nextStatus: LeaveApplicationStatus): Observable<unknown> {
    const originalStatus = Number(this.originalStatus()) as LeaveApplicationStatus;

    if (!this.canManageStatus() || nextStatus === originalStatus) {
      return of(null);
    }

    if (nextStatus === 2 && this.authService.hasPermission('CoreHR.LeaveApplications.Approve')) {
      return this.attendanceService.approveLeaveApplication(this.leaveId);
    }

    if (nextStatus === 3 && this.authService.hasPermission('CoreHR.LeaveApplications.Reject')) {
      return this.attendanceService.rejectLeaveApplication(this.leaveId);
    }

    if (nextStatus === 4 && this.authService.hasPermission('CoreHR.LeaveApplications.Cancel')) {
      return this.attendanceService.cancelLeaveApplication(this.leaveId);
    }

    return of(null);
  }

  private hasStatusManagerRole() {
    const roles = this.authService.currentUser()?.roles ?? [];
    const statusManagerRoles = ['admin', 'hr'];
    return roles.some((role: string) => statusManagerRoles.includes(role.toLowerCase()));
  }

  private statusLabelKey(status: string) {
    const labels: Record<string, string> = {
      '1': 'EMPLOYEES.VACATIONS.PENDING',
      '2': 'EMPLOYEES.VACATIONS.APPROVED',
      '3': 'EMPLOYEES.VACATIONS.REJECTED',
      '4': 'EMPLOYEES.VACATIONS.CANCELLED',
    };

    return labels[status] ?? 'EMPLOYEES.VACATIONS.PENDING';
  }

  private updateCalculatedDays() {
    const controls = this.leaveApplicationForm.controls;

    if (this.isDurationBasedType(Number(controls.type.value) as LeaveApplicationType)) {
      controls.days.disable({ emitEvent: false });
      if (controls.days.value !== '0') {
        controls.days.setValue('0', { emitEvent: false });
      }
      return;
    }

    controls.days.disable({ emitEvent: false });

    const calculatedDays = this.calculateDays(controls.dateFrom.value, controls.dateTo.value);

    if (calculatedDays === null) {
      return;
    }

    const nextValue = String(calculatedDays);

    if (controls.days.value !== nextValue) {
      controls.days.setValue(nextValue, { emitEvent: false });
    }
  }

  private calculateDays(dateFrom: string, dateTo: string) {
    const type = Number(this.leaveApplicationForm.controls.type.value) as LeaveApplicationType;

    if (type === LeaveApplicationTypes.HalfLeave) {
      return 0.5;
    }

    const start = toLocalDate(dateFrom);
    const end = toLocalDate(dateTo);

    if (!start || !end || end < start) {
      return null;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
  }

  private toArabicLeaveTypeName(value: string) {
    return value
      .replace(/^\s*[A-Za-z0-9_]+\s*-\s*/u, '')
      .replace(/\s*-\s*[A-Za-z0-9_]+\s*$/u, '')
      .trim();
  }

  private isDurationBasedType(type: LeaveApplicationType) {
    return type === LeaveApplicationTypes.LateArrival || type === LeaveApplicationTypes.EarlyLeave;
  }

  private navigateBack() {
    this.router.navigate(['/core-hr/employees/details', this.empId], {
      queryParams: { tab: 'vacations' },
    });
  }

  private toDateInputValue(value: string) {
    return value?.slice(0, 10) ?? '';
  }

  private toTimeInputValue(value?: string | null) {
    if (!value) {
      return '';
    }

    const normalizedValue = value.trim();
    const timeOnlyMatch = normalizedValue.match(/^(\d{1,2}):(\d{2})/);
    const dateTimeMatch = normalizedValue.match(/[T\s](\d{1,2}):(\d{2})/);
    const match = timeOnlyMatch ?? dateTimeMatch;

    if (!match) {
      return '';
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (!this.isValidClockTime(hours, minutes)) {
      return '';
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private isCurrentAttendanceTimeRequest(requestId: number, type: LeaveApplicationType, dateFrom: string) {
    return requestId === this.attendanceTimeRequestId
      && Number(this.leaveApplicationForm.controls.type.value) === type
      && this.leaveApplicationForm.controls.dateFrom.value === dateFrom;
  }

  private toMinutes(value?: string | null) {
    if (!value) {
      return null;
    }

    const normalizedValue = value
      .trim()
      .replace('صباحاً', 'AM')
      .replace('صباحا', 'AM')
      .replace('مساءً', 'PM')
      .replace('مساء', 'PM');
    const meridiemMatch = normalizedValue.match(/\b(AM|PM)\b/i);
    const timeMatch = normalizedValue.match(/(\d{1,2}):(\d{2})/);

    if (!timeMatch) {
      return null;
    }

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    if (meridiemMatch) {
      const meridiem = meridiemMatch[1].toUpperCase();

      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      }

      if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    if (!this.isValidClockTime(hours, minutes)) {
      return null;
    }

    return hours * 60 + minutes;
  }

  private isValidClockTime(hours: number, minutes: number) {
    return Number.isInteger(hours)
      && Number.isInteger(minutes)
      && hours >= 0
      && hours <= 23
      && minutes >= 0
      && minutes <= 59;
  }}
