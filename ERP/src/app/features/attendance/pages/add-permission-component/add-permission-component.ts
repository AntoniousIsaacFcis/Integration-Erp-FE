import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceEmployeeLookupComponent, IAttendanceEmployeeLookupItem } from '@features/attendance/components/employee-lookup-component/employee-lookup-component';
import { ILeaveTypeApiDto } from '@features/attendance/models/ivacation';
import { ICreateAttendancePermissionPayload } from '@features/attendance/models/ipermissions';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, of, startWith } from 'rxjs';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { AppValidators } from '@shared/validators/word-limit.validator';

type PermissionTypeValue = 'leave' | 'halfLeave' | 'lateArrival' | 'earlyLeave';

@Component({
  selector: 'app-add-permission-component',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FormContainerComponent,
    AttendanceEmployeeLookupComponent,
    AppInputComponent,
    AppSelectComponent,
    AppDateInputComponent,
    AppTextareaComponent,
    FormCancelButtonComponent,
    FormSaveButtonComponent,
  ],
  templateUrl: './add-permission-component.html',
  styleUrl: './add-permission-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPermissionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly notification = inject(NotificationService);
  private readonly today = new Date().toISOString().split('T')[0];

  submitted = signal(false);
  isSaving = signal(false);
  selectedEmployee = signal<IAttendanceEmployeeLookupItem | null>(null);

  mainForm = this.fb.nonNullable.group({
    employeeId: ['', [Validators.required]],
    type: ['', [Validators.required]],
    leaveTypeId: [''],
    durationMinutes: [''],
    fromDate: ['', [Validators.required]],
    toDate: ['', [Validators.required]],
    applayDate: [this.today, [Validators.required]],
    notes: ['', [AppValidators.wordLimit(100)]],
  }, {
    validators: [dateRangeValidator('fromDate', 'toDate')],
  });

  leaveTypesResource = rxResource<ILeaveTypeApiDto[], unknown>({
    stream: () => this.attendanceService.getLeaveTypes().pipe(catchError(() => of([] as ILeaveTypeApiDto[]))),
  });

  private readonly typeValue = toSignal(
    this.mainForm.controls.type.valueChanges.pipe(startWith(this.mainForm.controls.type.value)),
  );

  isLeave = computed(() => {
    const value = this.typeValue() as PermissionTypeValue | '';
    return value === 'leave' || value === 'halfLeave';
  });

  typeOptions = [
    { value: 'leave', label: 'Enum:AttendancePermissionType.Leave' },
    { value: 'halfLeave', label: 'Enum:AttendancePermissionType.HalfLeave' },
    { value: 'lateArrival', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: 'earlyLeave', label: 'Enum:AttendancePermissionType.EarlyLeave' },
  ];

  constructor() {
    effect(() => {
      const employee = this.selectedEmployee();
      this.mainForm.controls.employeeId.setValue(employee?.id ?? '');
    });

    effect(() => {
      if (this.isLeave()) {
        this.mainForm.controls.leaveTypeId.setValidators([Validators.required]);
        this.mainForm.controls.durationMinutes.clearValidators();
        this.mainForm.controls.durationMinutes.setValue('');
      } else {
        this.mainForm.controls.leaveTypeId.setValidators([]);
        this.mainForm.controls.leaveTypeId.setValue('');
        this.mainForm.controls.durationMinutes.setValidators([Validators.required, Validators.min(1)]);
      }

      this.mainForm.controls.leaveTypeId.updateValueAndValidity({ emitEvent: false });
      this.mainForm.controls.durationMinutes.updateValueAndValidity({ emitEvent: false });
    });
  }

  getControl(name: keyof typeof this.mainForm.controls): FormControl {
    return this.mainForm.controls[name] as FormControl;
  }

  onSave() {
    this.submitted.set(true);

    if (this.isSaving()) {
      return;
    }

    if (!this.selectedEmployee()) {
      this.notification.show({
        type: 'error',
        title: 'COMMON.MESSAGES.OPERATION_FAILED',
        message: 'ATTENDANCE.EMPLOYEE_NAME',
        isModal: false,
        actionLabel: 'COMMON.CONFIRM',
      });
      return;
    }

    if (this.mainForm.invalid) {
      this.mainForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.attendanceService.createAttendancePermission(this.toPayload()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notification.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          actionLabel: 'COMMON.OK',
        });
        this.router.navigate(['/attendance/view-permissions']);
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
    this.router.navigate(['/attendance/view-permissions']);
  }

  private toPayload(): ICreateAttendancePermissionPayload {
    const value = this.mainForm.getRawValue();
    const type = value.type as PermissionTypeValue;

    return {
      employeeId: value.employeeId,
      fromDate: `${value.fromDate}T00:00:00`,
      toDate: `${value.toDate}T00:00:00`,
      applicationDate: `${value.applayDate}T00:00:00`,
      type: this.toTypeNumber(type),
      leaveTypeId: this.isLeave() ? (value.leaveTypeId || null) : null,
      leaveCount: this.toLeaveCount(type),
      durationMinutes: this.isLeave() ? null : Number(value.durationMinutes || 0),
      note: value.notes?.trim() || null,
      status: 2,
      leaveApplicationId: null,
      attendanceFlagId: null,
      attendanceSheetId: null,
    };
  }

  private toTypeNumber(type: PermissionTypeValue) {
    const map: Record<PermissionTypeValue, number> = {
      leave: 1,
      halfLeave: 2,
      lateArrival: 3,
      earlyLeave: 4,
    };

    return map[type];
  }

  private toLeaveCount(type: PermissionTypeValue) {
    if (type === 'halfLeave') {
      return 0.5;
    }

    if (type === 'leave') {
      return 1;
    }

    return 0;
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
