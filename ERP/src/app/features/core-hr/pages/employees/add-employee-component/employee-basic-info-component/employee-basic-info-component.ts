import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";
import { TranslocoModule } from '@jsverse/transloco';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { NationalitiesService } from '@core/services/nationalities-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX, lucideSaudiRiyal } from '@ng-icons/lucide';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { IDocument } from '@shared/models/idocument';
import { DocumentsComponent } from "@shared/components/organisms/documents-component/documents-component";
import { fileValidation } from '@shared/validators/file-validation.validator';
import { DesignationsService } from '@features/organization/services/designations-service';
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { DocumentTypesService } from '@features/organization/services/document-types-service';
import { STAFF_GENDER_OPTIONS, STAFF_MARITAL_STATUS_OPTIONS } from '@features/core-hr/models/employee-enum-options';
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function birthDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const birthDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    if (birthDate > today) {
      return { futureBirthDate: true };
    }

    return null;
  };
}

function probationAfterHireValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hireDate = control.get('joiningDate')?.value;
    const probationEndDate = control.get('probationEndDate')?.value;

    if (!hireDate || !probationEndDate) {
      return null;
    }

    const hire = new Date(hireDate);
    const probationEnd = new Date(probationEndDate);

    if (Number.isNaN(hire.getTime()) || Number.isNaN(probationEnd.getTime())) {
      return null;
    }

    if (probationEnd < hire) {
      return { probationBeforeHireDate: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-employee-basic-info-component',
  imports: [TranslocoModule, AppInputComponent, AppSelectComponent, AppDateInputComponent, NgIcon, DocumentsComponent],
  templateUrl: './employee-basic-info-component.html',
  styleUrl: './employee-basic-info-component.css',
  providers: [[provideIcons({ lucideSaudiRiyal, lucideOctagonX })]],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeBasicInfoComponent {
  private fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  submitted = signal(false);
  private departmentService = inject(DepartmentsService);
  protected nationalitiesService = inject(NationalitiesService);
  protected _employmentTypesService = inject(EmploymentTypesService);
  protected employmentStatusesService = inject(EmploymentStatusesService);
  protected _designationsService = inject(DesignationsService);
  protected documentTypesService = inject(DocumentTypesService);
  phoneRegex = /^\+?([0-9\s\-]{11,15})$/;

  constructor() {
    effect(() => {
      this.totalSalaryCalc();
    });

    this.getControl('phone').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value && /[\s\-()]/g.test(value)) {
          const sanitized = value.replace(/[+\s\-()]/g, '');
          this.getControl('phone').setValue(sanitized, { emitEvent: false });
        }
      });

    this.getControl('email').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearSubmitError('email'));

    this.getControl('phone').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearSubmitError('phone'));

    this.getControl('nationalId').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearSubmitError('nationalId'));

    this.getControl('attachedFiles').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((files) => this.syncDocumentValidators(files as IDocument[]));

    this.getControl('joiningDate').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncProbationDateControlError());

    this.getControl('probationEndDate').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncProbationDateControlError());

    this.mainForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncProbationDateControlError());
  }


  mainForm = this.fb.nonNullable.group({
    // Personal Info
    fullNameAr: ['', [Validators.required]],
    fullNameEn: ['', [Validators.required]],
    nationalId: ['', [Validators.required, Validators.pattern('^[0-9]{10,14}$')]],
    gender: ['', [Validators.required]],
    nationality: ['', [Validators.required]],
    maritalStatus: ['', [Validators.required]],
    birthDate: ['', [Validators.required, birthDateValidator()]],
    phone: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(10)]],
    emergencyPhone: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],

    // Job Details
    jobTitleId: ['', [Validators.required]],
    departmentId: ['', [Validators.required]],
    joiningDate: ['', [Validators.required]],
    employmentType: ['', [Validators.required]],
    probationEndDate: ['', [Validators.required]],
    employmentStatus: ['', [Validators.required]],

    //Salary Details
    basicSalary: ['', [Validators.required, Validators.min(0)]],
    allowances: ['', [Validators.required, Validators.min(0)]],
    deductions: ['', [Validators.required, Validators.min(0)]],
    totalSalary: [{ value: 0, disabled: true }],//calculated

    //Documents
    documentTypeId: [''],
    expiryDate: [''],
    attachedFiles: [[] as IDocument[], [fileValidation(10, ['application/pdf', 'image/jpeg', 'image/png'])]]
  }, {
    validators: [probationAfterHireValidator()],
  });

  handleFilesChange(files: IDocument[]) {
    this.mainForm.patchValue({ attachedFiles: files });
    this.mainForm.get('attachedFiles')?.updateValueAndValidity();
  }

  setProbationRequired(isRequired: boolean) {
    const probationEndDateControl = this.getControl('probationEndDate');
    probationEndDateControl.setValidators(isRequired ? [Validators.required] : []);
    probationEndDateControl.updateValueAndValidity({ emitEvent: false });
  }

  private syncDocumentValidators(files: IDocument[]) {
    const hasFiles = Array.isArray(files) && files.length > 0;
    const documentTypeControl = this.getControl('documentTypeId');
    const expiryDateControl = this.getControl('expiryDate');

    documentTypeControl.setValidators(hasFiles ? [Validators.required] : []);
    expiryDateControl.setValidators(hasFiles ? [Validators.required] : []);

    if (!hasFiles) {
      documentTypeControl.setValue('', { emitEvent: false });
      expiryDateControl.setValue('', { emitEvent: false });
    }

    documentTypeControl.updateValueAndValidity({ emitEvent: false });
    expiryDateControl.updateValueAndValidity({ emitEvent: false });
  }

  private basicSalaryValue = toSignal(
    this.getControl('basicSalary').valueChanges.pipe(startWith(this.getControl('basicSalary').value))
  );
  private allowancesValue = toSignal(
    this.getControl('allowances').valueChanges.pipe(startWith(this.getControl('allowances').value))
  );
  private deductionsValue = toSignal(
    this.getControl('deductions').valueChanges.pipe(startWith(this.getControl('deductions').value))
  );
  private departmentIdValue = toSignal(
    this.getControl('departmentId').valueChanges.pipe(startWith(this.getControl('departmentId').value))
  );
  private jobTitleIdValue = toSignal(
    this.getControl('jobTitleId').valueChanges.pipe(startWith(this.getControl('jobTitleId').value))
  );
  totalSalaryCalc = computed(() => {
    const basic = Number(this.basicSalaryValue() ?? this.getControl('basicSalary').value) || 0;
    const allowances = Number(this.allowancesValue() ?? this.getControl('allowances').value) || 0;
    const deductions = Number(this.deductionsValue() ?? this.getControl('deductions').value) || 0;

    const total = basic + allowances - deductions;

    //recalculated smoothly without fire change detection
    this.mainForm.patchValue({ totalSalary: total }, { emitEvent: false });
    return total;
  });

  departments = this.departmentService.localizedDepartments;
  isLoadingDepartments = this.departmentService.departmentsResource.isLoading;

  nationalities = this.nationalitiesService.localizedNationalities;
  isLoadingNationalities = this.nationalitiesService.nationalitiesResource.isLoading;

  employmentTypes = this._employmentTypesService.lookupList;
  isLoadingTypes = this._employmentTypesService.lookupResource.isLoading;

  employmentStatuses = this.employmentStatusesService.lookupList;
  isLoadingEmploymentStatuses = this.employmentStatusesService.resource.isLoading;

  jobTitles = computed(() => {
    const selectedDepartmentId = this.departmentIdValue();
    const allJobTitles = this._designationsService.list();

    if (!selectedDepartmentId) {
      return [];
    }

    return allJobTitles.filter(
      (job) => !job.departmentId || job.departmentId === selectedDepartmentId,
    );
  });
  isLoadingJobs = this._designationsService.resource.isLoading;
  isJobTitleDisabled = computed(() => !this.departmentIdValue());

  documentTypes = this.documentTypesService.lookupList;
  isLoadingDocumentTypes = this.documentTypesService.resource.isLoading;

  genderOptions = STAFF_GENDER_OPTIONS;
  maritalStatusOptions = STAFF_MARITAL_STATUS_OPTIONS;

  getControl(name: string): FormControl {
    return this.mainForm.get(name) as FormControl;
  }

  birthDateError = computed(() => {
    const control = this.getControl('birthDate');
    return this.submitted() && control.errors?.['futureBirthDate'];
  });

  probationDateError = computed(() => {
    return this.submitted() && this.mainForm.errors?.['probationBeforeHireDate'];
  });

  private syncProbationDateControlError() {
    const probationEndDateControl = this.getControl('probationEndDate');
    const hasProbationDateError = !!this.mainForm.errors?.['probationBeforeHireDate'];
    const currentErrors = probationEndDateControl.errors ?? {};

    if (hasProbationDateError) {
      probationEndDateControl.setErrors({
        ...currentErrors,
        dateRangeInvalid: true,
      });
      probationEndDateControl.markAsTouched();
      return;
    }

    if (!currentErrors['dateRangeInvalid']) {
      return;
    }

    const { dateRangeInvalid: _removed, ...remainingErrors } = currentErrors;
    probationEndDateControl.setErrors(
      Object.keys(remainingErrors).length ? remainingErrors : null,
    );
  }

  clearSubmitErrors() {
    this.clearSubmitError('email');
    this.clearSubmitError('phone');
    this.clearSubmitError('nationalId');
  }

  applySubmitFieldErrors(fieldErrors: Partial<Record<'email' | 'phone' | 'nationalId', string>>) {
    let hasFieldError = false;

    (Object.entries(fieldErrors) as Array<['email' | 'phone' | 'nationalId', string | undefined]>)
      .forEach(([controlName, message]) => {
        if (!message) {
          return;
        }

        if (controlName === 'email' && message === 'ERRORS.DUPLICATE_STAFF_EMAIL') {
          this.setDuplicateError(controlName);
          hasFieldError = true;
          return;
        }

        if (controlName === 'phone' && message === 'ERRORS.DUPLICATE_STAFF_PHONE') {
          this.setDuplicateError(controlName);
          hasFieldError = true;
          return;
        }

        this.setBackendMessage(controlName, message);
        hasFieldError = true;
      });

    return hasFieldError;
  }

  private setBackendMessage(controlName: 'email' | 'phone' | 'nationalId', message: string) {
    const control = this.getControl(controlName);
    control.setErrors({
      ...(control.errors ?? {}),
      backendMessage: message,
    });
    control.markAsTouched();
  }

  private setDuplicateError(controlName: 'email' | 'phone') {
    const control = this.getControl(controlName);
    control.setErrors({
      ...(control.errors ?? {}),
      duplicate: true,
    });
    control.markAsTouched();
  }

  private clearSubmitError(controlName: 'email' | 'phone' | 'nationalId') {
    this.clearControlError(controlName, 'backendMessage');
    this.clearControlError(controlName, 'duplicate');
  }

  private clearControlError(controlName: 'email' | 'phone' | 'nationalId', errorKey: string) {
    const control = this.getControl(controlName);
    const errors = control.errors;

    if (!errors?.[errorKey]) {
      return;
    }

    const { [errorKey]: _removed, ...remainingErrors } = errors;
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }

  private readonly syncJobTitleWithDepartment = effect(() => {
    const selectedDepartmentId = this.departmentIdValue();
    const selectedJobTitleId = this.jobTitleIdValue();
    const availableJobTitles = this.jobTitles();

    if (!selectedDepartmentId) {
      if (selectedJobTitleId) {
        this.getControl('jobTitleId').setValue('', { emitEvent: false });
      }
      return;
    }

    if (
      selectedJobTitleId &&
      !availableJobTitles.some((jobTitle) => jobTitle.id === selectedJobTitleId)
    ) {
      this.getControl('jobTitleId').setValue('', { emitEvent: false });
    }
  });
}
