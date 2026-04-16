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
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { EmptyTablePlaceholderComponent } from "@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { NotificationService } from '@core/services/notification-service';
import { of } from 'rxjs';
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";

@Component({
  selector: 'app-view-emloyment-types-component',
  imports: [AppBaseTableComponent, TranslocoModule, ActionBtnComponent, EmptyTablePlaceholderComponent, NgIcon, StatusBadgeComponent, TableStatusBadgeComponent],
  templateUrl: './view-emloyment-types-component.html',
  styleUrl: './view-emloyment-types-component.css',
  providers:[provideIcons({lucidePencil,lucideTrash2,lucideEye})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEmloymentTypesComponent {
  private readonly service = inject(EmploymentTypesService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  currentPage = signal(1);
  pageSize = signal(10);

  searchTerm = signal('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  empTypesResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: 10,
      search: this.searchTerm(),
      status: this.selectedStatus()
    }),
    stream: ({ params }) => {
      if (!isPlatformBrowser(this.platformId)) {
        return of({ data: [], total: 0, page: 1, limit: 10 });
      }

      return this.service.getManagementData(params);
    }
  });

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.selectedStatus();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  typesList = computed(() => this.empTypesResource.value()?.data ?? []);
  totalItems = computed(() => this.empTypesResource.value()?.total ?? 0);

  statusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'active', label: 'COMMON.ACTIVE' },
    { value: 'inactive', label: 'COMMON.INACTIVE' }
  ];

  goToCreate() { this.router.navigate(['/organization/employment-types/create']); }

  handleView(id: string) {
    this.router.navigate(['/organization/employment-types/preview', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/organization/employment-types/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'JOB_LEVEL.DELETE_TYPE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteEmploymentType(id),
    });
  }

  private deleteEmploymentType(id: string) {
    this.service.delete(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.empTypesResource.reload();
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
