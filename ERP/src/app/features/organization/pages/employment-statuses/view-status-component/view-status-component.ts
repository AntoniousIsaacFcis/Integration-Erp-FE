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
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { NotificationService } from '@core/services/notification-service';
import { of } from 'rxjs';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { CanAccessDirective } from '@shared/directives/can-access-directive';

@Component({
  selector: 'app-view-status-component',
  imports: [
    AppBaseTableComponent,
    TranslocoModule,
    ActionBtnComponent,
    EmptyTablePlaceholderComponent,
    NgIcon,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
    CanAccessDirective,
  ],
  templateUrl: './view-status-component.html',
  styleUrl: './view-status-component.css',
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideEye })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewStatusComponent {
  private readonly service = inject(EmploymentStatusesService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  statusesResource = rxResource({
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

      return this.service.getManagementData(params);
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

  statusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'active', label: 'COMMON.ACTIVE' },
    { value: 'inactive', label: 'COMMON.INACTIVE' },
  ];

  statusesList = computed(() => this.statusesResource.value()?.data ?? []);
  totalItems = computed(() => this.statusesResource.value()?.total ?? 0);

  goToCreate() {
    this.router.navigate(['/organization/employment-statuses/create']);
  }

  handleView(id: string) {
    this.router.navigate(['/organization/employment-statuses/preview', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/organization/employment-statuses/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYMENT_STATUS.DELETE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteStatus(id),
    });
  }

  private deleteStatus(id: string) {
    this.service.delete(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.statusesResource.reload();
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
