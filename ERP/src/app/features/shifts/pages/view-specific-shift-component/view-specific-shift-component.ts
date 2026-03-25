import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '@core/services/translation-service';
import { AttendanceService } from '@features/shifts/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { ISpecialShiftListItem } from '@features/shifts/models/iattendance';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";
import { lucideCirclePlus, lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-view-specific-shift-component',
  imports: [TranslocoModule, NgIcon, DatePipe, AppBaseTableComponent, ActionBtnComponent, DateFilterComponent],
  templateUrl: './view-specific-shift-component.html',
  styleUrl: './view-specific-shift-component.css',
  providers:[provideIcons({lucidePencil,lucideTrash2,lucideCirclePlus})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSpecificShiftComponent {
  private attendanceService = inject(AttendanceService);
  private translation = inject(TranslationService);
  private router = inject(Router);

  currentPage = signal(1);
  searchTerm = signal('');
pageSize = signal(10);

  fromDate = signal<string>('');
  toDate = signal<string>('');

  shiftsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      fromDate: this.fromDate(),
      toDate: this.toDate()
    }),
    stream: ({ params }) => this.attendanceService.getSpecialShifts(params)
  });
  totalItems = computed(() => this.shiftsResource.value()?.total ?? 0);

  specialShifts = computed(() => {
    const data = this.shiftsResource.value()?.data ?? [];
    const lang = this.translation.lang();

    return data.map((shift: ISpecialShiftListItem) => ({
      ...shift,
      displayName: lang === 'ar' ? shift.nameAr : shift.nameEn
    })).sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB; // Ascending: older to newer
    });
  });

  handleCreateNavigation() {
    this.router.navigate(['/shifts/special-create']);
  }

  handleEdit(id: string) {
    this.router.navigate(['/shifts/special/special-create', id]);
  }

  handleDelete(id: string) {
    // Delete logic with confirmation modal
  }

}
