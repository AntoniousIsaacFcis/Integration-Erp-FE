// create-employment-type-component.ts
import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EmploymentTypesService } from '@features/employment-types/services/employment-types-service';
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
  private readonly fb = inject(FormBuilder);
  private readonly _employeeTypesService = inject(EmploymentTypesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  /**
   * Use the .nonNullable builder.
   * This automatically ensures that value is 'string' and not 'string | null'
   */
  EmployeeTypesForm = this.fb.nonNullable.group({
    employmentTypeAr: ['', [Validators.required]],
    // Casting 'active' as a literal type ensures it matches 'active' | 'inactive' in your DTO
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    description: ['', [AppValidators.wordLimit(250)]]
  });
  private descriptionValue = toSignal(
    this.EmployeeTypesForm.controls.description.valueChanges,
    { initialValue: '' }
  );
  // Compute the word count dynamically
  wordCount = computed(() => {
    const text = this.descriptionValue();
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  });
  // Check if we are over the limit to change text color
  isOverLimit = computed(() => this.wordCount() > 250);
  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);

    if (this.EmployeeTypesForm.invalid) {
      this.EmployeeTypesForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // getRawValue() now strictly returns { employmentTypeAr: string, status: 'active' | 'inactive', description: string }
    const rawValue = this.EmployeeTypesForm.getRawValue();

    this._employeeTypesService.create({
      employmentTypeAr: rawValue.employmentTypeAr,
      employmentTypeEn: rawValue.employmentTypeAr, // Mapping to English
      status: rawValue.status,
      description: rawValue.description
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/employment-types/view']);
        },
        error: (err) => {
          console.error('Create Error:', err);
          this.isSubmitting.set(false);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/employment-types/view']);
  }
}
