import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EmployeeService } from '@features/core-hr/services/employee-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { EmployeeInfoSidebarComponent } from "./employee-info-sidebar-component/employee-info-sidebar-component";
import { lucideChevronLeft, lucideChevronRight, lucideEye, lucideFileText, lucidePencilLine, lucideSaudiRiyal } from '@ng-icons/lucide';
import { AttendanceDayCardComponent } from "@shared/components/molecules/attendance-day-card-component/attendance-day-card-component";
import { ITabItem, TabSwitcherComponent } from '@shared/components/molecules/tab-switcher-component/tab-switcher-component';
import { ISelectOption, SelectBtnComponent } from '@shared/components/atoms/select-btn-component/select-btn-component';
import { ActivatedRoute, Router } from '@angular/router';
import { MOCK_ATTENDANCE_DATA } from '@mocks/data/attendance.data';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { IVacationResponse, VacationStatus } from '@features/vacations/models/ivacation';
import { DatePipe } from '@angular/common';
import { SalaryService } from '@features/salary/services/salary-service';
import { MOCK_SALARY_STORE } from '@mocks/data/salary.data';
import { AttendanceService } from '@features/shifts/services/attendance-service';

interface YearFilterSource {
  url: string;
  api: ISelectOption[];
}

@Component({
  selector: 'app-employee-details-component',
  imports: [TranslocoModule, EmployeeInfoSidebarComponent, AttendanceDayCardComponent, TabSwitcherComponent, SelectBtnComponent, NgIcon, AppBaseTableComponent, DatePipe],
  templateUrl: './employee-details-component.html',
  styleUrl: './employee-details-component.css',
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight, lucidePencilLine, lucideSaudiRiyal, lucideFileText, lucideEye })],
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
    params: () => ({ id: this.empId(), tab: this.activeTab() }),
    stream: ({ params }) => {
      if (params.tab === 'salary') {
        return this.salaryService.getAvailableYears(params.id);
      } else {
        return this.attendanceService.getAvailableYears();
      }
    }
  });
  years = computed(() => this.yearsResource.value() || []);

  selectedYear = linkedSignal<YearFilterSource, string>({
    source: () => ({
      url: this.year(),
      api: this.years()
    }),
    computation: (source, previous) => {
      if (source.url) return String(source.url);

      if (source.api.length > 0) return String(source.api[0].value);

      return previous?.value ?? '2025';
    }
  });

  availableMonths = computed(() => {
    const employeeId = this.empId();
    const yearKey = this.selectedYear();
    const tab = this.activeTab();

    const dataSource = tab === 'salary' ? MOCK_SALARY_STORE : MOCK_ATTENDANCE_DATA;
    const employeeData = (dataSource as any)[employeeId] || {};
    const yearData = employeeData[yearKey] || {};

    const months = Object.keys(yearData)
      .sort((a, b) => Number(a) - Number(b))
      .map(m => ({
        label: this.getMonthName(m.padStart(2, '0')),
        value: m
      }));

    return months;
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

    effect(() => {
      if (this.activeTab() === 'vacations') {
        this.currentPage.set(1);
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

  //------------------ vacations
  vacationsResource = rxResource<IVacationResponse, any>({
    params: () => {
      const id = this.empId();
      const page = this.currentPage();
      const pageSize = this.vacationPageSize();
      const year = this.selectedYear();
      const month = this.selectedMonth();

      if (!id || this.activeTab() !== 'vacations') return undefined;

      const cleanMonth = month?.startsWith('0') ? month.replace(/^0+/, '') : month;

      return { employeeId: id, month: cleanMonth, year: year, page: page, limit: pageSize };
    },
    stream: ({ params }) => {
      return this.attendanceService.getVacations(params);
    }
  });

  vacationStats = computed(() => this.vacationsResource.value()?.stats);
  vacationList = computed(() => this.vacationsResource.value()?.data || []);

  vacationStatsCards = computed(() => {
    const stats = this.vacationStats();
    return [
      {
        key: 'EMPLOYEES.VACATIONS.STATS_ANNUAL',
        value: stats?.annualBalance ?? 0,
        unitKey: 'COMMON.DAYS_SINGLE', // "يوم"
        valueClass: '',
      },
      {
        key: 'EMPLOYEES.VACATIONS.STATS_SICK',
        value: stats?.sickBalance ?? 0,
        unitKey: 'COMMON.DAYS_PLURAL', // "أيام"
      },
      {
        key: 'EMPLOYEES.VACATIONS.STATS_REMAINING',
        value: stats?.remainingBalance ?? 0,
        unitKey: 'COMMON.DAYS_PLURAL',
      }
    ];
  });

  statusClasses: Record<VacationStatus, string> = {
    'EMPLOYEES.VACATIONS.APPROVED': 'bg-[#00A3891A] text-[#00A389]',
    'EMPLOYEES.VACATIONS.PENDING': 'bg-[#FFF3E6] text-[#FF8400]',
    'EMPLOYEES.VACATIONS.REJECTED': 'bg-[#FFEDEE] text-[#FF4A55]'
  };
  //pagination
  currentPage = signal<number>(1);
  vacationPageSize = signal<number>(10);
  vacationTotal = computed(() => {
    const res = this.vacationsResource.value();
    return res?.total ?? res?.data?.length ?? 0;
  });

  //----salary section
  private readonly salaryService = inject(SalaryService);
  salaryResource = rxResource({
    params: () => {
      const id = this.empId();
      const year = this.selectedYear();
      const month = this.selectedMonth();
      if (!id || this.activeTab() !== 'salary') return undefined;

      return { employeeId: id, year, month, page: 1, limit: 10 };
    },
    stream: ({ params }) => this.salaryService.getSalaryDetails(params)
  });

  salaryData = computed(() => this.salaryResource.value());

  //-------documents section
  onDownloadDoc(doc: any) {
    // If the doc is a File object (from the upload) or a URL
    if (doc.file instanceof File) {
      const url = URL.createObjectURL(doc.file);
      window.open(url, '_blank');
    } else if (typeof doc.url === 'string') {
      window.open(doc.url, '_blank');
    }
  }
}
