import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { ICreateEmploymentStatus } from '@features/organization/models/iemployment-status';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { AppValidators } from '@shared/validators/word-limit.validator';

@Component({
  selector: 'app-create-status-component',
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
  templateUrl: './create-status-component.html',
  styleUrl: './create-status-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateStatusComponent {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly employmentStatusesService = inject(EmploymentStatusesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  employmentStatusForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    isActive: [true, [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  });

  private descriptionValue = toSignal(this.employmentStatusForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => this.descriptionValue().length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);

  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.employmentStatusForm.updateValueAndValidity();

    if (this.employmentStatusForm.invalid) {
      this.employmentStatusForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const rawValue = this.employmentStatusForm.getRawValue();
    const payload: ICreateEmploymentStatus = {
      name: rawValue.name.trim(),
      isActive: rawValue.isActive,
      description: rawValue.description.trim(),
    };

    this.employmentStatusesService
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.employmentStatusesService.reloadLookups();
          this.isSubmitting.set(false);
          this.router.navigate(['/organization/employment-statuses/view']);
        },
        error: (error) => {
          console.error('Create Employment Status Error:', error);
          this.isSubmitting.set(false);
        },
      });
  }

  private normalizeStringFields() {
    const nameControl = this.employmentStatusForm.controls.name;
    const descriptionControl = this.employmentStatusForm.controls.description;

    const trimmedName = nameControl.value.trim();
    const trimmedDescription = descriptionControl.value.trim();

    if (nameControl.value !== trimmedName) {
      nameControl.setValue(trimmedName);
    }

    if (descriptionControl.value !== trimmedDescription) {
      descriptionControl.setValue(trimmedDescription);
    }
  }

  onCancel() {
    this.router.navigate(['/organization/employment-statuses/view']);
  }
}
