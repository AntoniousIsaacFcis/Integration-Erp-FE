import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IEmployeeForm } from '@features/core-hr/models/iemployee';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcaseBusiness, lucideCalendar, lucideCreditCard, lucideFingerprint, lucideGlobe, lucideHeart, lucideMail, lucidePersonStanding, lucidePhone, lucideUser, lucideVenusAndMars } from '@ng-icons/lucide';

@Component({
  selector: 'app-employee-info-sidebar-component',
  imports: [NgOptimizedImage, TranslocoModule,NgIcon],
  templateUrl: './employee-info-sidebar-component.html',
  styleUrl: './employee-info-sidebar-component.css',
  providers:[provideIcons({lucideBriefcaseBusiness,lucidePhone,lucideMail,lucideCreditCard,lucideGlobe,lucideCalendar,lucideHeart,lucidePersonStanding,lucideFingerprint})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeInfoSidebarComponent {
emp = input.required<IEmployeeForm>();

//make the personal data as array to dispaly into html
personalFields = computed(() => {
    const e = this.emp();
    if (!e) return [];
    return [
      { label: 'EMPLOYEES.TABLE.EMPLOYEE_ID', value: e.id, icon: 'lucideBriefcaseBusiness' },
      { label: 'EMPLOYEES.PERSONAL.PHONE', value: e.phone, icon: 'lucidePhone' },
      { label: 'EMPLOYEES.PERSONAL.EMAIL', value: e.email, icon: 'lucideMail' },
      { label: 'EMPLOYEES.PERSONAL.NATIONAL_ID', value: e.nationalId, icon: 'lucideCreditCard' },
      { label: 'EMPLOYEES.PERSONAL.NATIONALITY', value: e.nationality, icon: 'lucideGlobe' },
      { label: 'EMPLOYEES.PERSONAL.JOINING_DATE', value: e.joiningDate, icon: 'lucideCalendar' },
    ];
  });

  extraFields = computed(() => {
    const e = this.emp();
    if (!e) return [];
    return [
      { label: 'EMPLOYEES.PERSONAL.BIRTH_DATE', value: e.birthDate, icon: 'lucideCalendar' },
      { label: 'EMPLOYEES.PERSONAL.FINGER_PRINT', value: e.fingerPrintNumber, icon: 'lucideFingerprint' },
      { label: 'EMPLOYEES.PERSONAL.MARITAL_STATUS', value: e.maritalStatus, icon: 'lucideHeart' },
      { label: 'EMPLOYEES.PERSONAL.GENDER', value: e.gender, icon: 'lucidePersonStanding' }
    ];
  });
}


