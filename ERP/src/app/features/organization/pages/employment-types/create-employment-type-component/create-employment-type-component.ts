// create-employment-type-component.ts
import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { TranslocoModule } from '@jsverse/transloco';

// Shared Components
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppRadioComponent } from "@shared/components/atoms/app-radio-component/app-radio-component";
import { AppTextareaComponent } from "@shared/components/atoms/app-textarea-component/app-textarea-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { AppValidators } from '@shared/validators/word-limit.validator';


@Component({
  selector: 'app-create-employment-type-component',
  standalone: true, // Assuming standalone based on imports
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent
  ],
  templateUrl: './create-employment-type-component.html',
  styleUrl: './create-employment-type-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEmploymentTypeComponent {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly _employeeTypesService = inject(EmploymentTypesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  constructor() {
    this._employeeTypesService.reloadLookups();
  }

  /**
   * Use the .nonNullable builder.
   * This automatically ensures that value is 'string' and not 'string | null'
   */
  EmployeeTypesForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    // Casting 'active' as a literal type ensures it matches 'active' | 'inactive' in your DTO
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]]
  });
  private descriptionValue = toSignal(
    this.EmployeeTypesForm.controls.description.valueChanges,
    { initialValue: '' }
  );
  characterCount = computed(() => this.descriptionValue().length);
  // Check if we are over the limit to change text color
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);
  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.EmployeeTypesForm.updateValueAndValidity();

    if (this.EmployeeTypesForm.invalid) {
      this.EmployeeTypesForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // getRawValue() now strictly returns { name: string, status: 'active' | 'inactive', description: string }
    const rawValue = this.EmployeeTypesForm.getRawValue();

    this._employeeTypesService.create({
      name: rawValue.name.trim(),
      status: rawValue.status,
      description: rawValue.description
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._employeeTypesService.reloadLookups();
          this.isSubmitting.set(false);
          this.router.navigate(['/organization/employment-types/view']);
        },
        error: (err) => {
          console.error('Create Error:', err);
          this.isSubmitting.set(false);
        }
      });
  }

  private normalizeStringFields() {
    const nameControl = this.EmployeeTypesForm.controls.name;
    const descriptionControl = this.EmployeeTypesForm.controls.description;

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
