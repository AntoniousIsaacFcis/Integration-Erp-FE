import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendancePermissionListItem } from '@features/attendance/models/ipermissions';
import { provideIcons } from '@ng-icons/core';
import { lucidePlusCircle } from '@ng-icons/lucide';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { TranslocoModule } from '@jsverse/transloco';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';

@Component({
  selector: 'app-view-permissions-component',
  imports: [TranslocoModule, AppBaseTableComponent, StatusBadgeComponent, ActionBtnComponent, DateFilterComponent, TableStatusBadgeComponent],
  templateUrl: './view-permissions-component.html',
  styleUrl: './view-permissions-component.css',
  providers: [provideIcons({ lucidePlusCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewPermissionsComponent {
  private attendanceService = inject(AttendanceService);
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
    stream: ({ params }) => this.attendanceService.getAttendancePermissions(params)
  });

  permissions = computed<IAttendancePermissionListItem[]>(() => this.permissionsResource.value()?.data ?? []);
  totalItems = computed(() => this.permissionsResource.value()?.total ?? 0);

  typeOptions = [
    { value: '', label: 'PERMISSIONS.ALL_TYPES' },
    { value: '1', label: 'Enum:AttendancePermissionType.Leave' },
    { value: '2', label: 'Enum:AttendancePermissionType.HalfLeave' },
    { value: '3', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: '4', label: 'Enum:AttendancePermissionType.EarlyLeave' }
  ];

  statusOptions = [
    { value: '', label: 'COMMON.ALL_STATUS' },
    { value: '1', label: 'PERMISSIONS.STATUS_PENDING' },
    { value: '2', label: 'PERMISSIONS.STATUS_APPROVED' },
    { value: '3', label: 'PERMISSIONS.STATUS_REJECTED' }
  ];

  handleAddPermission() {
    this.router.navigate(['/attendance/view-permissions/add']);
  }

  formatPermissionNumber(index: number): string {
    const sequence = ((this.currentPage() - 1) * this.pageSize()) + index + 1;
    return sequence.toString().padStart(5, '0');
  }
}
