import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PermissionService } from '@features/attendance/services/permission-service';
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
    { value: 'leave', label: 'Enum:AttendancePermissionType.Leave' },
    { value: 'halfLeave', label: 'Enum:AttendancePermissionType.HalfLeave' },
    { value: 'lateArrival', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: 'earlyLeave', label: 'Enum:AttendancePermissionType.EarlyLeave' }
  ];

  statusOptions = [
    { value: '', label: 'COMMON.ALL_STATUS' },
    { value: 'pending', label: 'Enum:AttendancePermissionStatus.Pending' },
    { value: 'approved', label: 'Enum:AttendancePermissionStatus.Approved' },
    { value: 'rejected', label: 'Enum:AttendancePermissionStatus.Rejected' }
  ];

  permissionTypeKey(type: string | number) {
    return `Enum:AttendancePermissionType.${this.toEnumMemberName(type)}`;
  }

  handleAddPermission() {
    this.router.navigate(['/attendance/add-permission']);
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

  private toEnumMemberName(value: string | number): string {
    const numericTypes: Record<number, string> = {
      1: 'Leave',
      2: 'HalfLeave',
      3: 'LateArrival',
      4: 'EarlyLeave'
    };

    if (typeof value === 'number') {
      return numericTypes[value] ?? String(value);
    }

    return value
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
