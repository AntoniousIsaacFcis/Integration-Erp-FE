import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslationService } from '@core/services/translation-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2, lucidePlus, lucideCirclePlus } from '@ng-icons/lucide';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { DatePipe } from '@angular/common';
import { IShift, IShiftListItem } from '@features/attendance/models/iattendance';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";

@Component({
  selector: 'app-view-shift-component',
  standalone: true,
  imports: [TranslocoModule, NgIcon, AppBaseTableComponent, ActionBtnComponent, DatePipe, DateFilterComponent, TableStatusBadgeComponent],
  templateUrl: './view-shift-component.html',
  styleUrl: './view-shift-component.css',
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideCirclePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewShiftComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

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
    const lang = this.translationService.lang();

    return response.map((shift: IShiftListItem) => ({
      ...shift,
      displayName: lang === 'ar' ? shift.nameAr : (shift.nameEn || shift.nameAr)
    }));
  });


  handleCreateNavigation() {
    this.router.navigate(['/attendance/create']);
  }

  handleEdit(id: string) {
    this.router.navigate(['/attendance/details', id]);
  }

  handleDelete(id: string) {
    // منطق الحذف هنا (مثلاً فتح Modal تأكيد)
  }
}
