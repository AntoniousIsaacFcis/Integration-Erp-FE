import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { catchError, map, of, startWith } from 'rxjs';

type AttendanceStatusValue = 'present' | 'absent' | 'onLeave';

@Component({
  selector: 'app-details-attendance-day-component',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppDateInputComponent,
    AppSelectComponent,
    TimeInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
  ],
  templateUrl: './details-attendance-day-component.html',
  styleUrl: './details-attendance-day-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsAttendanceDayComponent {
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  attendanceId = signal(this.route.snapshot.params['id']);

  detailsForm = this.fb.nonNullable.group({
    employeeName: [{ value: '', disabled: true }],
    date: [{ value: '', disabled: true }],
    status: [{ value: 'present' as AttendanceStatusValue, disabled: true }],
    leaveTypeId: [{ value: '', disabled: true }],
    shiftStart: [{ value: '', disabled: true }],
    shiftEnd: [{ value: '', disabled: true }],
    checkIn: [{ value: '', disabled: true }],
    checkOut: [{ value: '', disabled: true }],
    notes: [{ value: '', disabled: true }],
  });

  statusOptions = [
    { label: 'ATTENDANCE.PRESENT', value: 'present' },
    { label: 'ATTENDANCE.ABSENT', value: 'absent' },
    { label: 'ATTENDANCE.ON_LEAVE', value: 'onLeave' },
  ];

  private readonly statusValue = toSignal(
    this.detailsForm.controls.status.valueChanges.pipe(startWith(this.detailsForm.controls.status.value)),
  );

  isPresent = computed(() => this.statusValue() === 'present');
  isLeave = computed(() => this.statusValue() === 'onLeave');

  leaveTypesResource = rxResource({
    stream: () => this.attendanceService.getLeaveTypes().pipe(
      map(response => response ?? []),
      catchError(() => of([])),
    ),
  });

  leaveTypeOptions = computed(() => this.leaveTypesResource.value() ?? []);

  detailsResource = rxResource({
    params: () => ({ id: this.attendanceId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceById(params.id),
  });

  isFormReady = signal(false);

  constructor() {
    effect(() => {
      const data = this.detailsResource.value();
      if (!data) {
        return;
      }

      this.detailsForm.patchValue({
        employeeName: data.employeeName,
        date: data.date,
        status: data.status,
        leaveTypeId: data.leaveTypeId ?? '',
        shiftStart: data.shiftStart ?? '',
        shiftEnd: data.shiftEnd ?? '',
        checkIn: data.checkIn ?? '',
        checkOut: data.checkOut ?? '',
        notes: data.notes ?? '',
      });

      this.breadcrumbService.setCurrentBreadcrumbLabel(
        this.toBreadcrumbLabel(data.employeeName, data.date),
        this.route,
      );
      this.isFormReady.set(true);
    });
  }

  getControl(name: keyof typeof this.detailsForm.controls): FormControl {
    return this.detailsForm.controls[name] as FormControl;
  }

  onBack() {
    this.router.navigate(['/attendance/view-attendance-days']);
  }

  private toBreadcrumbLabel(employeeName: string, dateValue?: string) {
    const dateLabel = this.formatDateForBreadcrumb(dateValue);

    return dateLabel
      ? `${employeeName} - ${dateLabel}`
      : employeeName;
  }

  private formatDateForBreadcrumb(value?: string) {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'dd-MMM-yyyy', undefined, 'en-US') || '';
  }
}
