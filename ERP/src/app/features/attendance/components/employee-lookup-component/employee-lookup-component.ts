import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { StaffService } from '@features/core-hr/services/staff-service';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, map, of, startWith } from 'rxjs';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { IStaffApiItem } from '@features/core-hr/models/istaff';

export interface IAttendanceEmployeeLookupItem {
  id: string;
  displayName: string;
  staffCode: string;
  email: string;
  departmentId: string;
  designationId: string;
  attendanceShiftId: string;
  nationalityCode: string;
  nationalId: string;
  phone: string;
  mobileNumber: string;
}

@Component({
  selector: 'app-attendance-employee-lookup-component',
  imports: [ReactiveFormsModule, TranslocoModule, AppInputComponent],
  templateUrl: './employee-lookup-component.html',
  styleUrl: './employee-lookup-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceEmployeeLookupComponent {
  private readonly staffService = inject(StaffService);

  label = input<string>('ATTENDANCE.EMPLOYEE_NAME');
  placeholder = input<string>('ATTENDANCE.EMPLOYEE_SEARCH_PLACEHOLDER');
  resetKey = input(0);
  selectedEmployee = model<IAttendanceEmployeeLookupItem | null>(null);
  isDropdownOpen = signal(false);

  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchValue = toSignal(
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
  );

  staffResource = rxResource({
    stream: () => this.staffService.getStaff({ skipCount: 0, maxResultCount: 1000, filter: '' }).pipe(
      map(response => response.items
        .filter((staff): staff is IStaffApiItem & { id: string } => Boolean(staff.id))
        .map(staff => this.toEmployeeLookupItem(staff))),
      catchError(() => of([])),
    ),
  });

  employeeSearchResults = computed(() => {
    if (!this.isDropdownOpen()) {
      return [];
    }

    const search = this.normalizeSearchText(this.searchValue());

    if (!search) {
      return [];
    }

    return (this.staffResource.value() ?? [])
      .filter(employee => this.matchesEmployeeSearch(employee, search))
      .slice(0, 8);
  });

  constructor() {
    effect(() => {
      this.resetKey();
      this.isDropdownOpen.set(false);
      if (this.searchControl.value) {
        this.searchControl.setValue('', { emitEvent: false });
      }
      this.selectedEmployee.set(null);
    });

    effect(() => {
      const search = this.searchValue();
      if (this.normalizeSearchText(search)) {
        this.isDropdownOpen.set(true);
      }
    });
  }

  selectEmployee(employee: IAttendanceEmployeeLookupItem) {
    this.selectedEmployee.set(employee);
    this.searchControl.setValue(employee.displayName, { emitEvent: false });
    this.isDropdownOpen.set(false);
  }

  openDropdown() {
    this.isDropdownOpen.set(true);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  handleSearchInput() {
    this.isDropdownOpen.set(true);
    this.selectedEmployee.set(null);
  }

  private toEmployeeLookupItem(staff: IStaffApiItem): IAttendanceEmployeeLookupItem {
    return {
      id: staff.id,
      displayName: this.getStaffDisplayName(staff),
      staffCode: staff.staffCode?.trim() ?? '',
      email: staff.email?.trim() ?? '',
      departmentId: staff.departmentId?.trim() ?? '',
      designationId: staff.designationId?.trim() ?? '',
      attendanceShiftId: staff.attendanceShiftId?.trim() ?? '',
      nationalityCode: staff.nationalityCode?.trim() ?? '',
      nationalId: staff.nationalId?.trim() ?? '',
      phone: staff.phone?.trim() ?? '',
      mobileNumber: staff.mobileNumber?.trim() ?? '',
    };
  }

  private matchesEmployeeSearch(employee: IAttendanceEmployeeLookupItem, search: string) {
    return [
      employee.displayName,
      employee.staffCode,
      employee.email,
      employee.departmentId,
      employee.designationId,
      employee.attendanceShiftId,
      employee.nationalityCode,
      employee.nationalId,
      employee.phone,
      employee.mobileNumber,
    ].some(value => this.normalizeSearchText(value).includes(search));
  }

  private normalizeSearchText(value?: string | null) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه');
  }

  isSelected(employee: IAttendanceEmployeeLookupItem) {
    return this.selectedEmployee()?.id === employee.id;
  }

  private getStaffDisplayName(staff: IStaffApiItem) {
    const composedName = [staff.firstName, staff.middleName, staff.lastName]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' ');

    return staff.fullNameAr?.trim()
      || staff.fullName?.trim()
      || staff.fullNameEn?.trim()
      || composedName
      || staff.staffCode?.trim()
      || staff.id;
  }
}
