import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { EmployeeBasicInfoComponent } from "./employee-basic-info-component/employee-basic-info-component";
import { StepperVisualComponent } from "./stepper-visual-component/stepper-visual-component";
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { IEmployeeForm } from '@features/core-hr/models/iemployee';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeService } from '@features/core-hr/services/employee-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { DocumentTypesService } from '@features/organization/services/document-types-service';
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { IRemoteServiceError } from '@core/models/iremote-service-error';

@Component({
  selector: 'app-add-employee-component',
  imports: [TranslocoModule, EmployeeBasicInfoComponent, StepperVisualComponent, FormContainerComponent, FormSaveButtonComponent],
  templateUrl: './add-employee-component.html',
  styleUrl: './add-employee-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEmployeeComponent implements OnInit {
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private readonly documentTypesService = inject(DocumentTypesService);
  private readonly employmentStatusesService = inject(EmploymentStatusesService);

  activeSegment = signal(1);
  private pendingPayload = signal<IEmployeeForm | null>(null);
  private readonly employeeId = signal<string>('');
  private readonly initialEmployee = signal<IEmployeeForm | null>(null);
  basicInfoComp = viewChild(EmployeeBasicInfoComponent);
  isFetching = signal(false);
  isSubmitting = signal(false);
  isLoading = computed(() => this.isFetching() || this.isSubmitting());
  isEditMode = computed(() => !!this.employeeId());
  pageTitleKey = computed(() => this.isEditMode() ? 'EMPLOYEES.EDIT_EMPLOYEE' : 'EMPLOYEES.ADD_EMPLOYEE');
  submitLabelKey = computed(() => this.isEditMode() ? 'COMMON.UPDATE' : 'COMMON.SAVE_EMPLOYEE');

  constructor() {
    effect(() => {
      const employee = this.initialEmployee();
      const basic = this.basicInfoComp();

      if (!employee || !basic) {
        return;
      }

      basic.mainForm.patchValue({
        fullNameAr: employee.fullNameAr ?? '',
        fullNameEn: employee.fullNameEn ?? '',
        nationalId: employee.nationalId ?? '',
        gender: employee.gender ?? '',
        nationality: employee.nationality ?? '',
        maritalStatus: employee.maritalStatus ?? '',
        birthDate: employee.birthDate ?? '',
        phone: employee.phone ?? '',
        email: employee.email ?? '',
        address: employee.address ?? '',
        emergencyPhone: employee.emergencyPhone ?? employee.emergencyContact ?? '',
        jobTitleId: employee.jobTitleId ?? '',
        departmentId: employee.departmentId ?? '',
        joiningDate: employee.joiningDate ?? '',
        employmentType: employee.employmentType ?? '',
        probationEndDate: employee.probationPeriod ?? '',
        employmentStatus: employee.employmentStatus ?? '',
        basicSalary: String(employee.basicSalary ?? 0),
        allowances: String(employee.allowances ?? 0),
        deductions: String(employee.deductions ?? 0),
        totalSalary: employee.totalSalary ?? 0,
        documentTypeId: employee.documentTypeId ?? '',
        expiryDate: employee.documentExpiryDate ?? '',
        attachedFiles: [],
      }, { emitEvent: false });

      basic.setProbationRequired(!this.isEditMode() || !!employee.probationPeriod);
      basic.mainForm.markAsPristine();
      basic.mainForm.markAsUntouched();
      basic.clearSubmitErrors();
      basic.submitted.set(false);
    });
  }

  ngOnInit() {
    const employeeId = this.route.snapshot.paramMap.get('empId') ?? '';

    if (!employeeId) {
      return;
    }

    this.employeeId.set(employeeId);
    this.loadEmployee(employeeId);
  }

  onStepperClick(stepId: number) {
    this.activeSegment.set(stepId);

    const sectionIds = {
      1: 'personal-section',
      2: 'job-section',
      3: 'salary-section',
      4: 'docs-section'
    };

    const targetId = sectionIds[stepId as keyof typeof sectionIds];
    const targetElement = document.getElementById(targetId);
    const scrollContainer = document.getElementById('main-content');

    if (targetElement && scrollContainer) {
      const targetPosition = targetElement.offsetTop - 20;

      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  async onSaveAll() {
    if (this.isLoading()) return;

    const basic = this.basicInfoComp();
    if (!basic) return;

    basic.submitted.set(true);
    basic.clearSubmitErrors();
    basic.mainForm.updateValueAndValidity();

    if (basic.mainForm.valid) {
      const rawData = basic.mainForm.getRawValue();
      const selectedDocumentType = this.documentTypesService
        .lookupList()
        .find((type) => type.id === rawData.documentTypeId);
      const selectedEmploymentStatus = this.employmentStatusesService
        .lookupList()
        .find((status) => status.id === rawData.employmentStatus);

      const finalPayload: IEmployeeForm = {
        ...rawData,
        gender: rawData.gender,
        emergencyContact: rawData.emergencyPhone,
        emergencyPhone: rawData.emergencyPhone,
        documents: rawData.attachedFiles,
        documentTypeId: rawData.documentTypeId,
        documentTypeName: selectedDocumentType?.displayName,
        documentExpiryDate: rawData.expiryDate || '',
        employmentStatusName: selectedEmploymentStatus?.displayName,
        probationPeriod: rawData.probationEndDate || '',
        basicSalary: Number(rawData.basicSalary) || 0,
        allowances: Number(rawData.allowances) || 0,
        deductions: Number(rawData.deductions) || 0,
        totalSalary: Number(rawData.totalSalary) || 0,
      };

      console.log('Sending Payload:', finalPayload);
      this.pendingPayload.set(finalPayload);
      this.isSubmitting.set(true);

      const request$ = this.isEditMode()
        ? this.employeeService.updateEmployee(this.employeeId(), finalPayload)
        : this.employeeService.createEmployee(finalPayload);

      request$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.pendingPayload.set(null);

            this.notificationService.show({
              type: 'success',
              isModal: false,
              title: this.isEditMode()
                ? 'COMMON.FORM_UPDATED'
                : 'EMPLOYEES.SUCCESS_ADD_TITLE',
              actionLabel: 'COMMON.GO_TO_LIST'
            });

            setTimeout(() => {
              this.router.navigate(['/core-hr/employees/view']);
            }, 1500);
          },
          error: (error) => {
            this.isSubmitting.set(false);

            if (this.handleSubmitError(error)) {
              this.pendingPayload.set(null);
              return;
            }

            const backendError = this.extractBackendError(error);

            this.notificationService.show({
              type: 'error',
              isModal: false,
              title: 'ERRORS.SAVE_FAILED',
              message: backendError.message,
              actionLabel: 'COMMON.OK'
            });

            this.pendingPayload.set(null);
          },
        });
    } else {
      this.onStepperClick(1);
      basic.mainForm.markAllAsTouched();
      console.error('Form is invalid', basic.mainForm.errors);
    }

  }

  navItems = [
    { id: 1, label: 'MENU.BASIC_INFO', anchor: 'basic-info' },
    { id: 2, label: 'MENU.DOCUMENTS', anchor: 'docs' }
  ];

  scrollTo(id: string, stepNumber: number) {
    this.activeSegment.set(stepNumber);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private handleSubmitError(error: unknown) {
    const basic = this.basicInfoComp();
    const backendError = this.extractBackendError(error);

    console.error('Employee submit failed:', {
      payload: this.pendingPayload(),
      error,
      backendError,
    });

    const handledFieldError = basic?.applySubmitFieldErrors(
      this.resolveFieldErrors(backendError),
    ) ?? false;

    if (!handledFieldError || !basic) {
      return false;
    }

    basic.submitted.set(true);
    basic.mainForm.markAllAsTouched();
    this.onStepperClick(1);

    return true;
  }

  private extractBackendError(error: unknown) {
    const layers = this.collectErrorLayers(error);
    const remoteError = this.findRemoteError(layers);
    const code = remoteError?.code || this.pickFirstString(layers.map((layer) => layer?.code)) || '';
    const message =
      remoteError?.message ||
      this.pickFirstString(layers.map((layer) => layer?.message)) ||
      'ERRORS.SERVER_ERROR_TRY_AGAIN';

    return {
      code,
      message,
      remoteError,
      raw: JSON.stringify(error ?? {}),
    };
  }

  private collectErrorLayers(error: unknown) {
    const layers: Array<any> = [];
    let current: any = error;

    for (let index = 0; index < 4 && current; index += 1) {
      layers.push(current);
      current = current?.error;
    }

    return layers;
  }

  private pickFirstString(values: unknown[]) {
    return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? '';
  }

  private findRemoteError(layers: Array<any>) {
    return layers.find((layer): layer is IRemoteServiceError =>
      typeof layer?.message === 'string' &&
      (
        typeof layer?.code === 'string' ||
        Array.isArray(layer?.validationErrors) ||
        layer?.data != null ||
        layer?.details != null
      ),
    );
  }

  private resolveFieldErrors(backendError: {
    code: string;
    message: string;
    remoteError?: IRemoteServiceError;
    raw: string;
  }): Partial<Record<'email' | 'phone' | 'nationalId', string>> {
    const fieldErrors: Partial<Record<'email' | 'phone' | 'nationalId', string>> = {};
    const validationErrors = backendError.remoteError?.validationErrors ?? [];

    validationErrors.forEach((validationError) => {
      const normalizedMembers = validationError.members.map((member) => member.toLowerCase());

      if (normalizedMembers.some((member) => member.includes('email'))) {
        fieldErrors.email = validationError.message;
      }

      if (
        normalizedMembers.some((member) =>
          member.includes('phone') || member.includes('mobile'),
        )
      ) {
        fieldErrors.phone = validationError.message;
      }

      if (
        normalizedMembers.some((member) =>
          member.includes('nationalid') || member.includes('national-id') || member.includes('national_id'),
        )
      ) {
        fieldErrors.nationalId = validationError.message;
      }
    });

    if (this.matchesEmailFieldError(backendError)) {
      fieldErrors.email = 'ERRORS.DUPLICATE_STAFF_EMAIL';
    }

    if (this.matchesPhoneFieldError(backendError)) {
      fieldErrors.phone = 'ERRORS.DUPLICATE_STAFF_PHONE';
    }

    if (!fieldErrors.nationalId && this.matchesNationalIdFieldError(backendError)) {
      fieldErrors.nationalId = backendError.message;
    }

    return fieldErrors;
  }

  private matchesEmailFieldError(backendError: { code: string; message: string; raw: string }) {
    return (
      backendError.code.includes('CoreHR:StaffEmailAlreadyExists') ||
      backendError.raw.includes('CoreHR:StaffEmailAlreadyExists') ||
      /email.*already used by another staff record/i.test(backendError.message)
    );
  }

  private matchesPhoneFieldError(backendError: { code: string; message: string; raw: string }) {
    return (
      backendError.code.includes('CoreHR:StaffPhoneAlreadyExists') ||
      backendError.code.includes('CoreHR:StaffMobileNumberAlreadyExists') ||
      backendError.raw.includes('CoreHR:StaffPhoneAlreadyExists') ||
      backendError.raw.includes('CoreHR:StaffMobileNumberAlreadyExists') ||
      /phone.*already used by another staff record/i.test(backendError.message) ||
      /mobile.*already used by another staff record/i.test(backendError.message)
    );
  }

  private matchesNationalIdFieldError(backendError: { code: string; message: string; raw: string }) {
    return (
      backendError.code.includes('NationalId') ||
      backendError.raw.includes('NationalId') ||
      /national\s*id.*already used/i.test(backendError.message) ||
      /national\s*id.*exists/i.test(backendError.message)
    );
  }

  private loadEmployee(employeeId: string) {
    this.isFetching.set(true);

    this.employeeService.getEmployeeById(employeeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employee) => {
          this.initialEmployee.set(employee);
          this.isFetching.set(false);
        },
        error: (error) => {
          console.error('Failed to load employee:', error);
          this.isFetching.set(false);
          this.router.navigate(['/core-hr/employees/view']);
        },
      });
  }

}
