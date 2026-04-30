import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { WorkDaysGridComponent } from '@features/attendance/components/work-days-grid-component/work-days-grid-component';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { DayConfig, IShift, IShiftDay, IShiftPayload } from '@features/attendance/models/iattendance';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { timeRangeValidator } from '@shared/validators/time-range.validator';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-edit-shift-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    AppInputComponent,
    FormContainerComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    AppSelectComponent,
    WorkDaysGridComponent,
    TimeInputComponent,
  ],
  templateUrl: './edit-shift-component.html',
  styleUrl: './edit-shift-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditShiftComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly shiftService = inject(AttendanceService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly shiftId = this.route.snapshot.paramMap.get('id') ?? '';

  submitted = signal(false);
  isLoading = signal(true);
  isSubmitting = signal(false);
  initialDays = signal<IShiftDay[] | null>(null);

  shiftTypeOptions = [
    { label: 'SHIFT.TYPES.STANDARD', value: 1 },
    { label: 'SHIFT.TYPES.FLEXIBLE', value: 2 },
  ];

  shiftForm = this.fb.group({
    name: ['', Validators.required],
    type: [1, Validators.required],
    workDays: [[] as DayConfig[]],
    workStart: ['', Validators.required],
    workEnd: ['', Validators.required],
    checkInStart: ['', Validators.required],
    checkInEnd: ['', Validators.required],
    checkOutStart: ['', Validators.required],
    checkOutEnd: ['', Validators.required],
    gracePeriod: [15, [Validators.required, Validators.min(0)]],
    lateStartRule: [2, Validators.required],
    isActive: [true],
  }, {
    validators: [
      timeRangeValidator('workStart', 'workEnd'),
      timeRangeValidator('checkInStart', 'checkInEnd'),
      timeRangeValidator('checkOutStart', 'checkOutEnd'),
    ],
  });

  private readonly shiftTypeValue = toSignal(
    this.shiftForm.controls.type.valueChanges.pipe(startWith(this.shiftForm.controls.type.value)),
  );
  isFlexibleShift = computed(() => Number(this.shiftTypeValue()) === 2);

  constructor() {
    effect(() => {
      this.configureParentShiftValidators(this.isFlexibleShift());
    });

    this.loadShift();
  }

  onSave() {
    if (this.isLoading() || this.isSubmitting()) {
      return;
    }

    this.submitted.set(true);
    this.shiftForm.updateValueAndValidity();

    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.shiftService.updateShift(this.shiftId, this.toShiftPayload(this.shiftForm.getRawValue()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.show({
            type: 'success',
            title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
            actionLabel: 'COMMON.OK',
          });
          this.router.navigate(['/attendance/view']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  onCancel() {
    this.router.navigate(['/attendance/view']);
  }

  private loadShift() {
    if (!this.shiftId) {
      this.router.navigate(['/attendance/view']);
      return;
    }

    this.shiftService.getShiftById(this.shiftId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: shift => {
          this.patchForm(shift);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
          this.router.navigate(['/attendance/view']);
        },
      });
  }

  private patchForm(shift: IShift) {
    this.shiftForm.patchValue({
      name: shift.name ?? '',
      type: Number(shift.type),
      workStart: this.toTimeInputValue(shift.onDutyTime),
      workEnd: this.toTimeInputValue(shift.offDutyTime),
      checkInStart: this.toTimeInputValue(shift.signInStartTime),
      checkInEnd: this.toTimeInputValue(shift.signInEndTime),
      checkOutStart: this.toTimeInputValue(shift.signOutStartTime),
      checkOutEnd: this.toTimeInputValue(shift.signOutEndTime),
      gracePeriod: shift.lateToleranceMinutes ?? 0,
      lateStartRule: shift.lateStartRule ?? 2,
      isActive: shift.isActive,
    });

    this.initialDays.set(shift.days ?? []);
  }

  private toShiftPayload(value: ReturnType<typeof this.shiftForm.getRawValue>): IShiftPayload {
    const isFlexibleShift = Number(value.type) === 2;
    const days = Array.isArray(value.workDays) ? value.workDays : [];
    const flexibleDefaults = isFlexibleShift ? this.getFlexibleParentDefaults(days) : null;

    return {
      name: value.name?.trim() ?? '',
      type: Number(value.type),
      isActive: Boolean(value.isActive),
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

  private toTimeInputValue(value?: string | null) {
    return value ? value.slice(0, 5) : '';
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
    this.shiftForm.updateValueAndValidity({ emitEvent: false });
  }
}
