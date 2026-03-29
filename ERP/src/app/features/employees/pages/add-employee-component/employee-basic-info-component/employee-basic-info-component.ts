import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";
import { TranslocoModule } from '@jsverse/transloco';
import { DepartmentsService } from '@features/departments/services/departments-service';
import { NationalitiesService } from '@core/services/nationalities-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX, lucideSaudiRiyal } from '@ng-icons/lucide';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { IDocument } from '@shared/models/idocument';
import { DocumentsComponent } from "@shared/components/organisms/documents-component/documents-component";
import { fileValidation } from '@shared/validators/file-validation.validator';
import { JobTitlesService } from '@core/services/job-titles-service';
import { EmploymentTypesService } from '@features/employment-types/services/employment-types-service';

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
  submitted = signal(false);
  private departmentService = inject(DepartmentsService);
  protected nationalitiesService = inject(NationalitiesService);
  protected _employmentTypesService = inject(EmploymentTypesService);
  protected _jobTitlesService = inject(JobTitlesService);
  phoneRegex = /^\+?([0-9\s\-]{11,15})$/;

  constructor() {
    effect(() => {
      const total = this.totalSalaryCalc();

      //remvoe extra spaces and symbols in phone
      this.getControl('phone').valueChanges.subscribe(value => {
        if (value && /[\s\-()]/g.test(value)) {
          const sanitized = value.replace(/[+\s\-()]/g, '');
          this.getControl('phone').setValue(sanitized, { emitEvent: false });
        }
      });

    });
  }


  mainForm = this.fb.nonNullable.group({
    // Personal Info
    fullNameAr: ['', [Validators.required]],
    fullNameEn: ['', [Validators.required]],
    nationalId: ['', [Validators.required, Validators.pattern('^[0-9]{10,14}$')]],
    gender: ['', [Validators.required]],
    nationality: ['', [Validators.required]],
    maritalStatus: ['', [Validators.required]],
    birthDate: ['', [Validators.required]],
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
    documentType: ['', [Validators.required]],
    expiryDate: ['', [Validators.required]],
    attachedFiles: [[] as IDocument[], [Validators.required, Validators.minLength(1), fileValidation(10, ['application/pdf', 'image/jpeg', 'image/png'])]]
  });

  handleFilesChange(files: IDocument[]) {
    this.mainForm.patchValue({ attachedFiles: files });
    this.mainForm.get('attachedFiles')?.updateValueAndValidity();
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

  jobTitles = this._jobTitlesService.list;
  isLoadingJobs = this._jobTitlesService.resource.isLoading;

  getControl(name: string): FormControl {
    return this.mainForm.get(name) as FormControl;
  }


}
