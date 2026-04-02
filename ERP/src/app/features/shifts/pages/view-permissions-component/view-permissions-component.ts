import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PermissionService } from '@features/shifts/services/permission-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlusCircle, lucideTrash2 } from '@ng-icons/lucide';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";
import { TranslocoModule } from '@jsverse/transloco';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";

@Component({
  selector: 'app-view-permissions-component',
  imports: [TranslocoModule, DatePipe, NgIcon, AppBaseTableComponent, StatusBadgeComponent, ActionBtnComponent, DateFilterComponent],
  templateUrl: './view-permissions-component.html',
  styleUrl: './view-permissions-component.css',
  providers: [provideIcons({ lucidePencil, lucideEye, lucideTrash2,lucidePlusCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewPermissionsComponent {
private permissionService = inject(PermissionService);
  private router = inject(Router);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  statusFilter = signal<string>('');
  typeFilter = signal<string>('');

  fromDate = signal<string>('');
  toDate = signal<string>('');

  permissionsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      type: this.typeFilter() || undefined,
      fromDate: this.fromDate() || undefined,
      toDate: this.toDate() || undefined
    }),
    stream: ({ params }) => this.permissionService.getPermissions(params)
  });

  permissions = computed(() => this.permissionsResource.value()?.data ?? []);
  totalItems = computed(() => this.permissionsResource.value()?.total ?? 0);

  typeOptions = [
    { value: '', label: 'PERMISSIONS.ALL_TYPES' },
    { value: 'holiday', label: 'PERMISSIONS.TYPE_HOLIDAY' },
    { value: 'permission', label: 'PERMISSIONS.TYPE_PERMISSION' },
    { value: 'excuse', label: 'PERMISSIONS.TYPE_EXCUSE' }
  ];

  statusOptions = [
    { value: '', label: 'COMMON.ALL_STATUS' },
    { value: 'pending', label: 'COMMON.STATUS_PENDING' },
    { value: 'approved', label: 'COMMON.STATUS_APPROVED' },
    { value: 'rejected', label: 'COMMON.STATUS_REJECTED' }
  ];

  handleAddPermission() {
    this.router.navigate(['/shifts/add-permission']);
  }

  handleEdit(id: string) {
    this.router.navigate(['/attendance/permissions/edit', id]);
  }

  handleView(id: string) {
    this.router.navigate(['/attendance/permissions/details', id]);
  }

  handleDelete(id: string) {
    console.log('Delete permission:', id);
  }
}
