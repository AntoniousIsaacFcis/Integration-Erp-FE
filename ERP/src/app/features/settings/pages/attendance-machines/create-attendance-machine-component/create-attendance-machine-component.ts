import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AttendanceMachinesService } from '@features/settings/services/attendance-machines-service';
import { ICreateAttendanceMachine } from '@features/settings/models/iattendance-machine';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { SubmitErrorMessageComponent } from '@shared/components/atoms/submit-error-message-component/submit-error-message-component';

@Component({
  selector: 'app-create-attendance-machine-component',
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    SubmitErrorMessageComponent,
  ],
  templateUrl: './create-attendance-machine-component.html',
  styleUrl: './create-attendance-machine-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAttendanceMachineComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AttendanceMachinesService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly identifierValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const code = String(control.get('code')?.value ?? '').trim();
    const serialNumber = String(control.get('serialNumber')?.value ?? '').trim();

    if (!code && !serialNumber) {
      return { identifierRequired: true };
    }

    if (code && serialNumber && code !== serialNumber) {
      return { identifierMismatch: true };
    }

    return null;
  };

  private readonly optionalPortValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const rawValue = String(control.value ?? '').trim();

    if (!rawValue) {
      return null;
    }

    const isValidPort = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(rawValue);
    return isValidPort ? null : { pattern: true };
  };

  submitted = signal(false);
  isSubmitting = signal(false);

  attendanceMachineForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required]],
      code: [''],
      serialNumber: [''],
      machineType: ['zkteco', [Validators.required]],
      hostName: [''],
      port: ['', [this.optionalPortValidator]],
      importFilePath: [''],
      webhookUrl: [''],
      description: [''],
      isActive: [true, [Validators.required]],
    },
    { validators: [this.identifierValidator] },
  );

  onSubmit() {
    if (this.isSubmitting()) {
      return;
    }

    this.submitted.set(true);
    this.normalizeStringFields();
    this.attendanceMachineForm.updateValueAndValidity();

    if (this.attendanceMachineForm.invalid) {
      this.attendanceMachineForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const rawValue = this.attendanceMachineForm.getRawValue();
    const payload: ICreateAttendanceMachine = {
      name: rawValue.name.trim(),
      code: rawValue.code.trim() || undefined,
      serialNumber: rawValue.serialNumber.trim() || undefined,
      machineType: rawValue.machineType.trim(),
      hostName: rawValue.hostName.trim() || undefined,
      port: this.parseNumber(rawValue.port),
      importFilePath: rawValue.importFilePath.trim() || undefined,
      webhookUrl: rawValue.webhookUrl.trim() || undefined,
      description: rawValue.description.trim() || undefined,
      isActive: rawValue.isActive,
    };

    this.service
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notification.show({
            type: 'success',
            title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
            actionLabel: 'COMMON.OK',
          });
          this.router.navigate(['/settings/attendance-machines']);
        },
        error: (error: unknown) => {
          this.isSubmitting.set(false);
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: this.getErrorMessage(error),
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  onCancel() {
    this.router.navigate(['/settings/attendance-machines']);
  }

  identifierErrorKey(): string | null {
    if (!this.submitted()) {
      return null;
    }

    if (this.attendanceMachineForm.errors?.['identifierRequired']) {
      return 'SETTINGS.ATTENDANCE_MACHINE_IDENTIFIER_REQUIRED';
    }

    if (this.attendanceMachineForm.errors?.['identifierMismatch']) {
      return 'SETTINGS.ATTENDANCE_MACHINE_IDENTIFIER_MATCH';
    }

    return null;
  }

  private normalizeStringFields() {
    const controls = this.attendanceMachineForm.controls;

    const values = {
      name: controls.name.value.trim(),
      code: controls.code.value.trim(),
      serialNumber: controls.serialNumber.value.trim(),
      machineType: controls.machineType.value.trim(),
      hostName: controls.hostName.value.trim(),
      port: controls.port.value.trim(),
      importFilePath: controls.importFilePath.value.trim(),
      webhookUrl: controls.webhookUrl.value.trim(),
      description: controls.description.value.trim(),
    };

    if (controls.name.value !== values.name) controls.name.setValue(values.name);
    if (controls.code.value !== values.code) controls.code.setValue(values.code);
    if (controls.serialNumber.value !== values.serialNumber) controls.serialNumber.setValue(values.serialNumber);
    if (controls.machineType.value !== values.machineType) controls.machineType.setValue(values.machineType);
    if (controls.hostName.value !== values.hostName) controls.hostName.setValue(values.hostName);
    if (controls.port.value !== values.port) controls.port.setValue(values.port);
    if (controls.importFilePath.value !== values.importFilePath) controls.importFilePath.setValue(values.importFilePath);
    if (controls.webhookUrl.value !== values.webhookUrl) controls.webhookUrl.setValue(values.webhookUrl);
    if (controls.description.value !== values.description) controls.description.setValue(values.description);
  }

  private parseNumber(value: string): number | null {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number.parseInt(normalized, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getErrorMessage(error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error
      ? (error as { message?: unknown }).message
      : null;

    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'COMMON.MESSAGES.PLEASE_TRY_AGAIN';
  }
}
