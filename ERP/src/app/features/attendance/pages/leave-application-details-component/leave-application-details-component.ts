import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { ILeaveApplicationApiDto, ILeaveTypeApiDto } from '@features/attendance/models/ivacation';
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
import {
  LEAVE_APPLICATION_PERMISSIONS,
  canApproveWorkflowRequest,
  canDeleteWorkflowRequest,
  canEditWorkflowRequest,
  canRejectWorkflowRequest,
} from '@features/attendance/utils/attendance-permission-auth';

@Component({
  selector: 'app-leave-application-details-component',
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
  templateUrl: './leave-application-details-component.html',
  styleUrl: './leave-application-details-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveApplicationDetailsComponent {
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

  readonly leaveId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly isLoading = signal(true);
  readonly isActionLoading = signal(false);
  readonly isHalfLeave = signal(false);
  readonly leaveTypes = signal<ILeaveTypeApiDto[]>([]);
  readonly leaveApplication = signal<ILeaveApplicationApiDto | null>(null);

  readonly detailsForm = this.fb.nonNullable.group({
    employeeName: [{ value: '', disabled: true }],
    type: [{ value: '1', disabled: true }],
    leaveTypeId: [{ value: '', disabled: true }],
    fromDate: [{ value: '', disabled: true }],
    toDate: [{ value: '', disabled: true }],
    days: [{ value: 1, disabled: true }],
    description: [{ value: '', disabled: true }],
    attachments: [{ value: '', disabled: true }],
    applicationDate: [{ value: '', disabled: true }],
    status: [{ value: '1', disabled: true }],
  });

  private readonly typeValue = toSignal(
    this.detailsForm.controls.type.valueChanges.pipe(startWith(this.detailsForm.controls.type.value)),
  );

  readonly typeOptions = [
    { value: '1', label: 'Enum:LeaveApplicationType.Leave' },
    { value: '2', label: 'Enum:LeaveApplicationType.HalfLeave' },
  ];

  readonly statusOptions = [
    { value: '1', label: 'Enum:LeaveApplicationStatus.Pending' },
    { value: '2', label: 'Enum:LeaveApplicationStatus.Approved' },
    { value: '3', label: 'Enum:LeaveApplicationStatus.Rejected' },
    { value: '4', label: 'Enum:LeaveApplicationStatus.Cancelled' },
  ];

  readonly canEdit = computed(() => {
    const leaveApplication = this.leaveApplication();
    return leaveApplication
      ? canEditWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.update, leaveApplication.status)
      : false;
  });

  readonly canDelete = computed(() => {
    const leaveApplication = this.leaveApplication();
    return leaveApplication
      ? canDeleteWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.delete, leaveApplication.status)
      : false;
  });

  readonly canApprove = computed(() => {
    const leaveApplication = this.leaveApplication();
    return leaveApplication
      ? canApproveWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.approve, leaveApplication.status)
      : false;
  });

  readonly canReject = computed(() => {
    const leaveApplication = this.leaveApplication();
    return leaveApplication
      ? canRejectWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.reject, leaveApplication.status)
      : false;
  });

  constructor() {
    if (!this.leaveId) {
      this.onBack();
      return;
    }

    effect(() => {
      this.isHalfLeave.set(this.typeValue() === '2');
    });

    this.loadLeaveApplication();
  }

  getControl(name: keyof typeof this.detailsForm.controls): FormControl {
    return this.detailsForm.controls[name] as FormControl;
  }

  onBack() {
    this.router.navigate(['/attendance/view-permissions']);
  }

  onEdit() {
    this.router.navigate(['/attendance/view-permissions/edit-leave-application', this.leaveId]);
  }

  onDelete() {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.DELETE_LEAVE_APPLICATION',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteLeaveApplication(),
    });
  }

  onApprove() {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.APPROVE_LEAVE_APPLICATION',
      message: 'COMMON.MESSAGES.CONFIRM_APPROVE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.approveLeaveApplication(),
    });
  }

  onReject() {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.REJECT_LEAVE_APPLICATION',
      message: 'COMMON.MESSAGES.CONFIRM_REJECT',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.rejectLeaveApplication(),
    });
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
          this.leaveApplication.set(leaveApplication);
          this.leaveTypes.set(leaveTypes);
          this.patchForm(leaveApplication, staff.items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.onBack();
        },
      });
  }

  private patchForm(leaveApplication: ILeaveApplicationApiDto, staffItems: IStaffApiItem[]) {
    const employee = staffItems.find(item => item.id === leaveApplication.staffId);
    const employeeName = employee
      ? this.getStaffDisplayName(employee)
      : (this.detailsForm.controls.employeeName.value || leaveApplication.staffId);
    const isHalfLeave = Number(leaveApplication.type ?? 1) === 2;
    const primaryDate = this.toDateInputValue(leaveApplication.date ?? leaveApplication.dateFrom);
    const createdAt = leaveApplication.creationTime ?? leaveApplication.creationDate ?? leaveApplication.applicationDate ?? null;

    this.detailsForm.patchValue({
      employeeName,
      type: String(leaveApplication.type ?? 1),
      leaveTypeId: leaveApplication.leaveTypeId ?? '',
      fromDate: primaryDate,
      toDate: isHalfLeave ? primaryDate : this.toDateInputValue(leaveApplication.dateTo),
      days: Number(leaveApplication.daysCount ?? 1),
      description: leaveApplication.description ?? '',
      attachments: leaveApplication.attachments ?? '',
      applicationDate: this.toReadableDate(createdAt),
      status: String(leaveApplication.status ?? 1),
    });

    this.breadcrumbService.setCurrentBreadcrumbLabel(employeeName, this.route);
  }

  private deleteLeaveApplication() {
    this.isActionLoading.set(true);
    this.attendanceService.deleteLeaveApplication(this.leaveId)
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

  private approveLeaveApplication() {
    this.isActionLoading.set(true);
    this.attendanceService.approveLeaveApplication(this.leaveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: leaveApplication => {
          this.isActionLoading.set(false);
          this.leaveApplication.set(leaveApplication);
          this.patchForm(leaveApplication, []);
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

  private rejectLeaveApplication() {
    this.isActionLoading.set(true);
    this.attendanceService.rejectLeaveApplication(this.leaveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: leaveApplication => {
          this.isActionLoading.set(false);
          this.leaveApplication.set(leaveApplication);
          this.patchForm(leaveApplication, []);
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
