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
import { DesignationsService } from '@features/organization/services/designations-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';

@Component({
  selector: 'app-view-designations-component',
  imports: [
    TranslocoModule,
    AppBaseTableComponent,
    NgIcon,
    ActionBtnComponent,
    EmptyTablePlaceholderComponent,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './view-designations-component.html',
  styleUrl: './view-designations-component.css',
  providers: [provideIcons({ lucideTrash2, lucidePencil, lucideEye })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDesignationsComponent {
  private readonly designationsService = inject(DesignationsService);
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

  designationsResource = rxResource({
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

      return this.designationsService.getManagementData(params);
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

  totalItems = computed(() => this.designationsResource.value()?.total ?? 0);

  designationsList = computed(() => {
    const departmentMap = new Map(
      this.departmentsService.selectList().map((department) => [department.id, department.displayName]),
    );

    return (this.designationsResource.value()?.data ?? []).map((designation) => ({
      ...designation,
      departmentName: designation.departmentId
        ? departmentMap.get(designation.departmentId) ?? ''
        : '',
    }));
  });

  handleCreateNavigation() {
    this.router.navigate(['/organization/designations/create']);
  }

  handleView(id: string) {
    this.router.navigate(['/organization/designations/preview', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/organization/designations/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'ORGANIZATION.DELETE_DESIGNATION',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteDesignation(id),
    });
  }

  private deleteDesignation(id: string) {
    this.designationsService.delete(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.designationsResource.reload();
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
