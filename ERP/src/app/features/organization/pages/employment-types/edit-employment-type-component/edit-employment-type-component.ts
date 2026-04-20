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
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppRadioComponent } from "@shared/components/atoms/app-radio-component/app-radio-component";
import { AppTextareaComponent } from "@shared/components/atoms/app-textarea-component/app-textarea-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";

@Component({
  selector: 'app-edit-employment-type-component',
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
  templateUrl: './edit-employment-type-component.html',
  styleUrl: './edit-employment-type-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEmploymentTypeComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly employmentTypesService = inject(EmploymentTypesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private employmentTypeId = '';

  isLoading = signal(true);
  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  employmentTypeForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  });

  private descriptionValue = toSignal(this.employmentTypeForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => this.descriptionValue().length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);

  ngOnInit() {
    this.employmentTypesService.reloadLookups();
    this.employmentTypeId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.employmentTypeId) {
      this.router.navigate(['/organization/employment-types/view']);
      return;
    }

    this.employmentTypesService
      .getById(this.employmentTypeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (type) => {
          this.employmentTypeForm.patchValue({
            name: type.name,
            status: type.status,
            description: type.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load employment type:', error);
          this.isLoading.set(false);
          this.router.navigate(['/organization/employment-types/view']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.employmentTypeForm.updateValueAndValidity();

    if (this.employmentTypeForm.invalid) {
      this.employmentTypeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.employmentTypeForm.getRawValue();

    this.employmentTypesService
      .update(this.employmentTypeId, {
        name: formValue.name.trim(),
        status: formValue.status,
        description: formValue.description,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.employmentTypesService.reloadLookups();
          this.isSubmitting.set(false);
          this.isFormSubmitted.set(false);
          this.router.navigate(['/organization/employment-types/view']);
        },
        error: (error) => {
          console.error('Update employment type failed:', error);
          this.isSubmitting.set(false);
        },
      });
  }

  private normalizeStringFields() {
    const nameControl = this.employmentTypeForm.controls.name;
    const descriptionControl = this.employmentTypeForm.controls.description;

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
    this.router.navigate(['/organization/employment-types/view']);
  }
}
