import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { ISpecialShiftListItem } from '@features/attendance/models/iattendance';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";
import { lucideCirclePlus, lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { StatusBadgeComponent } from '@shared/components/molecules/status-badge-component/status-badge-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';

@Component({
  selector: 'app-view-specific-shift-component',
  imports: [TranslocoModule, NgIcon, DatePipe, AppBaseTableComponent, ActionBtnComponent, DateFilterComponent, EmptyTablePlaceholderComponent, StatusBadgeComponent, TableStatusBadgeComponent],
  templateUrl: './view-specific-shift-component.html',
  styleUrl: './view-specific-shift-component.css',
  providers:[provideIcons({lucidePencil,lucideTrash2,lucideCirclePlus,lucideEye})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSpecificShiftComponent {
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  currentPage = signal(1);
  searchTerm = signal('');
pageSize = signal(10);

  fromDate = signal<string>('');
  toDate = signal<string>('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  statusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'active', label: 'COMMON.ACTIVE' },
    { value: 'inactive', label: 'COMMON.INACTIVE' },
  ];

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.selectedStatus();
      this.fromDate();
      this.toDate();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  shiftsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      status: this.selectedStatus(),
      fromDate: this.fromDate(),
      toDate: this.toDate()
    }),
    stream: ({ params }) => this.attendanceService.getSpecialShifts(params)
  });
  totalItems = computed(() => this.shiftsResource.value()?.total ?? 0);

  specialShifts = computed(() => {
    const data = this.shiftsResource.value()?.data ?? [];

    return [...data]
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      })
      .map((shift: ISpecialShiftListItem, index) => ({
        ...shift,
        displayName: `${shift.name || shift.nameAr || shift.nameEn || '-'} #${index + 1}`,
        relatedShift: shift.assignedShiftName || '-',
        shiftTypeKey: Number(shift.priority ?? 100) >= 100 ? 'SHIFT.PRIMARY' : 'SHIFT.SECONDARY',
        assignmentMethodKey: shift.criteriaType === 2 ? 'SHIFT.MANUAL' : 'SHIFT.RULES',
        status: shift.isActive === false ? 'inactive' : 'active',
      }));
  });

  handleCreateNavigation() {
    this.router.navigate(['/attendance/special-create']);
  }

  handleView(id: string) {
    this.router.navigate(['/attendance/special-details', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/attendance/special-edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'SHIFT.DELETE_SHIFT',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteShiftAssignment(id),
    });
  }

  private deleteShiftAssignment(id: string) {
    this.attendanceService.deleteShiftAssignment(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.shiftsResource.reload();
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
