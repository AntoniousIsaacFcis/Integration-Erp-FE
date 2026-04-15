import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslationService } from '@core/services/translation-service';
import { IEmployeeForm } from '@features/core-hr/models/iemployee';
import { DesignationsService } from '@features/organization/services/designations-service';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcaseBusiness, lucideCalendar, lucideCreditCard, lucideFingerprint, lucideGlobe, lucideHeart, lucideMail, lucidePersonStanding, lucidePhone, lucideUser, lucideVenusAndMars } from '@ng-icons/lucide';
import { NationalitiesService } from '@core/services/nationalities-service';

@Component({
  selector: 'app-employee-info-sidebar-component',
  imports: [NgOptimizedImage, TranslocoModule,NgIcon],
  templateUrl: './employee-info-sidebar-component.html',
  styleUrl: './employee-info-sidebar-component.css',
  providers:[provideIcons({lucideBriefcaseBusiness,lucidePhone,lucideMail,lucideCreditCard,lucideGlobe,lucideCalendar,lucideHeart,lucidePersonStanding,lucideFingerprint})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeInfoSidebarComponent {
  private readonly nationalitiesService = inject(NationalitiesService);
  private readonly employmentTypesService = inject(EmploymentTypesService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly designationsService = inject(DesignationsService);
  private readonly translationService = inject(TranslationService);

  emp = input.required<IEmployeeForm>();

  private readonly nationalitiesMap = computed(
    () => new Map(this.nationalitiesService.localizedNationalities().map((item) => [item.id, item.displayName])),
  );

  private readonly employmentTypesMap = computed(
    () => new Map(this.employmentTypesService.lookupList().map((item) => [item.id, item.displayName])),
  );

  private readonly departmentsMap = computed(
    () => new Map(this.departmentsService.localizedDepartments().map((item) => [item.id, item.displayName])),
  );

  private readonly designationsMap = computed(
    () => new Map(this.designationsService.list().map((item) => [item.id, item.displayName])),
  );

  displayJobTitle = computed(() => {
    const employee = this.emp();
    const lang = this.translationService.lang();
    const fallbackLabel = lang === 'ar' ? employee.jobTitleAr : employee.jobTitleEn;

    return (
      this.designationsMap().get(employee.jobTitleId) ||
      fallbackLabel ||
      employee.jobTitleAr ||
      employee.jobTitleEn ||
      employee.jobTitleId
    );
  });

//make the personal data as array to dispaly into html
  personalFields = computed(() => {
    const e = this.emp();
    if (!e) return [];
    return [
      { label: 'EMPLOYEES.TABLE.EMPLOYEE_ID', value: e.staffCode || e.id, icon: 'lucideBriefcaseBusiness' },
      { label: 'EMPLOYEES.PERSONAL.PHONE', value: e.phone, icon: 'lucidePhone' },
      { label: 'EMPLOYEES.PERSONAL.EMAIL', value: e.email, icon: 'lucideMail' },
      { label: 'EMPLOYEES.PERSONAL.NATIONAL_ID', value: e.nationalId, icon: 'lucideCreditCard' },
      {
        label: 'EMPLOYEES.PERSONAL.NATIONALITY',
        value: this.nationalitiesMap().get(e.nationality) || e.nationality,
        icon: 'lucideGlobe',
      },
      {
        label: 'EMPLOYEES.DEPARTMENT',
        value: this.departmentsMap().get(e.departmentId) || e.departmentId,
        icon: 'lucideBriefcaseBusiness',
      },
      {
        label: 'EMPLOYEES.EMPLOYMENT_TYPE',
        value: this.employmentTypesMap().get(e.employmentType) || e.employmentType,
        icon: 'lucideBriefcaseBusiness',
      },
      { label: 'EMPLOYEES.PERSONAL.JOINING_DATE', value: e.joiningDate, icon: 'lucideCalendar' },
    ];
  });

  extraFields = computed(() => {
    const e = this.emp();
    if (!e) return [];
    return [
      { label: 'EMPLOYEES.PERSONAL.BIRTH_DATE', value: e.birthDate, icon: 'lucideCalendar' },
      { label: 'EMPLOYEES.PERSONAL.FINGER_PRINT', value: e.fingerPrintNumber, icon: 'lucideFingerprint' },
      { label: 'EMPLOYEES.PERSONAL.MARITAL_STATUS', value: this.formatOptionLabel(e.maritalStatus), icon: 'lucideHeart' },
      { label: 'EMPLOYEES.PERSONAL.GENDER', value: this.formatOptionLabel(e.gender), icon: 'lucidePersonStanding' }
    ];
  });

  private formatOptionLabel(value?: string): string {
    if (!value) {
      return '';
    }

    return value
      .split(/[_-]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}


