import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { DesignationsService } from '@features/organization/services/designations-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppValidators } from '@shared/validators/word-limit.validator';

@Component({
  selector: 'app-edit-designation-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppSelectComponent,
    AppRadioComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
  ],
  templateUrl: './edit-designation-component.html',
  styleUrl: './edit-designation-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDesignationComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly designationsService = inject(DesignationsService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private designationId = '';

  isLoading = signal(true);
  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  designationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    departmentId: [''],
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  });

  private descriptionValue = toSignal(this.designationForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => this.descriptionValue().length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);
  departmentOptions = this.departmentsService.selectList;
  isLoadingDepartments = this.departmentsService.selectResource.isLoading;

  ngOnInit() {
    this.departmentsService.reloadLookups();
    this.designationId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.designationId) {
      this.router.navigate(['/organization/designations/view']);
      return;
    }

    this.designationsService
      .getById(this.designationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (designation) => {
          this.designationForm.patchValue({
            name: designation.name,
            departmentId: designation.departmentId ?? '',
            status: designation.status,
            description: designation.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load designation:', error);
          this.isLoading.set(false);
          this.router.navigate(['/organization/designations/view']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.designationForm.updateValueAndValidity();

    if (this.designationForm.invalid) {
      this.designationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.designationForm.getRawValue();

    this.designationsService
      .update(this.designationId, {
        name: formValue.name.trim(),
        departmentId: formValue.departmentId || null,
        status: formValue.status,
        description: formValue.description,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.designationsService.reloadLookups();
          this.isSubmitting.set(false);
          this.isFormSubmitted.set(false);
          this.router.navigate(['/organization/designations/view']);
        },
        error: (error) => {
          console.error('Update designation failed:', error);
          this.isSubmitting.set(false);
        },
      });
  }

  private normalizeStringFields() {
    const nameControl = this.designationForm.controls.name;
    const descriptionControl = this.designationForm.controls.description;

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
    this.router.navigate(['/organization/designations/view']);
  }
}
