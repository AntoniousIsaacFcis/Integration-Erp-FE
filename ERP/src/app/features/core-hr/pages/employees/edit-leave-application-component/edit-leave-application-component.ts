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
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { forkJoin, Observable, of, startWith, switchMap } from 'rxjs';

type LeaveApplicationType = 1 | 2;
type LeaveApplicationStatus = 1 | 2 | 3 | 4;

const LeaveApplicationTypes = {
  Leave: 1,
  HalfLeave: 2,
} as const;

function leaveApplicationDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const type = Number(control.get('type')?.value) as LeaveApplicationType;
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

    if (type === LeaveApplicationTypes.Leave && dateFrom && dateTo && dateTo < dateFrom) {
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
    status: ['1', [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  }, { validators: [leaveApplicationDateValidator()] });

  private readonly descriptionValue = toSignal(
    this.leaveApplicationForm.controls.description.valueChanges,
    { initialValue: '' },
  );

  private readonly applicationTypeValue = toSignal(
    this.leaveApplicationForm.controls.type.valueChanges.pipe(startWith(this.leaveApplicationForm.controls.type.value)),
    { initialValue: this.leaveApplicationForm.controls.type.value },
  );

  readonly selectedApplicationType = computed(
    () => Number(this.applicationTypeValue()) as LeaveApplicationType,
  );
  readonly isHalfDayApplication = computed(
    () => this.selectedApplicationType() === LeaveApplicationTypes.HalfLeave,
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
        this.configureTypeFields();
        this.updateCalculatedDays();
      });

    this.leaveApplicationForm.controls.dateFrom.valueChanges
      .pipe(startWith(this.leaveApplicationForm.controls.dateFrom.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncHalfLeaveDateRange();
        this.leaveApplicationForm.updateValueAndValidity({ emitEvent: false });
        this.updateCalculatedDays();
      });

    this.leaveApplicationForm.controls.dateTo.valueChanges
      .pipe(startWith(this.leaveApplicationForm.controls.dateTo.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.leaveApplicationForm.updateValueAndValidity({ emitEvent: false });
        this.updateCalculatedDays();
      });

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

          const isHalfLeave = Number(leaveApplication.type || LeaveApplicationTypes.Leave) === LeaveApplicationTypes.HalfLeave;
          const primaryDate = this.toDateInputValue(leaveApplication.date ?? leaveApplication.dateFrom);

          this.originalStatus.set(String(leaveApplication.status || 1));
          this.attachments = leaveApplication.attachments ?? null;
          this.leaveApplicationForm.patchValue({
            leaveTypeId: leaveApplication.leaveTypeId ?? '',
            type: String(leaveApplication.type || LeaveApplicationTypes.Leave),
            dateFrom: primaryDate,
            dateTo: isHalfLeave ? primaryDate : this.toDateInputValue(leaveApplication.dateTo),
            days: String(leaveApplication.daysCount || 1),
            status: this.originalStatus(),
            description: leaveApplication.description ?? '',
          });
          this.configureTypeFields();
          this.updateCalculatedDays();
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
    this.leaveApplicationForm.updateValueAndValidity();

    if (this.leaveApplicationForm.invalid) {
      this.leaveApplicationForm.markAllAsTouched();
      return;
    }

    const formValue = this.leaveApplicationForm.getRawValue();
    const applicationType = Number(formValue.type) as LeaveApplicationType;

    this.isSubmitting.set(true);

    this.attendanceService.updateLeaveApplication(this.leaveId, {
      staffId: this.empId,
      leaveTypeId: formValue.leaveTypeId || null,
      date: applicationType === LeaveApplicationTypes.HalfLeave ? formValue.dateFrom : null,
      dateFrom: applicationType === LeaveApplicationTypes.Leave ? formValue.dateFrom : null,
      dateTo: applicationType === LeaveApplicationTypes.Leave ? formValue.dateTo : null,
      applicationDate: null,
      type: applicationType,
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
    const controls = this.leaveApplicationForm.controls;

    if (this.isHalfDayApplication()) {
      controls.dateTo.clearValidators();
      this.syncHalfLeaveDateRange();
    } else {
      controls.dateTo.setValidators([Validators.required]);
    }

    controls.dateTo.updateValueAndValidity({ emitEvent: false });
    this.updateCalculatedDays();
  }

  private normalizeStringFields() {
    const descriptionControl = this.leaveApplicationForm.controls.description;
    const trimmedDescription = descriptionControl.value.trim();

    if (descriptionControl.value !== trimmedDescription) {
      descriptionControl.setValue(trimmedDescription);
    }
  }

  private syncHalfLeaveDateRange() {
    const controls = this.leaveApplicationForm.controls;

    if (!this.isHalfDayApplication()) {
      return;
    }

    if (controls.dateFrom.value && controls.dateTo.value !== controls.dateFrom.value) {
      controls.dateTo.setValue(controls.dateFrom.value, { emitEvent: false });
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
    const calculatedDays = this.calculateDays(controls.dateFrom.value, controls.dateTo.value);

    controls.days.disable({ emitEvent: false });

    if (calculatedDays === null) {
      return;
    }

    const nextValue = String(calculatedDays);

    if (controls.days.value !== nextValue) {
      controls.days.setValue(nextValue, { emitEvent: false });
    }
  }

  private calculateDays(dateFrom: string, dateTo: string) {
    if (this.isHalfDayApplication()) {
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

  private navigateBack() {
    this.router.navigate(['/core-hr/employees/details', this.empId], {
      queryParams: { tab: 'vacations' },
    });
  }

  private toDateInputValue(value?: string | null) {
    return value?.slice(0, 10) ?? '';
  }
}
