import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { TranslocoModule } from '@jsverse/transloco';
import { LeaveTypesService } from '@features/settings/services/leave-types-service';
import { IUpdateLeaveType } from '@features/settings/models/ileave-type';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';

@Component({
  selector: 'app-edit-leave-type-component',
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
  ],
  templateUrl: './edit-leave-type-component.html',
  styleUrl: './edit-leave-type-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLeaveTypeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LeaveTypesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly descriptionCharacterLimit = 1000;

  private leaveTypeId = '';

  isLoading = signal(true);
  isSubmitting = signal(false);
  submitted = signal(false);

  leaveTypeForm = this.fb.nonNullable.group({
    code: ['', [Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    color: ['#4e5381', [Validators.maxLength(20)]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
    maxDaysPerYear: ['', [Validators.pattern(/^\d+$/)]],
    maxContinuousDaysApplicable: ['', [Validators.pattern(/^\d+$/)]],
    applicableAfterDays: ['', [Validators.pattern(/^\d+$/)]],
    requiresPermission: [false, [Validators.required]],
    overrideWeekendOffDays: [false, [Validators.required]],
    allowOutsideLeavePolicy: [true, [Validators.required]],
    paid: [true, [Validators.required]],
  });

  private readonly descriptionValue = toSignal(
    this.leaveTypeForm.controls.description.valueChanges,
    { initialValue: '' },
  );

  characterCount = computed(() => this.descriptionValue().length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);

  ngOnInit() {
    this.service.reloadLookups();
    this.leaveTypeId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.leaveTypeId) {
      this.router.navigate(['/settings/leave-types']);
      return;
    }

    this.service
      .getById(this.leaveTypeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (leaveType) => {
          this.leaveTypeForm.patchValue({
            code: leaveType.code,
            name: leaveType.name,
            color: leaveType.color,
            description: leaveType.description,
            maxDaysPerYear: this.toInputValue(leaveType.maxDaysPerYear),
            maxContinuousDaysApplicable: this.toInputValue(leaveType.maxContinuousDaysApplicable),
            applicableAfterDays: this.toInputValue(leaveType.applicableAfterDays),
            requiresPermission: leaveType.requiresPermission,
            overrideWeekendOffDays: leaveType.overrideWeekendOffDays,
            allowOutsideLeavePolicy: leaveType.allowOutsideLeavePolicy,
            paid: leaveType.paid,
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load leave type:', error);
          this.isLoading.set(false);
          this.router.navigate(['/settings/leave-types']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) {
      return;
    }

    this.submitted.set(true);
    this.normalizeStringFields();
    this.leaveTypeForm.updateValueAndValidity();

    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.leaveTypeForm.getRawValue();
    const payload: IUpdateLeaveType = {
      code: formValue.code.trim() || undefined,
      name: formValue.name.trim(),
      color: formValue.color.trim() || '#4e5381',
      description: formValue.description.trim() || undefined,
      maxDaysPerYear: this.parseNumber(formValue.maxDaysPerYear),
      maxContinuousDaysApplicable: this.parseNumber(formValue.maxContinuousDaysApplicable),
      applicableAfterDays: this.parseNumber(formValue.applicableAfterDays),
      requiresPermission: formValue.requiresPermission,
      overrideWeekendOffDays: formValue.overrideWeekendOffDays,
      allowOutsideLeavePolicy: formValue.allowOutsideLeavePolicy,
      paid: formValue.paid,
    };

    this.service
      .update(this.leaveTypeId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.service.reloadLookups();
          this.isSubmitting.set(false);
          this.submitted.set(false);
          this.notification.show({
            type: 'success',
            title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
            actionLabel: 'COMMON.OK',
          });
          this.router.navigate(['/settings/leave-types']);
        },
        error: (error) => {
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
    this.router.navigate(['/settings/leave-types']);
  }

  private normalizeStringFields() {
    const controls = this.leaveTypeForm.controls;

    const values = {
      code: controls.code.value.trim(),
      name: controls.name.value.trim(),
      color: controls.color.value.trim(),
      description: controls.description.value.trim(),
    };

    if (controls.code.value !== values.code) {
      controls.code.setValue(values.code);
    }

    if (controls.name.value !== values.name) {
      controls.name.setValue(values.name);
    }

    if (controls.color.value !== values.color) {
      controls.color.setValue(values.color);
    }

    if (controls.description.value !== values.description) {
      controls.description.setValue(values.description);
    }
  }

  private parseNumber(value: string): number | null {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number.parseInt(normalized, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toInputValue(value: number | null): string {
    return value === null || value === undefined ? '' : value.toString();
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
