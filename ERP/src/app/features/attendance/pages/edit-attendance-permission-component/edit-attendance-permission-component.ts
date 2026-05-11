import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendancePermissionApiDto } from '@features/attendance/models/ipermissions';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, forkJoin, of } from 'rxjs';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { ATTENDANCE_PERMISSION_PERMISSIONS, isRequestManager } from '@features/attendance/utils/attendance-permission-auth';

type AttendancePermissionTypeValue = '1' | '2';

@Component({
  selector: 'app-edit-attendance-permission-component',
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
  templateUrl: './edit-attendance-permission-component.html',
  styleUrl: './edit-attendance-permission-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAttendancePermissionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly staffService = inject(StaffService);
  private readonly notification = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly permissionId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly submitted = signal(false);
  readonly applicationDate = signal<string>('');
  readonly originalStatus = signal('1');

  readonly permissionForm = this.fb.nonNullable.group({
    employeeId: [{ value: '', disabled: true }],
    employeeName: [{ value: '', disabled: true }],
    type: ['1' as AttendancePermissionTypeValue, [Validators.required]],
    date: ['', [Validators.required]],
    durationMinutes: [1, [Validators.required, Validators.min(1)]],
    note: ['', [AppValidators.wordLimit(100)]],
    status: ['1', [Validators.required]],
  });

  readonly typeOptions = [
    { value: '1', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: '2', label: 'Enum:AttendancePermissionType.EarlyLeave' },
  ];

  readonly canManageStatus = computed(() =>
    isRequestManager(this.authService) &&
    (
      this.authService.hasPermission(ATTENDANCE_PERMISSION_PERMISSIONS.approve) ||
      this.authService.hasPermission(ATTENDANCE_PERMISSION_PERMISSIONS.reject)
    ));

  readonly statusOptions = computed(() => {
    const options: Array<{ value: string; label: string }> = [];
    const currentStatus = this.originalStatus();

    if (currentStatus === '1') {
      options.push({ value: '1', label: 'Enum:AttendancePermissionStatus.Pending' });
    }

    if (this.authService.hasPermission(ATTENDANCE_PERMISSION_PERMISSIONS.approve)) {
      options.push({ value: '2', label: 'Enum:AttendancePermissionStatus.Approved' });
    }

    if (this.authService.hasPermission(ATTENDANCE_PERMISSION_PERMISSIONS.reject)) {
      options.push({ value: '3', label: 'Enum:AttendancePermissionStatus.Rejected' });
    }

    return options.some(option => option.value === currentStatus)
      ? options
      : [{ value: currentStatus, label: this.statusLabelKey(currentStatus) }, ...options];
  });

  constructor() {
    if (!this.permissionId) {
      this.onCancel();
      return;
    }

    this.loadPermission();
  }

  getControl(name: keyof typeof this.permissionForm.controls): FormControl {
    return this.permissionForm.controls[name] as FormControl;
  }

  onSave() {
    this.submitted.set(true);

    if (this.isSaving()) {
      return;
    }

    if (this.permissionForm.invalid) {
      this.permissionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const value = this.permissionForm.getRawValue();

    this.attendanceService.updateAttendancePermission(this.permissionId, {
      employeeId: value.employeeId,
      date: value.date,
      durationMinutes: Number(value.durationMinutes || 0),
      note: value.note?.trim() || null,
      type: Number(value.type) as 1 | 2,
      applicationDate: this.applicationDate() || value.date,
      status: this.canManageStatus() ? Number(value.status) : Number(this.originalStatus()),
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

  private loadPermission() {
    forkJoin({
      permission: this.attendanceService.getAttendancePermissionById(this.permissionId),
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
        next: ({ permission, staff }) => {
          this.patchForm(permission, staff.items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.onCancel();
        },
      });
  }

  private patchForm(permission: IAttendancePermissionApiDto, staffItems: IStaffApiItem[]) {
    const employee = staffItems.find(item => item.id === permission.employeeId);
    const employeeName = employee ? this.getStaffDisplayName(employee) : permission.employeeId;

    this.permissionForm.patchValue({
      employeeId: permission.employeeId,
      employeeName,
      type: String(permission.type ?? 1) as AttendancePermissionTypeValue,
      date: this.toDateInputValue(permission.date),
      durationMinutes: Number(permission.durationMinutes ?? 1),
      note: permission.note ?? '',
      status: String(permission.status ?? 1),
    });

    this.originalStatus.set(String(permission.status ?? 1));
    this.applicationDate.set(this.toDateInputValue(permission.applicationDate ?? permission.creationTime ?? null));
    this.breadcrumbService.setCurrentBreadcrumbLabel(employeeName, this.route);
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

  private statusLabelKey(status: string) {
    const labels: Record<string, string> = {
      '1': 'Enum:AttendancePermissionStatus.Pending',
      '2': 'Enum:AttendancePermissionStatus.Approved',
      '3': 'Enum:AttendancePermissionStatus.Rejected',
    };

    return labels[status] ?? 'Enum:AttendancePermissionStatus.Pending';
  }
}
