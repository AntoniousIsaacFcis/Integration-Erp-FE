import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EmployeeService } from '@features/core-hr/services/employee-service';
import { of } from 'rxjs';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideSaudiRiyal, lucideTrash2 } from '@ng-icons/lucide';
import { IEmployeeResponse } from '@features/core-hr/models/iemployee';
import { TranslationService } from '@core/services/translation-service';
import { DateFilterComponent } from "@shared/components/molecules/date-filter-component/date-filter-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";
import { DesignationsService } from '@features/organization/services/designations-service';
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { NotificationService } from '@core/services/notification-service';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { NationalitiesService } from '@core/services/nationalities-service';

@Component({
  selector: 'app-view-employees-component',
  imports: [TranslocoModule, NgIcon, AppBaseTableComponent, DecimalPipe, DatePipe, DateFilterComponent, ActionBtnComponent, TableStatusBadgeComponent, EmptyTablePlaceholderComponent],
  templateUrl: './view-employees-component.html',
  styleUrl: './view-employees-component.css',
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideSaudiRiyal, lucideEye })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEmployeesComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly employmentTypeService = inject(EmploymentTypesService);
  private readonly employmentStatusesService = inject(EmploymentStatusesService);
  private readonly designationsService = inject(DesignationsService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly nationalitiesService = inject(NationalitiesService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  hireDate = signal<string>('');

  employeesResource = rxResource<IEmployeeResponse, any>({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      hireDate: this.hireDate(),
    }),
    stream: ({ params }) => {
      if (!isPlatformBrowser(this.platformId))
        return of({ data: [], total: 0, page: 1, limit: 10 });
      return this.employeeService.getEmployees({
        page: params.search?.trim() ? 1 : params.page,
        limit: params.search?.trim() ? 1000 : params.limit,
        search: params.search?.trim() ? '' : params.search,
        hireDate: params.search?.trim() ? '' : params.hireDate,
      });
    }
  });

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.hireDate();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  totalItems = computed(() => this.filteredEmployees().total);

  private readonly filteredEmployees = computed(() => {
    const response = this.employeesResource.value();
    const search = this.normalizeSearch(this.searchTerm());
    const hireDate = this.hireDate();
    const page = this.currentPage();
    const limit = this.pageSize();

    const enrichedEmployees = this.enrichEmployees(response?.data ?? []);
    const filteredByHireDate = enrichedEmployees.filter((employee) =>
      this.matchesHireDate(employee.joiningDate, hireDate),
    );

    if (!search) {
      return {
        items: filteredByHireDate,
        total: response?.total ?? filteredByHireDate.length,
      };
    }

    const matchingEmployees = filteredByHireDate.filter((employee) =>
      this.matchesEmployeeSearch(employee, search),
    );
    const startIndex = (page - 1) * limit;

    return {
      items: matchingEmployees.slice(startIndex, startIndex + limit),
      total: matchingEmployees.length,
    };
  });

  employeesList = computed(() => {
    return this.filteredEmployees().items;
  });

  private enrichEmployees(response: IEmployeeResponse['data']) {
    const lang = this.translationService.lang();
    const employmentTypes = this.employmentTypeService.lookupList();
    const employmentStatuses = this.employmentStatusesService.lookupList();
    const designations = this.designationsService.list();
    const departments = this.departmentsService.localizedDepartments();
    const nationalities = this.nationalitiesService.localizedNationalities();

    return response.map(emp => {
      const typeMatch = employmentTypes.find(t => t.id === emp.employmentType);
      const statusMatch = employmentStatuses.find((status) => status.id === emp.employmentStatus);
      const jobTitleMatch = designations.find((designation) => designation.id === emp.jobTitleId);
      const departmentMatch = departments.find((department) => department.id === emp.departmentId);
      const nationalityMatch = nationalities.find((nationality) => nationality.id === emp.nationality);
      const designationName =
        jobTitleMatch?.displayName || emp.designationName || emp.jobTitleEn || emp.jobTitleAr || emp.jobTitleId;
      const departmentName =
        departmentMatch?.displayName || emp.departmentName || emp.departmentNameEn || emp.departmentNameAr || emp.departmentId;
      const nationalityName =
        nationalityMatch?.displayName ||
        emp.nationalityName ||
        emp.nationalityNameEn ||
        emp.nationalityNameAr ||
        emp.nationality;
      const employmentStatusName = statusMatch?.displayName || emp.employmentStatusName || emp.employmentStatus;

      return {
        ...emp,
        displayName: lang === 'ar' ? emp.fullNameAr : (emp.fullNameEn || emp.fullNameAr),
        displayJobTitle: lang === 'ar'
          ? (emp.jobTitleAr || designationName || emp.jobTitleEn || emp.jobTitleId)
          : (emp.jobTitleEn || designationName || emp.jobTitleAr || emp.jobTitleId),
        displayEmploymentType: typeMatch?.displayName || emp.employmentType,
        displayEmploymentStatus: employmentStatusName,
        employmentStatusKey: this.toStatusKey(employmentStatusName),
        searchableDesignationName: designationName,
        searchableDepartmentName: departmentName,
        searchableEmploymentTypeName: typeMatch?.displayName || emp.employmentType || '',
        searchableNationalityName: nationalityName,
        searchableNationalityNameAr: nationalityMatch?.nameAr || emp.nationalityNameAr || '',
        searchableNationalityNameEn: nationalityMatch?.nameEn || emp.nationalityNameEn || '',
      };
    });
  }

  private matchesEmployeeSearch(employee: ReturnType<ViewEmployeesComponent['enrichEmployees']>[number], search: string) {
    return [
      employee.email,
      employee.fullNameAr,
      employee.fullNameEn,
      employee.searchableDesignationName,
      employee.jobTitleAr,
      employee.jobTitleEn,
      employee.jobLevelName,
      employee.jobLevelNameAr,
      employee.jobLevelNameEn,
      employee.searchableDepartmentName,
      employee.departmentNameAr,
      employee.departmentNameEn,
      employee.staffCode,
      employee.phone,
      employee.nationalId,
      employee.searchableEmploymentTypeName,
      employee.displayEmploymentStatus,
      employee.searchableNationalityName,
      employee.searchableNationalityNameAr,
      employee.searchableNationalityNameEn,
    ].some((value) => this.normalizeSearch(value).includes(search));
  }

  private matchesHireDate(employeeHireDate: string | undefined, filterHireDate: string) {
    if (!filterHireDate) {
      return true;
    }

    const employeeDate = new Date(employeeHireDate || '');
    const filterDate = new Date(filterHireDate);

    if (Number.isNaN(employeeDate.getTime()) || Number.isNaN(filterDate.getTime())) {
      return true;
    }

    return employeeDate >= filterDate;
  }

  private normalizeSearch(value: string | undefined | null) {
    return String(value ?? '')
      .toLocaleLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  handleCreateNavigation() {
    this.router.navigate(['/core-hr/employees/add']);
  }

  handleUpload() {
    console.log('Open Upload Dialog');
    // هنا يمكنك استدعاء الـ Modal الخاص بالرفع مستقبلاً
  }

  navigateToEdit(id: string | undefined) {
    if (id) this.router.navigate(['/core-hr/employees/edit', id]);
  }

  navigateToPreview(id: string | undefined) {
    if (id) this.router.navigate(['/core-hr/employees/details', id]);
  }

  handleDelete(id: string | undefined) {
    if (!id) {
      return;
    }

    this.notificationService.show({
      type: 'warning',
      title: 'EMPLOYEES.DELETE_EMPLOYEE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteEmployee(id),
    });
  }

  private deleteEmployee(id: string) {
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.employeesResource.reload();
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

  private toStatusKey(value: string): string {
    return value
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

}
