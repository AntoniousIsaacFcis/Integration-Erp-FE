import { ResourceStatus, ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FormBuilder } from '@angular/forms';
import { EmployeeBasicInfoComponent } from "./employee-basic-info-component/employee-basic-info-component";
import { StepperVisualComponent } from "./stepper-visual-component/stepper-visual-component";
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { IEmployeeForm } from '@features/employees/models/iemployee';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { EmployeeService } from '@features/employees/services/employee-service';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';

@Component({
  selector: 'app-add-employee-component',
  imports: [TranslocoModule, EmployeeBasicInfoComponent, StepperVisualComponent, FormContainerComponent, FormSaveButtonComponent],
  templateUrl: './add-employee-component.html',
  styleUrl: './add-employee-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEmployeeComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  activeSegment = signal(1);
  private saveTrigger = signal<IEmployeeForm | null>(null);
  basicInfoComp = viewChild(EmployeeBasicInfoComponent);

  saveResource = rxResource({
    params: () => this.saveTrigger(),
    stream: ({ params }) => {
      if (!params) return of(null);
      return this.employeeService.createEmployee(params);
    }
  });

  isLoading = computed(() => this.saveResource.isLoading());

  constructor() {
    effect(() => {
      const loading = this.isLoading();
      const response = this.saveResource.value();
      const error = this.saveResource.error();

      if (!loading && response && !error) {
        this.notificationService.show({
          type: 'success',
          isModal: true,
          title: 'EMPLOYEES.SUCCESS_ADD_TITLE',
          // message: 'EMPLOYEES.SUCCESS_ADD_MSG',
          actionLabel: 'COMMON.GO_TO_LIST'
        });

        setTimeout(() => {
          // this.notificationService.dismissAll();
          this.router.navigate(['/employees/view']);
          this.saveTrigger.set(null);
        }, 1500);
      }

      if (!loading && error) {
        this.notificationService.show({
          type: 'error',
          isModal: false,
          title: 'ERRORS.SAVE_FAILED',
          message: 'ERRORS.SERVER_ERROR_TRY_AGAIN',
          actionLabel: 'COMMON.OK'
        });

        this.saveTrigger.set(null);
      }
    });
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

    if (basic.mainForm.valid) {
      const rawData = basic.mainForm.getRawValue();

      const finalPayload: IEmployeeForm = {
        ...rawData,
        emergencyContact: rawData.emergencyPhone,
        documents: rawData.attachedFiles,
        status: rawData.employmentStatus || 'active',
        probationPeriod: rawData.probationEndDate || '',
        basicSalary: Number(rawData.basicSalary) || 0,
      } as IEmployeeForm;

      console.log('Sending Payload:', finalPayload);
      this.saveTrigger.set(finalPayload);
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

}
