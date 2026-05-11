import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { NotificationService } from '@core/services/notification-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideEye, lucidePencil, lucidePlusCircle, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import {
  ATTENDANCE_PERMISSION_PERMISSIONS,
  LEAVE_APPLICATION_PERMISSIONS,
  canApproveWorkflowRequest,
  canDeleteWorkflowRequest,
  canEditWorkflowRequest,
  canRejectWorkflowRequest,
} from '@features/attendance/utils/attendance-permission-auth';
import { IUnifiedRequestListItem } from '@features/attendance/models/ipermissions';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { PageTitleComponent } from '@shared/components/atoms/page-title-component/page-title-component';
import { SearchbarComponent } from '@shared/components/molecules/searchbar-component/searchbar-component';

@Component({
  selector: 'app-view-permissions-component',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    AppBaseTableComponent,
    ActionBtnComponent,
    DateFilterComponent,
    EmptyTablePlaceholderComponent,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
    PageTitleComponent,
    SearchbarComponent,
  ],
  templateUrl: './view-permissions-component.html',
  styleUrl: './view-permissions-component.css',
  providers: [provideIcons({ lucidePlusCircle, lucideEye, lucidePencil, lucideTrash2, lucideCheck, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPermissionsComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  statusFilter = signal('');
  typeFilter = signal('');
  fromDate = signal('');

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.statusFilter();
      this.typeFilter();
      this.fromDate();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  requestsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      type: this.typeFilter() || undefined,
      fromDate: this.fromDate() || undefined,
    }),
    stream: ({ params }) => this.attendanceService.getUnifiedRequests(params),
  });

  requests = computed<IUnifiedRequestListItem[]>(() => this.requestsResource.value()?.data ?? []);
  totalItems = computed(() => this.requestsResource.value()?.total ?? 0);

  permissionTypeOptions = [
    { value: '', label: 'PERMISSIONS.ALL_REQUEST_TYPES' },
    { value: '1', label: 'Enum:LeaveApplicationType.Leave' },
    { value: '2', label: 'Enum:LeaveApplicationType.HalfLeave' },
    { value: '3', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: '4', label: 'Enum:AttendancePermissionType.EarlyLeave' },
  ];

  statusOptions = [
    { value: '', label: 'COMMON.ALL_STATUS' },
    { value: '1', label: 'Enum:LeaveApplicationStatus.Pending' },
    { value: '2', label: 'Enum:LeaveApplicationStatus.Approved' },
    { value: '3', label: 'Enum:LeaveApplicationStatus.Rejected' },
    { value: '4', label: 'Enum:LeaveApplicationStatus.Cancelled' },
  ];

  handleAddLeaveApplication() {
    this.router.navigate(['/attendance/view-permissions/create-leave-application']);
  }

  handleAddAttendancePermission() {
    this.router.navigate(['/attendance/view-permissions/create-attendance-permission']);
  }

  handleViewLeaveApplication(id: string) {
    this.router.navigate(['/attendance/view-permissions/leave-application-details', id]);
  }

  handleRowClick(request: IUnifiedRequestListItem) {
    if (this.isLeaveRequest(request)) {
      this.handleViewLeaveApplication(request.id);
      return;
    }

    if (this.isAttendancePermissionRequest(request)) {
      this.handleViewAttendancePermission(request.id);
    }
  }

  handleEditLeaveApplication(id: string) {
    this.router.navigate(['/attendance/view-permissions/edit-leave-application', id]);
  }

  handleDeleteLeaveApplication(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.DELETE_LEAVE_APPLICATION',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteLeaveApplication(id),
    });
  }

  canEditLeaveApplication(request: IUnifiedRequestListItem) {
    return canEditWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.update, request.status);
  }

  canDeleteLeaveApplication(request: IUnifiedRequestListItem) {
    return canDeleteWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.delete, request.status);
  }

  canApproveLeaveApplication(request: IUnifiedRequestListItem) {
    return canApproveWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.approve, request.status);
  }

  canRejectLeaveApplication(request: IUnifiedRequestListItem) {
    return canRejectWorkflowRequest(this.authService, LEAVE_APPLICATION_PERMISSIONS.reject, request.status);
  }

  canEditAttendancePermission(request: IUnifiedRequestListItem) {
    return canEditWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.update, request.status);
  }

  canDeleteAttendancePermission(request: IUnifiedRequestListItem) {
    return canDeleteWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.delete, request.status);
  }

  canApproveAttendancePermission(request: IUnifiedRequestListItem) {
    return canApproveWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.approve, request.status);
  }

  canRejectAttendancePermission(request: IUnifiedRequestListItem) {
    return canRejectWorkflowRequest(this.authService, ATTENDANCE_PERMISSION_PERMISSIONS.reject, request.status);
  }

  handleViewAttendancePermission(id: string) {
    this.router.navigate(['/attendance/view-permissions/attendance-permission-details', id]);
  }

  handleEditAttendancePermission(id: string) {
    this.router.navigate(['/attendance/view-permissions/edit-attendance-permission', id]);
  }

  handleDeleteAttendancePermission(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.DELETE_ATTENDANCE_PERMISSION',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteAttendancePermission(id),
    });
  }

  handleApproveLeaveApplication(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.APPROVE_LEAVE_APPLICATION',
      message: 'COMMON.MESSAGES.CONFIRM_APPROVE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.approveLeaveApplication(id),
    });
  }

  handleRejectLeaveApplication(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.REJECT_LEAVE_APPLICATION',
      message: 'COMMON.MESSAGES.CONFIRM_REJECT',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.rejectLeaveApplication(id),
    });
  }

  handleApproveAttendancePermission(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.APPROVE_ATTENDANCE_PERMISSION',
      message: 'COMMON.MESSAGES.CONFIRM_APPROVE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.approveAttendancePermission(id),
    });
  }

  handleRejectAttendancePermission(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.VACATIONS.REJECT_ATTENDANCE_PERMISSION',
      message: 'COMMON.MESSAGES.CONFIRM_REJECT',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.rejectAttendancePermission(id),
    });
  }

  formatRecordNumber(index: number, page: number, pageSize: number): string {
    const sequence = ((page - 1) * pageSize) + index + 1;
    return sequence.toString().padStart(5, '0');
  }

  isLeaveRequest(request: IUnifiedRequestListItem) {
    return request.requestType === 1 || request.requestType === 2;
  }

  isAttendancePermissionRequest(request: IUnifiedRequestListItem) {
    return request.requestType === 3 || request.requestType === 4;
  }

  private deleteLeaveApplication(id: string) {
    this.attendanceService.deleteLeaveApplication(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.requestsResource.reload();
      },
      error: () => {
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

  private approveLeaveApplication(id: string) {
    this.attendanceService.approveLeaveApplication(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.requestsResource.reload();
      },
      error: () => {
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

  private rejectLeaveApplication(id: string) {
    this.attendanceService.rejectLeaveApplication(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.requestsResource.reload();
      },
      error: () => {
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

  private deleteAttendancePermission(id: string) {
    this.attendanceService.deleteAttendancePermission(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.requestsResource.reload();
      },
      error: () => {
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

  private approveAttendancePermission(id: string) {
    this.attendanceService.approveAttendancePermission(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.requestsResource.reload();
      },
      error: () => {
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

  private rejectAttendancePermission(id: string) {
    this.attendanceService.rejectAttendancePermission(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.requestsResource.reload();
      },
      error: () => {
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
}
