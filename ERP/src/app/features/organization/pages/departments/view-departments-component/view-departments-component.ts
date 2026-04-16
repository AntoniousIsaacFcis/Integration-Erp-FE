import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';

@Component({
  selector: 'app-view-departments-component',
  imports: [
    TranslocoModule,
    AppBaseTableComponent,
    NgIcon,
    ActionBtnComponent,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './view-departments-component.html',
  styleUrl: './view-departments-component.css',
  providers: [provideIcons({ lucideTrash2, lucidePencil, lucideEye })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDepartmentsComponent {
  private readonly departmentsService = inject(DepartmentsService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  currentPage = signal(1);
  pageSize = signal(10);

  searchTerm = signal('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  statusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'active', label: 'COMMON.ACTIVE' },
    { value: 'inactive', label: 'COMMON.INACTIVE' },
  ];

  departmentsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      status: this.selectedStatus(),
    }),
    stream: ({ params }) => {
      if (!isPlatformBrowser(this.platformId)) {
        return of({ data: [], total: 0, page: 1, limit: 10 });
      }

      return this.departmentsService.getManagementData(params);
    },
  });

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.selectedStatus();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  totalItems = computed(() => this.departmentsResource.value()?.total ?? 0);
  staffOptions = this.departmentsService.staffLookupList;
  departmentsList = computed(() => {
    const staffMap = new Map(
      this.staffOptions().map((staff) => [staff.id, staff.displayName]),
    );

    return (this.departmentsResource.value()?.data ?? []).map((department) => ({
      ...department,
      managerNames: department.managerStaffIds
        .map((staffId) => staffMap.get(staffId))
        .filter((name): name is string => Boolean(name)),
      employeeCount: department.employeeStaffIds.length,
    }));
  });

  handleCreateNavigation() {
    this.router.navigate(['/organization/departments/create']);
  }

  handleView(id: string) {
    this.router.navigate(['/organization/departments/preview', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/organization/departments/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'ORGANIZATION.DELETE_DEPARTMENT',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteDepartment(id),
    });
  }

  private deleteDepartment(id: string) {
    this.departmentsService.delete(id).subscribe({
      next: () => {
        this.departmentsService.reloadLookups();
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.departmentsResource.reload();
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
