import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { IUpdateEmploymentStatus } from '@features/organization/models/iemployment-status';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';

@Component({
  selector: 'app-edit-status-component',
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
  templateUrl: './edit-status-component.html',
  styleUrl: './edit-status-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStatusComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly employmentStatusesService = inject(EmploymentStatusesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private employmentStatusId = '';

  isLoading = signal(true);
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

  ngOnInit() {
    this.employmentStatusesService.reloadLookups();
    this.employmentStatusId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.employmentStatusId) {
      this.router.navigate(['/organization/employment-statuses/view']);
      return;
    }

    this.employmentStatusesService
      .getById(this.employmentStatusId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (status) => {
          this.employmentStatusForm.patchValue({
            name: status.name,
            isActive: status.isActive,
            description: status.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load employment status:', error);
          this.isLoading.set(false);
          this.router.navigate(['/organization/employment-statuses/view']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.employmentStatusForm.updateValueAndValidity();

    if (this.employmentStatusForm.invalid) {
      this.employmentStatusForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.employmentStatusForm.getRawValue();
    const payload: IUpdateEmploymentStatus = {
      name: formValue.name.trim(),
      isActive: formValue.isActive,
      description: formValue.description.trim(),
    };

    this.employmentStatusesService
      .update(this.employmentStatusId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.employmentStatusesService.reloadLookups();
          this.isSubmitting.set(false);
          this.isFormSubmitted.set(false);
          this.router.navigate(['/organization/employment-statuses/view']);
        },
        error: (error) => {
          console.error('Update Employment Status failed:', error);
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
