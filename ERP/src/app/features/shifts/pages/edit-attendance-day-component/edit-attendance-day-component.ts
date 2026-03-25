import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IUpdateAttendancePayload } from '@features/shifts/models/iattendance';
import { AttendanceService } from '@features/shifts/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { timeRangeValidator } from '@shared/validators/time-range.validator';
import { of } from 'rxjs';
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";

@Component({
  selector: 'app-edit-attendance-day-component',
  imports: [ReactiveFormsModule, TranslocoModule, FormContainerComponent,
    AppInputComponent, AppSelectComponent, TimeInputComponent,
    FormSaveButtonComponent, FormCancelButtonComponent, AppDateInputComponent],
  templateUrl: './edit-attendance-day-component.html',
  styleUrl: './edit-attendance-day-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAttendanceDayComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);

  attendanceId = signal(this.route.snapshot.params['id']);
  submitted = signal(false);

  statusOptions = [
    { label: 'ATTENDANCE.STATUS_PRESENT', value: 'present' },
    { label: 'ATTENDANCE.STATUS_ABSENT', value: 'absent' },
    { label: 'ATTENDANCE.STATUS_LATE', value: 'late' },
    { label: 'ATTENDANCE.STATUS_EXCUSED', value: 'excused' },
  ];

  detailsResource = rxResource({
    params: () => ({ id: this.attendanceId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceById(params.id)
  });

  attendanceForm = this.fb.group({
    employeeName: [{ value: '', disabled: true }], // للقراءة فقط
    date: ['', Validators.required],
    status: ['', Validators.required],
    shiftStart: ['', Validators.required],
    shiftEnd: ['', Validators.required],
    checkIn: [''],
    checkOut: [''],
  }, {
    validators: [
      timeRangeValidator('shiftStart', 'shiftEnd'),
      timeRangeValidator('checkIn', 'checkOut')
    ]
  });

  constructor() {
    effect(() => {
      const data = this.detailsResource.value();
      if (data) {
        this.attendanceForm.patchValue(data);
      }
    });

    effect(() => {
      if (this.updateResource.value()) {
        this.router.navigate(['/attendance/list']);
      }
    });
  }

  private updateTrigger = signal<IUpdateAttendancePayload | null>(null);

  updateResource = rxResource({
    params: () => this.updateTrigger(),
    stream: ({ params }) => params ? this.attendanceService.updateAttendance(this.attendanceId(), params) : of(null)
  });

  isLoading = computed(() => this.updateResource.isLoading() || this.detailsResource.isLoading());

  onSave() {
    this.submitted.set(true);

    if (this.attendanceForm.valid) {
      const payload = {
        ...this.attendanceForm.getRawValue(),
        id: this.attendanceId()
      } as IUpdateAttendancePayload;

      this.updateTrigger.set(payload);
    } else {
      this.attendanceForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/attendance/list']);
  }
}
