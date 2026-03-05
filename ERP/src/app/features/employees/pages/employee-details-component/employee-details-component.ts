import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EmployeeService } from '@features/employees/services/employee-service';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { EmployeeInfoSidebarComponent } from "./employee-info-sidebar-component/employee-info-sidebar-component";
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { AttendanceDayCardComponent } from "@shared/components/molecules/attendance-day-card-component/attendance-day-card-component";
import { ITabItem, TabSwitcherComponent } from '@shared/components/molecules/tab-switcher-component/tab-switcher-component';
import { ISelectOption, SelectBtnComponent } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { ActivatedRoute, Router } from '@angular/router';
import { MOCK_ATTENDANCE_DATA } from '@mocks/data/attendance.data';
import { AttendanceService } from '@features/attendance/services/attendance-service';

interface YearFilterSource {
  url: string;
  api: ISelectOption[];
}

@Component({
  selector: 'app-employee-details-component',
  imports: [TranslocoModule, EmployeeInfoSidebarComponent, AttendanceDayCardComponent, TabSwitcherComponent, SelectBtnComponent],
  templateUrl: './employee-details-component.html',
  styleUrl: './employee-details-component.css',
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailsComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly attendanceService = inject(AttendanceService);

  empId = input.required<string>(); //from Route Path
  year = input<string>('2025');
  month = input<string>('10');

  selectedMonth = linkedSignal<string[], string>({
  source: () => this.availableMonths().map(m => m.value), // يراقب مصفوفة القيم فقط
  computation: (months, previous) => {
    const urlMonth = this.month();

    if (urlMonth && months.includes(urlMonth)) return urlMonth;

    return months[0] ?? '1';
  }
});

  activeTab = signal<string>('attendance');

 onFilterChange(key: 'month' | 'year', value: any) {
  const safeValue = (value instanceof Event || typeof value === 'object')
    ? (value.target as any)?.value
    : value;

  if (!safeValue) return;

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { [key]: safeValue.toString() },
    queryParamsHandling: 'merge',
    replaceUrl: true
  });
}

yearsResource = rxResource({
  stream: () => this.attendanceService.getAvailableYears()
});
years = computed(() => this.yearsResource.value() || []);

selectedYear = linkedSignal<YearFilterSource, string>({
  source: () => ({
    url: this.year(),
    api: this.years()
  }),
  computation: (source, previous) => {
    if (source.url ) return String(source.url);

    if (source.api.length > 0) return String(source.api[0].value);

    return previous?.value ?? '2025';
  }
});
  availableMonths = computed(() => {
  const yearKey = this.selectedYear();

  const data = (MOCK_ATTENDANCE_DATA as Record<string, any>)[yearKey] || {};

  return Object.keys(data)
    .sort((a, b) => Number(a) - Number(b))
    .map(m => ({
      label: this.getMonthName(m.padStart(2, '0')),
      value: m
    }));
});
  private getMonthName(month: string): string {
    const monthNames: Record<string, string> = {
      '01': 'يناير',
      '02': 'فبراير',
      '03': 'مارس',
      '04': 'أبريل',
      '05': 'مايو',
      '06': 'يونيو',
      '07': 'يوليو',
      '08': 'أغسطس',
      '09': 'سبتمبر',
      '10': 'أكتوبر',
      '11': 'نوفمبر',
      '12': 'ديسمبر'
    };
    return monthNames[month] || month;
  }

  constructor() {
    effect(() => {
      const months = this.availableMonths();
      const currentMonth = this.selectedMonth();

      if (months.length > 0) {
        const monthExists = months.find(m => m.value === currentMonth);

        if (!monthExists) {
          this.onFilterChange('month', months[0].value.toString());
        }
      }
    });
  }
  readonly tabs: ITabItem[] = [
    { id: 'attendance', label: 'TABS.ATTENDANCE' },
    { id: 'vacations', label: 'TABS.VACATIONS' },
    { id: 'salary', label: 'TABS.SALARY' },
    { id: 'docs', label: 'TABS.DOCUMENTS' }
  ];


  employeeResource = rxResource({
    params: () => {
      const id = this.empId();
      return id && id !== 'undefined' ? { id } : undefined;
    },
    stream: ({ params }) => {
      return this.employeeService.getEmployeeById(params.id);
    }
  });


  attendanceResource = rxResource({
    params: () => {
      const id = this.empId();
      const year = String(this.selectedYear());
      const month = String(this.selectedMonth());
      const isAttendance = this.activeTab() === 'attendance';

      if (!id || !year || !month || !isAttendance) return undefined;

      const cleanMonth = month.startsWith('0') ? month.replace(/^0+/, '') : month;

      return { id, year, month: cleanMonth };
    },
    stream: ({ params }) => {
      console.log('Resource Params:', params);
      return this.attendanceService.getAttendance(params.id, params.year, params.month);
    }
  });

}
