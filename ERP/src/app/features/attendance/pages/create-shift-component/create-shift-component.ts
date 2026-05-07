import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { NotificationService } from '@core/services/notification-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { WorkDaysGridComponent } from "@features/attendance/components/work-days-grid-component/work-days-grid-component";
import { TimeInputComponent } from "@shared/components/atoms/time-input-component/time-input-component";
import { timeRangeValidator } from '@shared/validators/time-range.validator';
import { DayConfig, IShiftPayload } from '@features/attendance/models/iattendance';

@Component({
  selector: 'app-create-shift-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    AppInputComponent,
    FormContainerComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    AppSelectComponent,
    AppRadioComponent,
    WorkDaysGridComponent,
    TimeInputComponent,
  ],
  templateUrl: './create-shift-component.html',
  styleUrl: './create-shift-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateShiftComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private shiftService = inject(AttendanceService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  submitted = signal(false);
  isSaving = signal(false);

  shiftTypeOptions = [
    { label: 'SHIFT.TYPES.STANDARD', value: 1 },
    { label: 'SHIFT.TYPES.FLEXIBLE', value: 2 },
  ];

  shiftForm = this.fb.group({
    name: ['', Validators.required],
    type: [1, Validators.required],
    workDays: [[]], // Array of day objects
    workStart: ['', Validators.required],
    workEnd: ['', Validators.required],
    checkInStart: ['', Validators.required],
    checkInEnd: ['', Validators.required],
    checkOutStart: ['', Validators.required],
    checkOutEnd: ['', Validators.required],
    gracePeriod: [15, [Validators.required, Validators.min(0)]],
    lateStartRule: [2, Validators.required],
    status: ['active' as 'active' | 'inactive', Validators.required],
  }, {
    validators: [
      timeRangeValidator('workStart', 'workEnd'),
      timeRangeValidator('checkInStart', 'checkInEnd'),
      timeRangeValidator('checkOutStart', 'checkOutEnd')
    ] //to ensure workStart  not befor workEnd
  });

  isLoading = computed(() => this.isSaving());
  private readonly shiftTypeValue = toSignal(
    this.shiftForm.controls.type.valueChanges.pipe(startWith(this.shiftForm.controls.type.value)),
  );
  isFlexibleShift = computed(() => Number(this.shiftTypeValue()) === 2);

  constructor() {
    effect(() => {
      this.configureParentShiftValidators(this.isFlexibleShift());
    });
  }


  onSave() {
    if (this.isSaving()) {
      return;
    }

    this.submitted.set(true);
    this.shiftForm.updateValueAndValidity();

    const flexibleWorkDaysErrorKey = this.getFlexibleWorkDaysErrorKey();
    if (flexibleWorkDaysErrorKey) {
      this.shiftForm.markAllAsTouched();
      this.notification.show({
        type: 'error',
        title: 'COMMON.MESSAGES.OPERATION_FAILED',
        message: flexibleWorkDaysErrorKey,
        isModal: true,
        actionLabel: 'COMMON.CONFIRM',
      });
      return;
    }

    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    this.shiftService.createShift(this.toCreateShiftPayload(this.shiftForm.getRawValue()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notification.show({
            type: 'success',
            title: 'SHIFT.SUCCESS_TITLE',
            actionLabel: 'COMMON.OK'
          });
          this.router.navigate(['/attendance/view']);
        },
        error: (error) => {
          this.isSaving.set(false);
          const errorPresentation = this.resolveSaveError(error);

          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: errorPresentation.message,
            isModal: errorPresentation.isModal,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  onCancel() {
    this.router.navigate(['/attendance']);
  }

  private toCreateShiftPayload(value: ReturnType<typeof this.shiftForm.getRawValue>): IShiftPayload {
    const isFlexibleShift = Number(value.type) === 2;
    const days = Array.isArray(value.workDays) ? value.workDays : [];
    const flexibleDefaults = isFlexibleShift ? this.getFlexibleParentDefaults(days) : null;

    return {
      name: value.name?.trim() ?? '',
      type: Number(value.type),
      isActive: value.status === 'active',
      onDutyTime: this.toTimeSpan(isFlexibleShift ? flexibleDefaults?.onDutyTimeOverride : value.workStart),
      offDutyTime: this.toTimeSpan(isFlexibleShift ? flexibleDefaults?.offDutyTimeOverride : value.workEnd),
      signInStartTime: this.toTimeSpan(isFlexibleShift ? flexibleDefaults?.signInStartTimeOverride : value.checkInStart),
      signInEndTime: this.toTimeSpan(isFlexibleShift ? flexibleDefaults?.signInEndTimeOverride : value.checkInEnd),
      signOutStartTime: this.toTimeSpan(isFlexibleShift ? flexibleDefaults?.signOutStartTimeOverride : value.checkOutStart),
      signOutEndTime: this.toTimeSpan(isFlexibleShift ? flexibleDefaults?.signOutEndTimeOverride : value.checkOutEnd),
      lateToleranceMinutes: Number(value.gracePeriod ?? 0),
      lateStartRule: Number(value.lateStartRule ?? 2),
      days: this.toShiftDays(days),
    };
  }

  private toShiftDays(days: DayConfig[]) {
    const isFlexibleShift = this.isFlexibleShift();

    return days.map(day => ({
      dayOfWeek: this.toBackendDayOfWeek(day.day),
      isWorkDay: day.isWorkDay,
      calculateAttendanceOnOffDay: day.calculateOnHoliday,
      onDutyTimeOverride: this.toOptionalTimeSpan(isFlexibleShift ? day.onDutyTimeOverride : null),
      offDutyTimeOverride: this.toOptionalTimeSpan(isFlexibleShift ? day.offDutyTimeOverride : null),
      signInStartTimeOverride: this.toOptionalTimeSpan(isFlexibleShift ? day.signInStartTimeOverride : null),
      signInEndTimeOverride: this.toOptionalTimeSpan(isFlexibleShift ? day.signInEndTimeOverride : null),
      signOutStartTimeOverride: this.toOptionalTimeSpan(isFlexibleShift ? day.signOutStartTimeOverride : null),
      signOutEndTimeOverride: this.toOptionalTimeSpan(isFlexibleShift ? day.signOutEndTimeOverride : null),
      lateToleranceMinutes: isFlexibleShift ? day.lateToleranceMinutes : null,
    }));
  }

  private toBackendDayOfWeek(day: string) {
    const dayMap: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };

    return dayMap[day] ?? 0;
  }

  private toTimeSpan(value: string | null | undefined) {
    if (!value) {
      return '00:00:00';
    }

    return value.length === 5 ? `${value}:00` : value;
  }

  private toOptionalTimeSpan(value: string | null | undefined) {
    return value ? this.toTimeSpan(value) : null;
  }

  private getFlexibleParentDefaults(days: DayConfig[]) {
    return days.find(day =>
      day.onDutyTimeOverride &&
      day.offDutyTimeOverride &&
      day.signInStartTimeOverride &&
      day.signInEndTimeOverride &&
      day.signOutStartTimeOverride &&
      day.signOutEndTimeOverride);
  }

  private configureParentShiftValidators(isFlexibleShift: boolean) {
    const requiredControls = [
      this.shiftForm.controls.workStart,
      this.shiftForm.controls.workEnd,
      this.shiftForm.controls.checkInStart,
      this.shiftForm.controls.checkInEnd,
      this.shiftForm.controls.checkOutStart,
      this.shiftForm.controls.checkOutEnd,
    ];

    for (const control of requiredControls) {
      control.setValidators(isFlexibleShift ? null : Validators.required);
      control.updateValueAndValidity({ emitEvent: false });
    }

    this.shiftForm.controls.gracePeriod.setValidators(
      isFlexibleShift ? [Validators.min(0)] : [Validators.required, Validators.min(0)]
    );
    this.shiftForm.controls.gracePeriod.updateValueAndValidity({ emitEvent: false });

    this.shiftForm.controls.workDays.setValidators(
      isFlexibleShift ? [this.flexibleWorkDaysValidator()] : null
    );
    this.shiftForm.controls.workDays.updateValueAndValidity({ emitEvent: false });
    this.shiftForm.updateValueAndValidity({ emitEvent: false });
  }

  private flexibleWorkDaysValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.isFlexibleShift()) {
        return null;
      }

      const days = control.value as DayConfig[] | null | undefined;

      if (!Array.isArray(days) || !days.length) {
        return { flexibleWorkDaysRequired: true };
      }

      const selectedDays = days.filter(day => day?.isWorkDay);

      if (!selectedDays.length) {
        return { flexibleWorkDaysRequired: true };
      }

      const hasMissingRequiredTime = selectedDays.some(day =>
        this.isMissingRequiredValue(day?.onDutyTimeOverride) ||
        this.isMissingRequiredValue(day?.offDutyTimeOverride) ||
        this.isMissingRequiredValue(day?.signInStartTimeOverride) ||
        this.isMissingRequiredValue(day?.signInEndTimeOverride) ||
        this.isMissingRequiredValue(day?.signOutStartTimeOverride) ||
        this.isMissingRequiredValue(day?.signOutEndTimeOverride) ||
        this.isMissingRequiredValue(day?.lateToleranceMinutes)
      );

      return hasMissingRequiredTime ? { flexibleWorkDaysIncomplete: true } : null;
    };
  }

  private getFlexibleWorkDaysErrorKey() {
    if (!this.isFlexibleShift()) {
      return null;
    }

    const workDaysErrors = this.shiftForm.controls.workDays.errors;
    if (workDaysErrors?.['flexibleWorkDaysRequired']) {
      return 'ERRORS.FLEXIBLE_SHIFT_REQUIRES_AT_LEAST_ONE_DAY';
    }

    if (workDaysErrors?.['flexibleWorkDaysIncomplete']) {
      return 'ERRORS.FLEXIBLE_SHIFT_REQUIRES_COMPLETE_DAY_TIMES';
    }

    return null;
  }

  private isMissingRequiredValue(value: string | number | null | undefined) {
    return value === null || value === undefined || value === '';
  }

  private resolveSaveError(error: unknown) {
    const backendError = error as { message?: string; code?: string };

    if (
      backendError?.code === 'Attendance:FlexibleShiftRequiresCompleteDayTimes' ||
      backendError?.code === 'Attendance:InvalidShiftAttendanceDetails' ||
      backendError?.code === 'Attendance:OnDutyTimeMustBeLessThanOffDutyTime' ||
      backendError?.code === 'Attendance:SignInStartTimeMustBeLessThanSignInEndTime' ||
      backendError?.code === 'Attendance:SignOutStartTimeMustBeLessThanSignOutEndTime' ||
      backendError?.code === 'Attendance:SignInStartTimeMustBeLessThanOrEqualOnDutyTime' ||
      backendError?.code === 'Attendance:SignInEndTimeMustBeGreaterThanOrEqualOnDutyTime' ||
      backendError?.code === 'Attendance:SignOutStartTimeMustBeLessThanOrEqualOffDutyTime' ||
      backendError?.code === 'Attendance:SignOutStartTimeMustBeGreaterThanOrEqualOnDutyTime' ||
      backendError?.code === 'Attendance:OffDutyTimeMustBeLessThanOrEqualSignOutEndTime' ||
      backendError?.code === 'Attendance:OnDutyOverrideMustBeLessThanOffDutyOverride' ||
      backendError?.code === 'Attendance:LateToleranceMinutesMustBeNonNegative' ||
      backendError?.message === 'ERRORS.FLEXIBLE_SHIFT_REQUIRES_COMPLETE_DAY_TIMES'
    ) {
      const codeToErrorKey: Record<string, string> = {
        'Attendance:OnDutyTimeMustBeLessThanOffDutyTime': 'ERRORS.ON_DUTY_TIME_MUST_BE_LESS_THAN_OFF_DUTY_TIME',
        'Attendance:SignInStartTimeMustBeLessThanSignInEndTime': 'ERRORS.SIGN_IN_START_TIME_MUST_BE_LESS_THAN_SIGN_IN_END_TIME',
        'Attendance:SignOutStartTimeMustBeLessThanSignOutEndTime': 'ERRORS.SIGN_OUT_START_TIME_MUST_BE_LESS_THAN_SIGN_OUT_END_TIME',
        'Attendance:SignInStartTimeMustBeLessThanOrEqualOnDutyTime': 'ERRORS.SIGN_IN_START_TIME_MUST_BE_LESS_THAN_OR_EQUAL_ON_DUTY_TIME',
        'Attendance:SignInEndTimeMustBeGreaterThanOrEqualOnDutyTime': 'ERRORS.SIGN_IN_END_TIME_MUST_BE_GREATER_THAN_OR_EQUAL_ON_DUTY_TIME',
        'Attendance:SignOutStartTimeMustBeLessThanOrEqualOffDutyTime': 'ERRORS.SIGN_OUT_START_TIME_MUST_BE_LESS_THAN_OR_EQUAL_OFF_DUTY_TIME',
        'Attendance:SignOutStartTimeMustBeGreaterThanOrEqualOnDutyTime': 'ERRORS.SIGN_OUT_START_TIME_MUST_BE_GREATER_THAN_OR_EQUAL_ON_DUTY_TIME',
        'Attendance:OffDutyTimeMustBeLessThanOrEqualSignOutEndTime': 'ERRORS.OFF_DUTY_TIME_MUST_BE_LESS_THAN_OR_EQUAL_SIGN_OUT_END_TIME',
        'Attendance:OnDutyOverrideMustBeLessThanOffDutyOverride': 'ERRORS.ON_DUTY_OVERRIDE_MUST_BE_LESS_THAN_OFF_DUTY_OVERRIDE',
        'Attendance:LateToleranceMinutesMustBeNonNegative': 'ERRORS.LATE_TOLERANCE_MUST_BE_NON_NEGATIVE',
        'Attendance:InvalidShiftAttendanceDetails': 'ERRORS.INVALID_SHIFT_ATTENDANCE_DETAILS',
      };

      if (backendError?.code && codeToErrorKey[backendError.code]) {
        return {
          message: codeToErrorKey[backendError.code],
          isModal: true,
        };
      }

      return {
        message: 'ERRORS.FLEXIBLE_SHIFT_REQUIRES_COMPLETE_DAY_TIMES',
        isModal: true,
      };
    }

    return {
      message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
      isModal: false,
    };
  }
}
