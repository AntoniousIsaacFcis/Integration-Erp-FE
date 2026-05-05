import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucidePlusCircle } from '@ng-icons/lucide';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendancePermissionListItem } from '@features/attendance/models/ipermissions';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';

@Component({
  selector: 'app-view-permissions-component',
  standalone: true,
  imports: [
    TranslocoModule,
    AppBaseTableComponent,
    ActionBtnComponent,
    DateFilterComponent,
    EmptyTablePlaceholderComponent,
    StatusBadgeComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './view-permissions-component.html',
  styleUrl: './view-permissions-component.css',
  providers: [provideIcons({ lucidePlusCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPermissionsComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  statusFilter = signal('');
  typeFilter = signal('');
  fromDate = signal('');
  toDate = signal('');

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.statusFilter();
      this.typeFilter();
      this.fromDate();
      this.toDate();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  permissionsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      type: this.typeFilter() || undefined,
      fromDate: this.fromDate() || undefined,
      toDate: this.toDate() || undefined,
    }),
    stream: ({ params }) => this.attendanceService.getAttendancePermissions(params),
  });

  permissions = computed<IAttendancePermissionListItem[]>(() => this.permissionsResource.value()?.data ?? []);
  totalItems = computed(() => this.permissionsResource.value()?.total ?? 0);

  permissionTypeOptions = [
    { value: '', label: 'PERMISSIONS.ALL_TYPES' },
    { value: '1', label: 'Enum:AttendancePermissionType.LateArrival' },
    { value: '2', label: 'Enum:AttendancePermissionType.EarlyLeave' },
  ];

  statusOptions = [
    { value: '', label: 'COMMON.ALL_STATUS' },
    { value: '1', label: 'PERMISSIONS.STATUS_PENDING' },
    { value: '2', label: 'PERMISSIONS.STATUS_APPROVED' },
    { value: '3', label: 'PERMISSIONS.STATUS_REJECTED' },
  ];

  handleAddLeaveApplication() {
    this.router.navigate(['/attendance/view-permissions/create-leave-application']);
  }

  handleAddAttendancePermission() {
    this.router.navigate(['/attendance/view-permissions/create-attendance-permission']);
  }

  formatRecordNumber(index: number, page: number, pageSize: number): string {
    const sequence = ((page - 1) * pageSize) + index + 1;
    return sequence.toString().padStart(5, '0');
  }
}
