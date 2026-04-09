import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '@features/shifts/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";
import { TimeInputComponent } from "@shared/components/atoms/time-input-component/time-input-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { DatePipe } from '@angular/common';
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";


@Component({
  selector: 'app-attendance-log-details-component',
  imports: [ReactiveFormsModule, TranslocoModule, FormContainerComponent, AppInputComponent, AppDateInputComponent, TimeInputComponent, FormSaveButtonComponent],
  templateUrl: './attendance-log-details-component.html',
  styleUrl: './attendance-log-details-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceLogDetailsComponent {
  private datePipe = inject(DatePipe);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);

  attendanceId = signal(this.route.snapshot.params['id']);

  detailsForm = this.fb.group({
    employeeName: [{ value: '', disabled: true }],
    date: [{ value: '', disabled: true }],
    status: [{ value: '', disabled: true }],
    checkIn: [{ value: '', disabled: true }],
    checkOut: [{ value: '', disabled: true }],
    sessionNumber: [{ value: '', disabled: true }],
    source: [{ value: '', disabled: true }],
  });

  detailsResource = rxResource({
    params: () => ({ id: this.attendanceId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceById(params.id)
  });

  isFormReady = signal<boolean>(false);
  constructor() {
    // update the form => when fetching data completed
    effect(() => {
      const res = this.detailsResource.value();
      if (res) {
        const rawData = (res as any).data ? (res as any).data : res;

        const formattedData = {
          ...rawData,
          date: this.formatDateForInput(rawData.date),
          checkIn: this.formatTimeForInput(rawData.checkIn),
          checkOut: this.formatTimeForInput(rawData.checkOut)
        };

        this.detailsForm.patchValue(formattedData);

        this.isFormReady.set(true);

        console.log('formatted data:', {
          date: formattedData.date,
          checkIn: formattedData.checkIn,
          checkOut: formattedData.checkOut
        });
      }
    });
  }

  private formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return '';
    return this.datePipe.transform(dateStr, 'yyyy-MM-dd') || '';
  }

  private formatTimeForInput(timeStr: string | null): string {
    if (!timeStr) return '';

    const cleanTime = timeStr.replace('صباحاً', 'AM').replace('مساءً', 'PM').trim();

    const formatted = this.datePipe.transform(`2026-01-01 ${cleanTime}`, 'HH:mm');

    return formatted || '';
  }

  onBack() {
    this.router.navigate(['/shifts/view-attendance-days']);
  }
}
