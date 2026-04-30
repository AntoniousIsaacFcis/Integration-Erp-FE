import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCirclePlus, lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { DatePipe } from '@angular/common';
import { IShiftListItem } from '@features/attendance/models/iattendance';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';

type DayNameKey = 'DAYS.SUNDAY' | 'DAYS.MONDAY' | 'DAYS.TUESDAY' | 'DAYS.WEDNESDAY' | 'DAYS.THURSDAY' | 'DAYS.FRIDAY' | 'DAYS.SATURDAY';
type ShiftTypeLabelKey = 'SHIFT.TYPES.STANDARD' | 'SHIFT.TYPES.FLEXIBLE';

@Component({
  selector: 'app-view-shift-component',
  standalone: true,
  imports: [TranslocoModule, NgIcon, AppBaseTableComponent, ActionBtnComponent, DatePipe, DateFilterComponent, TableStatusBadgeComponent, EmptyTablePlaceholderComponent],
  templateUrl: './view-shift-component.html',
  styleUrl: './view-shift-component.css',
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideCirclePlus, lucideEye })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewShiftComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly dayNameKeys: Record<number, DayNameKey> = {
    0: 'DAYS.SUNDAY',
    1: 'DAYS.MONDAY',
    2: 'DAYS.TUESDAY',
    3: 'DAYS.WEDNESDAY',
    4: 'DAYS.THURSDAY',
    5: 'DAYS.FRIDAY',
    6: 'DAYS.SATURDAY',
    7: 'DAYS.SUNDAY',
  };

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  selectedDate = signal<string>('');

  shiftsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      status: this.selectedStatus(),
      createdAt: this.selectedDate()
    }),
    stream: ({ params }) => this.attendanceService.getShifts(params)
  });

  totalItems = computed(() => this.shiftsResource.value()?.total ?? 0);

  shiftsList = computed(() => {
    const response = this.shiftsResource.value()?.data ?? [];

    return response.map((shift: IShiftListItem) => ({
      ...shift,
      displayName: shift.name || shift.nameAr || shift.nameEn || '-',
      typeLabelKey: this.getShiftTypeLabelKey(shift.type),
      holidayDayKeys: this.getHolidayDayKeys(shift),
      holidayDaysFallback: this.getHolidayDaysFallback(shift),
    }));
  });


  handleCreateNavigation() {
    this.router.navigate(['/attendance/create']);
  }

  handleView(id: string) {
    this.router.navigate(['/attendance/details', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/attendance/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'SHIFT.DELETE_SHIFT',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteShift(id),
    });
  }

  private deleteShift(id: string) {
    this.attendanceService.deleteShift(id).subscribe({
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

  private getHolidayDayKeys(shift: IShiftListItem) {
    return (shift.days ?? [])
      .filter(day => !day.isWorkDay)
      .map(day => this.dayNameKeys[day.dayOfWeek])
      .filter((dayNameKey): dayNameKey is DayNameKey => Boolean(dayNameKey));
  }

  private getHolidayDaysFallback(shift: IShiftListItem) {
    if (shift.holidayDaysCount === undefined || shift.holidayDaysCount === null) {
      return '-';
    }

    return String(shift.holidayDaysCount);
  }

  private getShiftTypeLabelKey(type: string | number): ShiftTypeLabelKey {
    return Number(type) === 2 ? 'SHIFT.TYPES.FLEXIBLE' : 'SHIFT.TYPES.STANDARD';
  }
}
