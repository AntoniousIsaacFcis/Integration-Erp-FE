import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
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
import {
  ATTENDANCE_PERMISSION_PERMISSIONS,
  canApproveWorkflowRequest,
  canDeleteWorkflowRequest,
  canEditWorkflowRequest,
  canRejectWorkflowRequest,
} from '@features/attendance/utils/attendance-permission-auth';

@Component({
  selector: 'app-attendance-permission-details-component',
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
  templateUrl: './attendance-permission-details-component.html',
  styleUrl: './attendance-permission-details-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendancePermissionDetailsComponent {
  private readonly datePipe = inject(DatePipe);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly staffService = inject(StaffService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly permissionId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly isLoading = signal(true);
  readonly isActionLoading = signal(false);
  readonly permission = signal<IAttendancePermissionApiDto | null>(null);

  readonly permissionForm = this.fb.nonNullable.group({
    employeeName: [{ value: '', disabled: true }],
    type: [{ value: '1', disabled: true }],
    date: [{ value: '', disabled: true }],
    durationMinutes: [{ value: 1, disabled: true }],
    note: [{ value: '', disabled: true }],
    status: [{ value: '1', disabled: true }],
    applicationDate: [{ value: '', disabled: true }],
    attachments: [{ value: '-', disabled: true }],
  });

  readonly typeOptions = [
    { value: '1', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: '2', label: 'Enum:AttendancePermissionType.EarlyLeave' },
  ];

  readonly statusOptions = [
    { value: '1', label: 'Enum:AttendancePermissionStatus.Pending' },
    { value: '2', label: 'Enum:AttendancePermissionStatus.Approved' },
    { value: '3', label: 'Enum:AttendancePermissionStatus.Rejected' },
  ];

  readonly canEdit = computed(() => {
    const permission = this.permission();
    return permission
      ? canEditWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.update, permission.status)
      : false;
  });

  readonly canDelete = computed(() => {
    const permission = this.permission();
    return permission
      ? canDeleteWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.delete, permission.status)
      : false;
  });

  readonly canApprove = computed(() => {
    const permission = this.permission();
    return permission
      ? canApproveWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.approve, permission.status)
      : false;
  });

  readonly canReject = computed(() => {
    const permission = this.permission();
    return permission
      ? canRejectWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.reject, permission.status)
      : false;
  });

  constructor() {
    if (!this.permissionId) {
      this.onBack();
      return;
    }

    this.loadPermission();
  }

  getControl(name: keyof typeof this.permissionForm.controls): FormControl {
    return this.permissionForm.controls[name] as FormControl;
  }

  onBack() {
    this.router.navigate(['/attendance/view-permissions']);
  }

  onEdit() {
    this.router.navigate(['/attendance/view-permissions/edit-attendance-permission', this.permissionId]);
  }

  onDelete() {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.DELETE_ATTENDANCE_PERMISSION',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteAttendancePermission(),
    });
  }

  onApprove() {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.APPROVE_ATTENDANCE_PERMISSION',
      message: 'COMMON.MESSAGES.CONFIRM_APPROVE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.approveAttendancePermission(),
    });
  }

  onReject() {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.REJECT_ATTENDANCE_PERMISSION',
      message: 'COMMON.MESSAGES.CONFIRM_REJECT',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.rejectAttendancePermission(),
    });
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
          this.permission.set(permission);
          this.patchForm(permission, staff.items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.onBack();
        },
      });
  }

  private patchForm(permission: IAttendancePermissionApiDto, staffItems: IStaffApiItem[]) {
    const employee = staffItems.find(item => item.id === permission.employeeId);
    const employeeName = employee
      ? this.getStaffDisplayName(employee)
      : (this.permissionForm.controls.employeeName.value || permission.employeeId);

    this.permissionForm.patchValue({
      employeeName,
      type: String(permission.type ?? 1),
      date: this.toDateInputValue(permission.date),
      durationMinutes: Number(permission.durationMinutes ?? 1),
      note: permission.note ?? '',
      status: String(permission.status ?? 1),
      applicationDate: this.toReadableDate(permission.applicationDate ?? permission.creationTime ?? null),
      attachments: '-',
    });

    this.breadcrumbService.setCurrentBreadcrumbLabel(employeeName, this.route);
  }

  private deleteAttendancePermission() {
    this.isActionLoading.set(true);
    this.attendanceService.deleteAttendancePermission(this.permissionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isActionLoading.set(false);
          this.notificationService.show({
            type: 'success',
            title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
            message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
          this.onBack();
        },
        error: () => {
          this.isActionLoading.set(false);
          this.notificationService.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  private approveAttendancePermission() {
    this.isActionLoading.set(true);
    this.attendanceService.approveAttendancePermission(this.permissionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: permission => {
          this.isActionLoading.set(false);
          this.permission.set(permission);
          this.patchForm(permission, []);
          this.notificationService.show({
            type: 'success',
            title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
            message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
        error: () => {
          this.isActionLoading.set(false);
          this.notificationService.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  private rejectAttendancePermission() {
    this.isActionLoading.set(true);
    this.attendanceService.rejectAttendancePermission(this.permissionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: permission => {
          this.isActionLoading.set(false);
          this.permission.set(permission);
          this.patchForm(permission, []);
          this.notificationService.show({
            type: 'success',
            title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
            message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
        error: () => {
          this.isActionLoading.set(false);
          this.notificationService.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  private toDateInputValue(value?: string | null) {
    return value?.slice(0, 10) ?? '';
  }

  private toReadableDate(value?: string | null) {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy', undefined, 'en-US') || value.slice(0, 10);
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
}
