import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
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
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { IVacationResponse, VacationStatus } from '@features/attendance/models/ivacation';
import { DatePipe } from '@angular/common';
import { SalaryService } from '@features/salary/services/salary-service';
import { MOCK_SALARY_STORE } from '@mocks/data/salary.data';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IAttendanceAvailablePeriod } from '@features/attendance/models/iattendance';
import { EmployeeDocumentService } from '@features/core-hr/services/employee-document-service';
import { IDocument } from '@shared/models/idocument';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { TranslationService } from '@core/services/translation-service';

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
  private readonly employeeDocumentService = inject(EmployeeDocumentService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly translationService = inject(TranslationService);

  empId = input.required<string>(); //from Route Path
  year = input<string>('2025');
  month = input<string>('10');

  selectedMonth = signal(String(new Date().getMonth() + 1));
  selectedYear = signal(String(new Date().getFullYear()));

  activeTab = signal<string>('attendance');

  onFilterChange(key: 'month' | 'year', value: any) {
    const safeValue = (value instanceof Event || typeof value === 'object')
      ? (value.target as any)?.value
      : value;

    if (!safeValue) return;

    if (key === 'month') {
      this.selectedMonth.set(safeValue.toString());
      this.currentPage.set(1);
      return;
    }

    this.selectedYear.set(safeValue.toString());
    this.currentPage.set(1);
  }

  yearsResource = rxResource({
    params: () => {
      const id = this.empId();
      return id && this.activeTab() === 'salary' ? { id } : undefined;
    },
    stream: ({ params }) => {
      return this.salaryService.getAvailableYears(params.id);
    }
  });
  years = computed(() => this.yearsResource.value() || []);

  attendancePeriodsResource = rxResource({
    params: () => {
      const id = this.empId();
      return id && this.activeTab() === 'attendance' ? { id } : undefined;
    },
    stream: ({ params }) => this.attendanceService.getAvailablePeriods(params.id),
  });

  attendancePeriods = computed<IAttendanceAvailablePeriod[]>(() => {
    return (this.attendancePeriodsResource.value() ?? [])
      .map(period => ({
        year: Number(period.year),
        months: period.months
          .map(month => Number(month))
          .filter(month => month >= 1 && month <= 12)
          .sort((a, b) => a - b),
      }))
      .filter(period => period.year && period.months.length)
      .sort((a, b) => b.year - a.year);
  });

  selectedAttendancePeriod = computed(() => {
    const selectedYear = Number(this.selectedYear());
    return this.attendancePeriods().find(period => period.year === selectedYear);
  });

  yearOptions = computed(() => {
    if (this.activeTab() === 'attendance') {
      const periods = this.attendancePeriods();

      return periods.map(period => ({
        label: String(period.year),
        value: String(period.year),
      }));
    }

    const apiYears = this.years();

    if (apiYears.length) {
      return apiYears;
    }

    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map(year => ({
      label: String(year),
      value: String(year),
    }));
  });

  availableMonths = computed(() => {
    const employeeId = this.empId();
    const yearKey = this.selectedYear();
    const tab = this.activeTab();

    if (tab === 'attendance') {
      return (this.selectedAttendancePeriod()?.months ?? []).map(month => ({
        label: this.getMonthName(String(month).padStart(2, '0')),
        value: String(month),
      }));
    }

    if (tab === 'vacations') {
      return this.monthOptions();
    }

    const dataSource = MOCK_SALARY_STORE;
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

  private monthOptions(): ISelectOption[] {
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1);

      return {
        label: this.getMonthName(month.padStart(2, '0')),
        value: month,
      };
    });
  }

  private getMonthName(month: string): string {
    const arabicMonthNames: Record<string, string> = {
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
    const englishMonthNames: Record<string, string> = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December'
    };

    const monthNames = this.translationService.lang() === 'ar' ? arabicMonthNames : englishMonthNames;
    return monthNames[month] || month;
  }

  constructor() {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;
    const breadcrumbLabel = navigationState?.['breadcrumbLabel'];

    if (typeof breadcrumbLabel === 'string') {
      this.breadcrumbService.setCurrentBreadcrumbLabel(breadcrumbLabel, this.route);
    }

    effect(() => {
      if (this.activeTab() === 'vacations') {
        this.currentPage.set(1);
      }
    });

    effect(() => {
      if (this.activeTab() !== 'attendance') {
        return;
      }

      const periods = this.attendancePeriods();

      if (!periods.length) {
        return;
      }

      const selectedYear = Number(this.selectedYear());
      const period = periods.find(item => item.year === selectedYear) ?? periods[0];
      const nextYear = String(period.year);

      if (this.selectedYear() !== nextYear) {
        this.selectedYear.set(nextYear);
        return;
      }

      const selectedMonth = Number(this.selectedMonth());

      if (!period.months.includes(selectedMonth)) {
        const latestMonth = period.months.at(-1);

        if (latestMonth) {
          this.selectedMonth.set(String(latestMonth));
        }
      }
    });

    effect(() => {
      const employee = this.employeeResource.value();
      const employeeName = employee?.fullNameAr || employee?.fullNameEn || '';
      const employeeCode = employee?.staffCode || employee?.id || '';
      const breadcrumbLabel = [employeeCode, employeeName].filter(Boolean).join('-');

      this.breadcrumbService.setCurrentBreadcrumbLabel(breadcrumbLabel, this.route);
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

  documentsResource = rxResource<IDocument[], any>({
    params: () => {
      const id = this.empId();

      if (!id || this.activeTab() !== 'docs') {
        return undefined;
      }

      return { id };
    },
    stream: ({ params }) => this.employeeDocumentService.getDocuments(params.id),
  });


  attendanceResource = rxResource({
    params: () => {
      const id = this.empId();
      const year = String(this.selectedYear());
      const month = String(this.selectedMonth());
      const isAttendance = this.activeTab() === 'attendance';

      if (!id || !year || !month || !isAttendance) return undefined;

      const cleanMonth = month.startsWith('0') ? month.replace(/^0+/, '') : month;
      const periods = this.attendancePeriodsResource.value();
      const period = this.attendancePeriods().find(item => item.year === Number(year));

      if (!periods || !period?.months.includes(Number(cleanMonth))) {
        return undefined;
      }

      return { id, year, month: cleanMonth };
    },
    stream: ({ params }) => {
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
    'EMPLOYEES.VACATIONS.REJECTED': 'bg-[#FFEDEE] text-[#FF4A55]',
    'EMPLOYEES.VACATIONS.CANCELLED': 'bg-[#F4F4F4] text-[#797979]',
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
  onDownloadDoc(doc: IDocument) {
    if (doc.file instanceof File) {
      const localUrl = URL.createObjectURL(doc.file);
      window.open(localUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
      return;
    }

    if (!doc.id) {
      return;
    }

    this.employeeDocumentService.downloadDocument(doc.id).subscribe((response) => {
      const blob = response.body;
      if (!blob) {
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      window.open(downloadUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    });
  }
}
