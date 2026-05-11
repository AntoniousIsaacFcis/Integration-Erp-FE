import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceEmployeeLookupComponent, IAttendanceEmployeeLookupItem } from '@features/attendance/components/employee-lookup-component/employee-lookup-component';
import { ILeaveApplicationUpdatePayload, ILeaveTypeApiDto } from '@features/attendance/models/ivacation';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { isEmployeeScopedUser } from '@features/attendance/utils/attendance-permission-auth';
import { ICurrentStaffSummaryApiDto } from '@features/core-hr/models/istaff';
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

@Component({
  selector: 'app-create-leave-application-component',
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
  templateUrl: './create-leave-application-component.html',
  styleUrl: './create-leave-application-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLeaveApplicationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly notification = inject(NotificationService);
  private readonly today = new Date().toISOString().split('T')[0];

  submitted = signal(false);
  isSaving = signal(false);
  selectedEmployee = signal<IAttendanceEmployeeLookupItem | null>(null);
  private readonly didLoadCurrentEmployee = signal(false);
  readonly isEmployeeScoped = computed(() => isEmployeeScopedUser(this.authService));
  readonly leaveTypeOptions = [
    { value: '1', label: 'EMPLOYEES.VACATIONS.TYPE_FULL_DAY' },
    { value: '2', label: 'EMPLOYEES.VACATIONS.TYPE_HALF_DAY' },
  ];

  readonly leaveForm = this.fb.nonNullable.group({
    employeeId: ['', [Validators.required]],
    employeeName: [{ value: '', disabled: true }],
    type: ['1', [Validators.required]],
    leaveTypeId: ['', [Validators.required]],
    fromDate: ['', [Validators.required]],
    toDate: ['', [Validators.required]],
    days: [1, [Validators.required, Validators.min(0.5)]],
    description: ['', [AppValidators.wordLimit(100)]],
  }, {
    validators: [dateRangeValidator('fromDate', 'toDate')],
  });

  readonly leaveTypesResource = rxResource<ILeaveTypeApiDto[], unknown>({
    stream: () => this.attendanceService.getLeaveTypes().pipe(catchError(() => of([] as ILeaveTypeApiDto[]))),
  });

  private readonly fromDateValue = toSignal(
    this.leaveForm.controls.fromDate.valueChanges.pipe(startWith(this.leaveForm.controls.fromDate.value)),
  );

  private readonly toDateValue = toSignal(
    this.leaveForm.controls.toDate.valueChanges.pipe(startWith(this.leaveForm.controls.toDate.value)),
  );

  private readonly typeValue = toSignal(
    this.leaveForm.controls.type.valueChanges.pipe(startWith(this.leaveForm.controls.type.value)),
  );

  readonly isHalfLeave = signal(false);

  constructor() {
    effect(() => {
      const employee = this.selectedEmployee();
      this.leaveForm.controls.employeeId.setValue(employee?.id ?? '', { emitEvent: false });
      this.leaveForm.controls.employeeName.setValue(employee?.displayName ?? '', { emitEvent: false });
    });

    effect(() => {
      if (!this.isEmployeeScoped() || this.didLoadCurrentEmployee()) {
        return;
      }

      this.didLoadCurrentEmployee.set(true);
      this.attendanceService.getCurrentLeaveApplicationStaff().subscribe({
        next: employee => this.selectedEmployee.set(this.toEmployeeLookupItem(employee)),
        error: (error: unknown) => {
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: this.getErrorMessage(error),
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
    });

    effect(() => {
      const isHalfLeave = this.typeValue() === '2';
      this.isHalfLeave.set(isHalfLeave);

      if (isHalfLeave) {
        this.leaveForm.controls.toDate.clearValidators();
        const singleDate = this.fromDateValue() ?? '';
        if (this.leaveForm.controls.toDate.value !== singleDate) {
          this.leaveForm.controls.toDate.setValue(singleDate, { emitEvent: false });
        }
      } else {
        this.leaveForm.controls.toDate.setValidators([Validators.required]);
      }

      this.leaveForm.controls.toDate.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const calculatedDays = this.calculateDays(this.fromDateValue(), this.toDateValue(), this.typeValue());
      if (calculatedDays > 0) {
        this.leaveForm.controls.days.setValue(calculatedDays, { emitEvent: false });
      }
      this.leaveForm.controls.days.disable({ emitEvent: false });
    });
  }

  getControl(name: keyof typeof this.leaveForm.controls): FormControl {
    return this.leaveForm.controls[name] as FormControl;
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

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.attendanceService.createLeaveApplication(this.toPayload()).subscribe({
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

  private toPayload(): ILeaveApplicationUpdatePayload {
    const value = this.leaveForm.getRawValue();
    const isHalfLeave = value.type === '2';

    return {
      staffId: value.employeeId,
      leaveTypeId: value.leaveTypeId || null,
      date: isHalfLeave ? value.fromDate : null,
      dateFrom: isHalfLeave ? null : value.fromDate,
      dateTo: isHalfLeave ? null : value.toDate,
      applicationDate: this.today,
      type: Number(value.type),
      description: value.description?.trim() || null,
      attachments: null,
      status: 1,
    };
  }

  private calculateDays(fromDate?: string, toDate?: string, type?: string) {
    if (type === '2') {
      return 0.5;
    }

    if (!fromDate || !toDate) {
      return 1;
    }

    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 1;
    }

    return Math.max(Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1, 1);
  }

  private getErrorMessage(error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error
      ? (error as { message?: unknown }).message
      : null;

    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'COMMON.MESSAGES.PLEASE_TRY_AGAIN';
  }

  private toEmployeeLookupItem(employee: ICurrentStaffSummaryApiDto): IAttendanceEmployeeLookupItem {
    return {
      id: employee.id,
      displayName: employee.displayName,
      staffCode: employee.staffCode?.trim() ?? '',
      email: '',
      departmentId: '',
      designationId: '',
      attendanceShiftId: '',
      nationalityCode: '',
      nationalId: '',
      phone: '',
      mobileNumber: '',
    };
  }
}

