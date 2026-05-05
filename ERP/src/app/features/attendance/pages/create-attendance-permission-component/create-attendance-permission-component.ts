import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceEmployeeLookupComponent, IAttendanceEmployeeLookupItem } from '@features/attendance/components/employee-lookup-component/employee-lookup-component';
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
import { AppValidators } from '@shared/validators/word-limit.validator';

type PermissionTypeValue = 'lateArrival' | 'earlyLeave';

@Component({
  selector: 'app-create-attendance-permission-component',
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
  templateUrl: './create-attendance-permission-component.html',
  styleUrl: './create-attendance-permission-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAttendancePermissionComponent {
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
    type: ['lateArrival' as PermissionTypeValue, [Validators.required]],
    date: [this.today, [Validators.required]],
    durationMinutes: [1, [Validators.required, Validators.min(1)]],
    note: ['', [AppValidators.wordLimit(100)]],
  });

  private readonly typeValue = toSignal(
    this.mainForm.controls.type.valueChanges.pipe(startWith(this.mainForm.controls.type.value)),
  );

  typeOptions = [
    { value: 'lateArrival', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: 'earlyLeave', label: 'Enum:AttendancePermissionType.EarlyLeave' },
  ];

  constructor() {
    effect(() => {
      const employee = this.selectedEmployee();
      this.mainForm.controls.employeeId.setValue(employee?.id ?? '', { emitEvent: false });
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
      date: `${value.date}T00:00:00`,
      durationMinutes: Number(value.durationMinutes || 0),
      note: value.note?.trim() || null,
      type: this.toTypeNumber(type),
      applicationDate: `${value.date}T00:00:00`,
      status: 2,
    };
  }

  private toTypeNumber(type: PermissionTypeValue) {
    const map: Record<PermissionTypeValue, 1 | 2> = {
      lateArrival: 1,
      earlyLeave: 2,
    };

    return map[type];
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
