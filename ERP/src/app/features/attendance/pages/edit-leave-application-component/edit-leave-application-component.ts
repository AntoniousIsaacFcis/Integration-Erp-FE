import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, forkJoin, of, startWith } from 'rxjs';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { ILeaveApplicationApiDto, ILeaveTypeApiDto } from '@features/attendance/models/ivacation';

@Component({
  selector: 'app-edit-leave-application-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FormContainerComponent,
    AppInputComponent,
    AppSelectComponent,
    AppDateInputComponent,
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
  private readonly staffService = inject(StaffService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly leaveId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly submitted = signal(false);
  readonly isSaving = signal(false);
  readonly isLoading = signal(true);
  readonly isHalfLeave = signal(false);
  readonly leaveTypes = signal<ILeaveTypeApiDto[]>([]);

  private readonly applicationDate = signal<string | null>(null);
  private attachments: string | null = null;
  private readonly status = signal(1);

  readonly leaveForm = this.fb.nonNullable.group({
    employeeId: [{ value: '', disabled: true }],
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

  private readonly fromDateValue = toSignal(
    this.leaveForm.controls.fromDate.valueChanges.pipe(startWith(this.leaveForm.controls.fromDate.value)),
  );

  private readonly toDateValue = toSignal(
    this.leaveForm.controls.toDate.valueChanges.pipe(startWith(this.leaveForm.controls.toDate.value)),
  );

  private readonly typeValue = toSignal(
    this.leaveForm.controls.type.valueChanges.pipe(startWith(this.leaveForm.controls.type.value)),
  );

  constructor() {
    if (!this.leaveId) {
      this.onCancel();
      return;
    }

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

    this.loadLeaveApplication();
  }

  getControl(name: keyof typeof this.leaveForm.controls): FormControl {
    return this.leaveForm.controls[name] as FormControl;
  }

  onSave() {
    this.submitted.set(true);

    if (this.isSaving()) {
      return;
    }

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const value = this.leaveForm.getRawValue();
    const isHalfLeave = value.type === '2';

    this.attendanceService.updateLeaveApplication(this.leaveId, {
      staffId: value.employeeId,
      leaveTypeId: value.leaveTypeId || null,
      date: isHalfLeave ? value.fromDate : null,
      dateFrom: isHalfLeave ? null : value.fromDate,
      dateTo: isHalfLeave ? null : value.toDate,
      applicationDate: this.applicationDate(),
      type: Number(value.type),
      description: value.description?.trim() || null,
      attachments: this.attachments,
      status: this.status(),
    }).subscribe({
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

  private loadLeaveApplication() {
    forkJoin({
      leaveTypes: this.attendanceService.getLeaveTypes().pipe(
        catchError(() => of([] as ILeaveTypeApiDto[])),
      ),
      leaveApplication: this.attendanceService.getLeaveApplicationById(this.leaveId),
      staff: this.staffService.getStaff({
        skipCount: 0,
        maxResultCount: 1000,
        filter: '',
      }).pipe(
        catchError(() => of({ totalCount: 0, items: [] as IStaffApiItem[] })),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ leaveTypes, leaveApplication, staff }) => {
          this.leaveTypes.set(leaveTypes);
          this.patchForm(leaveApplication, staff.items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.onCancel();
        },
      });
  }

  private patchForm(leaveApplication: ILeaveApplicationApiDto, staffItems: IStaffApiItem[]) {
    const employee = staffItems.find(item => item.id === leaveApplication.staffId);
    const employeeName = employee ? this.getStaffDisplayName(employee) : leaveApplication.staffId;
    const isHalfLeave = Number(leaveApplication.type ?? 1) === 2;
    const primaryDate = this.toDateInputValue(leaveApplication.date ?? leaveApplication.dateFrom);

    this.leaveForm.patchValue({
      employeeId: leaveApplication.staffId,
      employeeName,
      type: String(leaveApplication.type ?? 1),
      leaveTypeId: leaveApplication.leaveTypeId ?? '',
      fromDate: primaryDate,
      toDate: isHalfLeave ? primaryDate : this.toDateInputValue(leaveApplication.dateTo),
      days: Number(leaveApplication.daysCount ?? 1),
      description: leaveApplication.description ?? '',
    });

    this.applicationDate.set(leaveApplication.applicationDate ?? leaveApplication.creationDate ?? null);
    this.attachments = leaveApplication.attachments ?? null;
    this.status.set(leaveApplication.status ?? 1);
    this.configureTypeFields();
    this.breadcrumbService.setCurrentBreadcrumbLabel(employeeName, this.route);
  }

  private configureTypeFields() {
    const controls = this.leaveForm.controls;

    if (this.isHalfLeave()) {
      controls.toDate.clearValidators();
      this.syncHalfLeaveDateRange();
    } else {
      controls.toDate.setValidators([Validators.required]);
    }

    controls.toDate.updateValueAndValidity({ emitEvent: false });
    this.updateCalculatedDays();
  }

  private syncHalfLeaveDateRange() {
    const controls = this.leaveForm.controls;

    if (!this.isHalfLeave()) {
      return;
    }

    if (controls.fromDate.value && controls.toDate.value !== controls.fromDate.value) {
      controls.toDate.setValue(controls.fromDate.value, { emitEvent: false });
    }
  }

  private updateCalculatedDays() {
    const controls = this.leaveForm.controls;
    const calculatedDays = this.calculateDays(controls.fromDate.value, controls.toDate.value, controls.type.value);

    controls.days.disable({ emitEvent: false });

    if (calculatedDays === null) {
      return;
    }

    if (controls.days.value !== calculatedDays) {
      controls.days.setValue(calculatedDays, { emitEvent: false });
    }
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

  private toDateInputValue(value?: string | null) {
    return value?.slice(0, 10) ?? '';
  }

  private getStaffDisplayName(staff: IStaffApiItem) {
    const composedName = [staff.firstName, staff.middleName, staff.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ')
      .trim();

    return staff.fullNameAr?.trim()
      || staff.fullName?.trim()
      || staff.fullNameEn?.trim()
      || composedName
      || staff.staffCode?.trim()
      || staff.id;
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
