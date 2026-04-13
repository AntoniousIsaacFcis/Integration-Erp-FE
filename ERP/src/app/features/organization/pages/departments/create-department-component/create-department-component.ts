import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';

@Component({
  selector: 'app-create-department-component',
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
  templateUrl: './create-department-component.html',
  styleUrl: './create-department-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDepartmentComponent {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  departmentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  });

  private descriptionValue = toSignal(this.departmentForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => this.descriptionValue().length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);

  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.departmentForm.updateValueAndValidity();

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.departmentForm.getRawValue();

    this.departmentsService
      .create({
        name: formValue.name.trim(),
        status: formValue.status,
        description: formValue.description,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isFormSubmitted.set(false);
          this.router.navigate(['/organization/departments/view']);
        },
        error: (error) => {
          console.error('Create department failed:', error);
          this.isSubmitting.set(false);
        },
      });
  }

  private normalizeStringFields() {
    const nameControl = this.departmentForm.controls.name;
    const descriptionControl = this.departmentForm.controls.description;

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
    this.router.navigate(['/organization/departments/view']);
  }
}
