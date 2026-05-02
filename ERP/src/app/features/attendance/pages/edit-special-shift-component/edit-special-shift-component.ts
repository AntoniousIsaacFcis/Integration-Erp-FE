import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { IShiftAssignment, IShiftAssignmentPayload } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { DesignationsService } from '@features/organization/services/designations-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';

type AssignmentMethod = 'rules' | 'manual';

@Component({
  selector: 'app-edit-special-shift-component',
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
    FormCancelButtonComponent,
  ],
  templateUrl: './edit-special-shift-component.html',
  styleUrl: './edit-special-shift-component.css',
  providers: [
    provideIcons({ lucideSearch, lucideX }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSpecialShiftComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly designationsService = inject(DesignationsService);
  private readonly staffService = inject(StaffService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly assignmentId = this.route.snapshot.paramMap.get('id') ?? '';

  submitted = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  employeeSelectionError = signal(false);

  mainForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    assignedShiftId: ['', [Validators.required]],
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    priority: [100, [Validators.required]],
    assignmentMethod: ['rules' as AssignmentMethod, [Validators.required]],
    departmentId: [''],
    designationId: [''],
    currentShiftId: [''],
  }, {
    validators: [dateRangeValidator('startDate', 'endDate')],
  });

  employeeSearchControl = new FormControl('', { nonNullable: true });
  excludedEmployeeSearchControl = new FormControl('', { nonNullable: true });

  private readonly assignmentMethodValue = toSignal(
    this.mainForm.controls.assignmentMethod.valueChanges.pipe(startWith(this.mainForm.controls.assignmentMethod.value)),
  );
  private readonly employeeSearchValue = toSignal(
    this.employeeSearchControl.valueChanges.pipe(startWith(this.employeeSearchControl.value)),
  );
  private readonly excludedEmployeeSearchValue = toSignal(
    this.excludedEmployeeSearchControl.valueChanges.pipe(startWith(this.excludedEmployeeSearchControl.value)),
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
      map(response => response.items.filter((staff): staff is IStaffApiItem & { id: string } => Boolean(staff.id))),
      catchError(() => of([])),
    ),
  });

  departmentOptions = this.departmentsService.lookupList;
  designationOptions = this.designationsService.lookupList;
  shiftOptions = computed(() => this.shiftOptionsResource.value() ?? []);
  staffOptions = computed(() => (this.staffResource.value() ?? []).map(staff => ({
    id: staff.id,
    displayName: this.getStaffDisplayName(staff),
    staffCode: staff.staffCode ?? '',
  })));

  selectedEmployees = computed(() => this.toSelectedStaff(this.selectedEmployeeIds()));
  excludedEmployees = computed(() => this.toSelectedStaff(this.excludedEmployeeIds()));

  employeeSearchResults = computed(() =>
    this.filterStaff(this.employeeSearchValue(), this.selectedEmployeeIds()));
  excludedEmployeeSearchResults = computed(() =>
    this.filterStaff(this.excludedEmployeeSearchValue(), this.excludedEmployeeIds()));

  constructor() {
    this.loadShiftAssignment();
  }

  onSave() {
    if (this.isLoading() || this.isSaving()) {
      return;
    }

    this.submitted.set(true);
    this.employeeSelectionError.set(this.isManualSelection() && this.selectedEmployeeIds().length === 0);

    if (this.mainForm.invalid || this.employeeSelectionError()) {
      this.mainForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.attendanceService.updateShiftAssignment(this.assignmentId, this.toPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.show({
            type: 'success',
            title: 'COMMON.MESSAGES.UPDATED_SUCCESSFULLY',
            actionLabel: 'COMMON.OK',
          });
          this.router.navigate(['/attendance/special']);
        },
        error: () => {
          this.isSaving.set(false);
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  getControl(name: keyof typeof this.mainForm.controls): FormControl {
    return this.mainForm.controls[name] as FormControl;
  }

  addEmployee(id: string) {
    this.selectedEmployeeIds.update(ids => Array.from(new Set([...ids, id])));
    this.employeeSearchControl.setValue('');
    this.employeeSelectionError.set(false);
  }

  removeEmployee(id: string) {
    this.selectedEmployeeIds.update(ids => ids.filter(item => item !== id));
  }

  addExcludedEmployee(id: string) {
    this.excludedEmployeeIds.update(ids => Array.from(new Set([...ids, id])));
    this.excludedEmployeeSearchControl.setValue('');
  }

  removeExcludedEmployee(id: string) {
    this.excludedEmployeeIds.update(ids => ids.filter(item => item !== id));
  }

  onCancel() {
    this.router.navigate(['/attendance/special']);
  }

  private loadShiftAssignment() {
    if (!this.assignmentId) {
      this.router.navigate(['/attendance/special']);
      return;
    }

    this.attendanceService.getShiftAssignmentById(this.assignmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: assignment => {
          this.patchForm(assignment);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
          this.router.navigate(['/attendance/special']);
        },
      });
  }

  private patchForm(assignment: IShiftAssignment) {
    const criteriaType = Number(assignment.criteriaType) === 2 ? 2 : 1;

    this.mainForm.patchValue({
      name: assignment.name ?? '',
      startDate: this.toDateInputValue(assignment.startDate),
      endDate: this.toDateInputValue(assignment.endDate),
      assignedShiftId: assignment.assignedShiftId ?? '',
      status: assignment.isActive === false ? 'inactive' : 'active',
      priority: Number(assignment.priority ?? 100),
      assignmentMethod: criteriaType === 2 ? 'manual' : 'rules',
      departmentId: assignment.departmentId ?? '',
      designationId: assignment.designationId ?? '',
      currentShiftId: assignment.currentShiftId ?? '',
    });

    this.selectedEmployeeIds.set(assignment.employeeIds ?? []);
    this.excludedEmployeeIds.set(assignment.excludedEmployeeIds ?? []);
  }

  private toPayload(): IShiftAssignmentPayload {
    const value = this.mainForm.getRawValue();
    const criteriaType = value.assignmentMethod === 'rules' ? 1 : 2;

    return {
      name: value.name.trim(),
      assignedShiftId: value.assignedShiftId,
      startDate: this.toDateTime(value.startDate),
      endDate: this.toDateTime(value.endDate),
      isActive: value.status === 'active',
      criteriaType,
      priority: Number(value.priority),
      departmentId: criteriaType === 1 ? this.toNullableId(value.departmentId) : null,
      designationId: criteriaType === 1 ? this.toNullableId(value.designationId) : null,
      currentShiftId: criteriaType === 1 ? this.toNullableId(value.currentShiftId) : null,
      employeeIds: criteriaType === 2 ? this.selectedEmployeeIds() : [],
      excludedEmployeeIds: criteriaType === 1 ? this.excludedEmployeeIds() : [],
    };
  }

  private toNullableId(value: string) {
    return value || null;
  }

  private toDateInputValue(value?: string | null) {
    return value ? value.slice(0, 10) : '';
  }

  private toDateTime(value: string) {
    return value.includes('T') ? value : `${value}T00:00:00`;
  }

  private filterStaff(search: string | undefined, excludedIds: string[]) {
    const query = (search ?? '').trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.staffOptions()
      .filter(staff =>
        !excludedIds.includes(staff.id) &&
        `${staff.displayName} ${staff.staffCode}`.toLowerCase().includes(query))
      .slice(0, 8);
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

    return staff.fullNameAr?.trim() ||
      staff.fullName?.trim() ||
      staff.fullNameEn?.trim() ||
      composedName ||
      staff.staffCode?.trim() ||
      staff.id;
  }
}
