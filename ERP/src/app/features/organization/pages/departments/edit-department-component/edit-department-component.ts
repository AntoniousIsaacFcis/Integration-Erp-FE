import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { DepartmentStaffSelectorComponent } from '../components/department-staff-selector-component/department-staff-selector-component';

@Component({
  selector: 'app-edit-department-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    DepartmentStaffSelectorComponent,
  ],
  templateUrl: './edit-department-component.html',
  styleUrl: './edit-department-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartmentComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private departmentId = '';

  isLoading = signal(true);
  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

  departmentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    abbreviation: [''],
    status: ['active' as 'active' | 'inactive', [Validators.required]],
    managerStaffIds: this.fb.nonNullable.control<string[]>([]),
    employeeStaffIds: this.fb.nonNullable.control<string[]>([]),
    description: ['', [AppValidators.charLimit(this.descriptionCharacterLimit)]],
  });

  private descriptionValue = toSignal(this.departmentForm.controls.description.valueChanges, {
    initialValue: '',
  });
  private managerStaffIdsValue = toSignal(this.departmentForm.controls.managerStaffIds.valueChanges, {
    initialValue: [] as string[],
  });
  private employeeStaffIdsValue = toSignal(this.departmentForm.controls.employeeStaffIds.valueChanges, {
    initialValue: [] as string[],
  });

  characterCount = computed(() => this.descriptionValue().length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);
  managerStaffIds = computed(() => this.managerStaffIdsValue() ?? []);
  employeeStaffIds = computed(() => this.employeeStaffIdsValue() ?? []);
  staffOptions = this.departmentsService.staffLookupList;
  isLoadingStaff = this.departmentsService.staffLookupResource.isLoading;

  ngOnInit() {
    this.departmentId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.departmentId) {
      this.router.navigate(['/organization/departments/view']);
      return;
    }

    this.departmentsService
      .getById(this.departmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (department) => {
          this.departmentForm.patchValue({
            name: department.name,
            abbreviation: department.abbreviation ?? '',
            status: department.status,
            managerStaffIds: department.managerStaffIds,
            employeeStaffIds: department.employeeStaffIds,
            description: department.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load department:', error);
          this.isLoading.set(false);
          this.router.navigate(['/organization/departments/view']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) return;

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
      .update(this.departmentId, {
        name: formValue.name.trim(),
        abbreviation: formValue.abbreviation,
        status: formValue.status,
        managerStaffIds: formValue.managerStaffIds,
        employeeStaffIds: formValue.employeeStaffIds,
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
          console.error('Update department failed:', error);
          this.isSubmitting.set(false);
        },
      });
  }

  private normalizeStringFields() {
    const nameControl = this.departmentForm.controls.name;
    const abbreviationControl = this.departmentForm.controls.abbreviation;
    const descriptionControl = this.departmentForm.controls.description;

    const trimmedName = nameControl.value.trim();
    const trimmedAbbreviation = abbreviationControl.value.trim();
    const trimmedDescription = descriptionControl.value.trim();

    if (nameControl.value !== trimmedName) {
      nameControl.setValue(trimmedName);
    }

    if (descriptionControl.value !== trimmedDescription) {
      descriptionControl.setValue(trimmedDescription);
    }

    if (abbreviationControl.value !== trimmedAbbreviation) {
      abbreviationControl.setValue(trimmedAbbreviation);
    }
  }

  onCancel() {
    this.router.navigate(['/organization/departments/view']);
  }

  onManagersChange(selectedIds: string[]) {
    this.departmentForm.controls.managerStaffIds.setValue(selectedIds);
  }

  onEmployeesChange(selectedIds: string[]) {
    this.departmentForm.controls.employeeStaffIds.setValue(selectedIds);
  }
}
