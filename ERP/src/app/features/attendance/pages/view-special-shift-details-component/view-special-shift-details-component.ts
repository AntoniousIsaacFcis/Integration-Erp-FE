import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { IShiftAssignment } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { DesignationsService } from '@features/organization/services/designations-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';

type AssignmentMethod = 'rules' | 'manual';

@Component({
  selector: 'app-view-special-shift-details-component',
  imports: [
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppDateInputComponent,
    AppSelectComponent,
    FormSaveButtonComponent,
    ReactiveFormsModule,
    TranslocoModule,
    NgIcon,
  ],
  templateUrl: './view-special-shift-details-component.html',
  styleUrl: './view-special-shift-details-component.css',
  providers: [provideIcons({ lucideSearch })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSpecialShiftDetailsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly designationsService = inject(DesignationsService);
  private readonly staffService = inject(StaffService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly assignmentId = this.route.snapshot.paramMap.get('id') ?? '';

  isLoading = signal(true);

  mainForm = this.fb.nonNullable.group({
    name: [{ value: '', disabled: true }],
    startDate: [{ value: '', disabled: true }],
    assignedShiftId: [{ value: '', disabled: true }],
    status: [{ value: 'active' as 'active' | 'inactive', disabled: true }],
    assignmentMethod: [{ value: 'rules' as AssignmentMethod, disabled: true }],
    departmentId: [{ value: '', disabled: true }],
    designationId: [{ value: '', disabled: true }],
    currentShiftId: [{ value: '', disabled: true }],
  });

  private readonly assignmentMethodValue = toSignal(
    this.mainForm.controls.assignmentMethod.valueChanges.pipe(
      startWith(this.mainForm.controls.assignmentMethod.value),
    ),
  );

  isRuleSelection = computed(() => this.assignmentMethodValue() === 'rules');
  isManualSelection = computed(() => this.assignmentMethodValue() === 'manual');

  selectedEmployeeIds = signal<string[]>([]);
  excludedEmployeeIds = signal<string[]>([]);

  shiftOptionsResource = rxResource({
    stream: () => this.attendanceService.getShiftOptions().pipe(catchError(() => of([]))),
  });

  staffResource = rxResource({
    stream: () => this.staffService.getStaff({ skipCount: 0, maxResultCount: 1000, filter: '' }).pipe(
      map(response =>
        response.items.filter((staff): staff is IStaffApiItem & { id: string } => Boolean(staff.id)),
      ),
      catchError(() => of([])),
    ),
  });

  departmentOptions = this.departmentsService.lookupList;
  designationOptions = this.designationsService.lookupList;
  shiftOptions = computed(() => this.shiftOptionsResource.value() ?? []);
  staffOptions = computed(() =>
    (this.staffResource.value() ?? []).map(staff => ({
      id: staff.id,
      displayName: this.getStaffDisplayName(staff),
      staffCode: staff.staffCode ?? '',
    })),
  );

  selectedEmployees = computed(() => this.toSelectedStaff(this.selectedEmployeeIds()));
  excludedEmployees = computed(() => this.toSelectedStaff(this.excludedEmployeeIds()));

  constructor() {
    this.loadShiftAssignment();
  }

  onCancel() {
    this.router.navigate(['/attendance/special']);
  }

  private loadShiftAssignment() {
    if (!this.assignmentId) {
      this.onCancel();
      return;
    }

    this.attendanceService.getShiftAssignmentById(this.assignmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: assignment => {
          this.patchForm(assignment);
          this.breadcrumbService.setCurrentBreadcrumbLabel(assignment.name, this.route);
          this.isLoading.set(false);
        },
        error: () => this.onCancel(),
      });
  }

  private patchForm(assignment: IShiftAssignment) {
    const criteriaType = Number(assignment.criteriaType) === 2 ? 2 : 1;

    this.mainForm.patchValue({
      name: assignment.name ?? '',
      startDate: this.toDateInputValue(assignment.startDate),
      assignedShiftId: assignment.assignedShiftId ?? '',
      status: assignment.isActive === false ? 'inactive' : 'active',
      assignmentMethod: criteriaType === 2 ? 'manual' : 'rules',
      departmentId: assignment.departmentId ?? '',
      designationId: assignment.designationId ?? '',
      currentShiftId: assignment.currentShiftId ?? '',
    });

    this.selectedEmployeeIds.set(assignment.employeeIds ?? []);
    this.excludedEmployeeIds.set(assignment.excludedEmployeeIds ?? []);
  }

  private toDateInputValue(value?: string | null) {
    return value ? value.slice(0, 10) : '';
  }

  private toSelectedStaff(ids: string[]) {
    const staffMap = new Map(this.staffOptions().map(staff => [staff.id, staff]));

    return ids.map(id => staffMap.get(id) ?? { id, displayName: id, staffCode: '' });
  }

  private getStaffDisplayName(staff: IStaffApiItem) {
    const composedName = [staff.firstName, staff.middleName, staff.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ')
      .trim();

    return staff.fullNameAr?.trim()
      || staff.fullName?.trim()
      || staff.fullNameEn?.trim()
      || composedName
      || staff.staffCode?.trim()
      || staff.id;
  }
}
