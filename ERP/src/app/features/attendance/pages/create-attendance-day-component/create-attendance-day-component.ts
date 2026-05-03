import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { IAttendanceRelatedShift, ICreateAttendanceDayPayload } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { IStaffApiItem } from '@features/core-hr/models/istaff';
import { StaffService } from '@features/core-hr/services/staff-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { timeRangeValidator } from '@shared/validators/time-range.validator';
import { catchError, map, of, startWith } from 'rxjs';

type AttendanceStatusValue = 'present' | 'absent' | 'onLeave';
type EmployeeOption = {
  id: string;
  displayName: string;
  staffCode: string;
  departmentId: string | null;
  designationId: string | null;
  attendanceShiftId: string | null;
};

@Component({
  selector: 'app-create-attendance-day-component',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FormContainerComponent,
    AppInputComponent,
    AppSelectComponent,
    AppRadioComponent,
    AppDateInputComponent,
    TimeInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
  ],
  templateUrl: './create-attendance-day-component.html',
  styleUrl: './create-attendance-day-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAttendanceDayComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly staffService = inject(StaffService);
  private readonly notification = inject(NotificationService);

  private readonly today = new Date().toISOString().slice(0, 10);

  submitted = signal(false);
  isSaving = signal(false);

  attendanceForm = this.fb.nonNullable.group({
    employeeId: ['', [Validators.required]],
    date: [this.today, [Validators.required]],
    shiftId: [''],
    shiftName: [''],
    status: ['present' as AttendanceStatusValue, [Validators.required]],
    leaveTypeId: [''],
    onDutyTime: [''],
    offDutyTime: [''],
    signInTime: [''],
    signOutTime: [''],
    notes: [''],
  }, {
    validators: [
      timeRangeValidator('onDutyTime', 'offDutyTime'),
      timeRangeValidator('signInTime', 'signOutTime'),
    ],
  });

  statusOptions = [
    { label: 'ATTENDANCE.PRESENT', value: 'present' },
    { label: 'ATTENDANCE.ABSENT', value: 'absent' },
    { label: 'ATTENDANCE.ON_LEAVE', value: 'onLeave' },
  ];

  employeeSearchControl = new FormControl('', { nonNullable: true });

  private readonly statusValue = toSignal(
    this.attendanceForm.controls.status.valueChanges.pipe(startWith(this.attendanceForm.controls.status.value)),
  );
  private readonly dateValue = toSignal(
    this.attendanceForm.controls.date.valueChanges.pipe(startWith(this.attendanceForm.controls.date.value)),
  );
  readonly employeeSearchValue = toSignal(
    this.employeeSearchControl.valueChanges.pipe(startWith(this.employeeSearchControl.value)),
  );

  isPresent = computed(() => this.statusValue() === 'present');
  isLeave = computed(() => this.statusValue() === 'onLeave');

  staffResource = rxResource({
    stream: () => this.staffService.getStaff({ skipCount: 0, maxResultCount: 1000, filter: '' }).pipe(
      map(response => response.items.filter((staff): staff is IStaffApiItem & { id: string } => Boolean(staff.id))),
      catchError(() => of([])),
    ),
  });

  leaveTypesResource = rxResource({
    stream: () => this.attendanceService.getLeaveTypes().pipe(catchError(() => of([]))),
  });

  shiftOptionsResource = rxResource({
    stream: () => this.attendanceService.getShiftOptions().pipe(catchError(() => of([]))),
  });

  staffOptions = computed(() => (this.staffResource.value() ?? []).map(staff => ({
    id: staff.id,
    displayName: this.getStaffDisplayName(staff),
    staffCode: staff.staffCode?.trim() ?? '',
    departmentId: staff.departmentId ?? null,
    designationId: staff.designationId ?? null,
    attendanceShiftId: staff.attendanceShiftId ?? null,
  })));
  selectedEmployee = signal<EmployeeOption | null>(null);
  employeeSearchResults = computed(() => {
    const search = this.normalizeSearchText(this.employeeSearchValue());

    if (!search || this.selectedEmployee()?.displayName === this.employeeSearchValue()) {
      return [];
    }

    return this.staffOptions()
      .filter(employee => this.matchesEmployeeSearch(employee, search))
      .slice(0, 6);
  });

  relatedShiftResource = rxResource({
    params: () => {
      const employee = this.selectedEmployee();
      const employeeId = employee?.id ?? '';
      const date = this.dateValue() ?? this.today;

      return employeeId && date && employee ? { employeeId, date, employee } : null;
    },
    stream: ({ params }) => params
      ? this.attendanceService.getRelatedAttendanceShift(params.employeeId, params.date).pipe(catchError(() => of(null)))
      : of(null),
  });
  resolvedShift = computed(() => this.relatedShiftResource.value() ?? null);
  hasResolvedShift = computed(() => Boolean(this.resolvedShift()));
  showShiftSelector = computed(() => Boolean(this.selectedEmployee()) && !this.relatedShiftResource.isLoading() && !this.hasResolvedShift());
  shiftOptions = computed(() => this.shiftOptionsResource.value() ?? []);
  leaveTypeOptions = computed(() => this.leaveTypesResource.value() ?? []);

  constructor() {
    effect(() => {
      this.configureConditionalValidators(this.statusValue() ?? 'present');
    });

    effect(() => {
      this.patchResolvedShift(this.resolvedShift());
    });

    effect(() => {
      const selected = this.selectedEmployee();
      const search = this.employeeSearchValue() ?? '';

      if (selected && search !== selected.displayName) {
        this.selectedEmployee.set(null);
        this.attendanceForm.controls.employeeId.setValue('');
      }
    });
  }

  onSave() {
    if (this.isSaving()) {
      return;
    }

    this.submitted.set(true);

    if (this.isPresent() && (!this.attendanceForm.controls.onDutyTime.value || !this.attendanceForm.controls.offDutyTime.value)) {
      this.notification.show({
        type: 'error',
        title: 'COMMON.MESSAGES.OPERATION_FAILED',
        message: 'ATTENDANCE.NO_RELATED_SHIFT',
        isModal: false,
        actionLabel: 'COMMON.CONFIRM',
      });
      return;
    }

    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.attendanceService.createAttendanceDay(this.toPayload()).subscribe({
      next: () => {
        this.notification.show({
          type: 'success',
          title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
          actionLabel: 'COMMON.OK',
        });
        this.router.navigate(['/attendance/view-attendance-days']);
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

  onCancel() {
    this.router.navigate(['/attendance/view-attendance-days']);
  }

  getControl(name: keyof typeof this.attendanceForm.controls): FormControl {
    return this.attendanceForm.controls[name] as FormControl;
  }

  selectEmployee(employee: EmployeeOption) {
    this.clearShiftFields();
    this.selectedEmployee.set(employee);
    this.attendanceForm.controls.employeeId.setValue(employee.id);
    this.employeeSearchControl.setValue(employee.displayName);
  }

  private clearShiftFields() {
    this.attendanceForm.patchValue({
      shiftId: '',
      shiftName: '',
      onDutyTime: '',
      offDutyTime: '',
    }, { emitEvent: false });
  }

  private configureConditionalValidators(status: AttendanceStatusValue) {
    const timeControls = [
      this.attendanceForm.controls.onDutyTime,
      this.attendanceForm.controls.offDutyTime,
      this.attendanceForm.controls.signInTime,
      this.attendanceForm.controls.signOutTime,
    ];

    for (const control of timeControls) {
      control.setValidators(status === 'present' ? Validators.required : null);
      control.updateValueAndValidity({ emitEvent: false });
    }

    this.attendanceForm.controls.leaveTypeId.setValidators(status === 'onLeave' ? Validators.required : null);
    this.attendanceForm.controls.leaveTypeId.updateValueAndValidity({ emitEvent: false });
    this.attendanceForm.updateValueAndValidity({ emitEvent: false });
  }

  private toPayload(): ICreateAttendanceDayPayload {
    const value = this.attendanceForm.getRawValue();
    const isPresent = value.status === 'present';

    return {
      employeeId: value.employeeId,
      shiftId: value.shiftId || null,
      date: `${value.date}T00:00:00`,
      status: this.toStatusNumber(value.status),
      dayOffReason: this.toDayOffReason(value.status),
      onDutyTime: isPresent ? this.toDateTime(value.date, value.onDutyTime) : null,
      offDutyTime: isPresent ? this.toDateTime(value.date, value.offDutyTime) : null,
      signInTime: isPresent ? this.toDateTime(value.date, value.signInTime) : null,
      signOutTime: isPresent ? this.toDateTime(value.date, value.signOutTime) : null,
      calculationType: 2,
      workedMinutes: null,
      delayMinutes: 0,
      earlyLeaveMinutes: 0,
      leaveTypeId: value.status === 'onLeave' ? value.leaveTypeId || null : null,
      leaveCount: value.status === 'onLeave' ? 1 : 0,
      notes: value.notes?.trim() || null,
      attendanceSheetId: null,
      attendancePermissionId: null,
    };
  }

  private patchResolvedShift(shift: IAttendanceRelatedShift | null) {
    if (!shift) {
      this.clearShiftFields();
      return;
    }

    this.attendanceForm.patchValue({
      shiftId: shift.id,
      shiftName: shift.name,
      onDutyTime: this.toTimeInputValue(shift.onDutyTime),
      offDutyTime: this.toTimeInputValue(shift.offDutyTime),
    }, { emitEvent: false });
  }

  private toTimeInputValue(value?: string | null) {
    if (!value) {
      return '';
    }

    const timePart = value.includes('T') ? value.slice(11) : value;
    return timePart.slice(0, 5);
  }

  private toDateTime(date: string, time: string) {
    return `${date}T${time.length === 5 ? `${time}:00` : time}`;
  }

  private toStatusNumber(status: AttendanceStatusValue) {
    const statusMap: Record<AttendanceStatusValue, number> = {
      present: 1,
      absent: 2,
      onLeave: 3,
    };

    return statusMap[status];
  }

  private toDayOffReason(_status: AttendanceStatusValue) {
    return null;
  }

  private getStaffDisplayName(staff: IStaffApiItem) {
    const composedName = [staff.firstName, staff.middleName, staff.lastName]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' ');

    const displayName = staff.fullNameAr?.trim()
      || staff.fullName?.trim()
      || composedName
      || staff.staffCode?.trim()
      || staff.id;
    const code = staff.staffCode?.trim();

    return code ? `${displayName} #${code}` : displayName;
  }

  private matchesEmployeeSearch(employee: { displayName: string; staffCode: string }, search: string) {
    return [
      employee.displayName,
      employee.staffCode,
    ].some(value => this.normalizeSearchText(value).includes(search));
  }

  private normalizeSearchText(value?: string | null) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه');
  }
}
