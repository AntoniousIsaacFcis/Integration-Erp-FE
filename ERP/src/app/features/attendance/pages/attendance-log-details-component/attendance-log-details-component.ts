import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { IAttendanceLogDetails } from '@features/attendance/models/iattendance';

@Component({
  selector: 'app-attendance-log-details-component',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FormContainerComponent,
    AppInputComponent,
    AppDateInputComponent,
    TimeInputComponent,
    FormSaveButtonComponent,
  ],
  templateUrl: './attendance-log-details-component.html',
  styleUrl: './attendance-log-details-component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceLogDetailsComponent {
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly translocoService = inject(TranslocoService);

  attendanceId = signal(this.route.snapshot.params['id']);

  detailsForm = this.fb.group({
    employeeName: [{ value: '', disabled: true }],
    logDate: [{ value: '', disabled: true }],
    logTime: [{ value: '', disabled: true }],
    source: [{ value: '', disabled: true }],
    sessionId: [{ value: '', disabled: true }],
    status: [{ value: '', disabled: true }],
    invalidReason: [{ value: '', disabled: true }],
  });

  detailsResource = rxResource({
    params: () => ({ id: this.attendanceId() }),
    stream: ({ params }) => this.attendanceService.getAttendanceLogById(params.id),
  });

  isFormReady = signal(false);

  constructor() {
    effect(() => {
      const details = this.detailsResource.value();

      if (!details) {
        return;
      }

      const formattedData = this.toFormValue(details);
      this.breadcrumbService.setCurrentBreadcrumbLabel(
        this.toBreadcrumbLabel(details.employeeName, details.logDateTime),
        this.route,
      );
      this.detailsForm.patchValue(formattedData);
      this.isFormReady.set(true);
    });
  }

  private toFormValue(details: IAttendanceLogDetails) {
    return {
      employeeName: details.employeeName,
      logDate: this.formatDateForInput(details.logDateTime),
      logTime: this.formatTimeForInput(details.logDateTime),
      source: this.formatSource(details),
      sessionId: details.sessionId,
      status: this.translocoService.translate(details.statusLabelKey),
      invalidReason: details.invalidReason ?? '',
    };
  }

  private formatDateForInput(value: string | null): string {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'yyyy-MM-dd') || '';
  }

  private formatTimeForInput(value: string | null): string {
    if (!value) {
      return '';
    }

    return this.datePipe.transform(value, 'HH:mm') || '';
  }

  private formatSource(details: IAttendanceLogDetails) {
    return details.sourceDisplay?.trim()
      || this.translocoService.translate(details.sourceLabelKey);
  }

  private toBreadcrumbLabel(employeeName: string, logDateTime: string) {
    const formattedDateTime = this.datePipe.transform(logDateTime, 'dd-MMM-yyyy HH:mm');

    return formattedDateTime
      ? `${employeeName} - ${formattedDateTime}`
      : employeeName;
  }

  onBack() {
    this.router.navigate(['/attendance/view-attendance-log']);
  }
}
