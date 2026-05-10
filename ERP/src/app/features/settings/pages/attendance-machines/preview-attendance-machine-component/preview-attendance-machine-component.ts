import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AttendanceMachinesService } from '@features/settings/services/attendance-machines-service';
import { IAttendanceMachine } from '@features/settings/models/iattendance-machine';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';

@Component({
  selector: 'app-preview-attendance-machine-component',
  standalone: true,
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    AppInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './preview-attendance-machine-component.html',
  styleUrl: './preview-attendance-machine-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewAttendanceMachineComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AttendanceMachinesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbService = inject(BreadcrumbService);

  isLoading = signal(true);
  attendanceMachine = signal<IAttendanceMachine | null>(null);

  attendanceMachineForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    code: this.fb.nonNullable.control({ value: '', disabled: true }),
    serialNumber: this.fb.nonNullable.control({ value: '', disabled: true }),
    machineType: this.fb.nonNullable.control({ value: '', disabled: true }),
    hostName: this.fb.nonNullable.control({ value: '', disabled: true }),
    port: this.fb.nonNullable.control({ value: '', disabled: true }),
    importFilePath: this.fb.nonNullable.control({ value: '', disabled: true }),
    webhookUrl: this.fb.nonNullable.control({ value: '', disabled: true }),
    lastPullTime: this.fb.nonNullable.control({ value: '', disabled: true }),
    totalPulledSigns: this.fb.nonNullable.control({ value: '', disabled: true }),
    lastPullError: this.fb.nonNullable.control({ value: '', disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  ngOnInit() {
    const attendanceMachineId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!attendanceMachineId) {
      this.goBack();
      return;
    }

    this.service
      .getById(attendanceMachineId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (attendanceMachine) => {
          this.attendanceMachine.set(attendanceMachine);
          this.attendanceMachineForm.patchValue({
            name: attendanceMachine.name,
            code: attendanceMachine.code,
            serialNumber: attendanceMachine.serialNumber,
            machineType: attendanceMachine.machineType,
            hostName: attendanceMachine.hostName,
            port: this.toInputValue(attendanceMachine.port),
            importFilePath: attendanceMachine.importFilePath,
            webhookUrl: attendanceMachine.webhookUrl,
            lastPullTime: attendanceMachine.lastPullTime ?? attendanceMachine.lastPullDate ?? '',
            totalPulledSigns: String(attendanceMachine.totalPulledSigns ?? 0),
            lastPullError: attendanceMachine.lastPullError,
            description: attendanceMachine.description,
          });
          this.breadcrumbService.setCurrentBreadcrumbLabel(attendanceMachine.name, this.route);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load attendance machine preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/settings/attendance-machines']);
  }

  private toInputValue(value: number | null): string {
    return value === null || value === undefined ? '' : value.toString();
  }
}
