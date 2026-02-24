import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IEmployeeForm } from '@features/employees/models/iemployee-form';
import { StepperVisualComponent } from "./stepper-visual-component/stepper-visual-component";
import { PersonalComponent } from "./personal-component/personal-component";
import { JobDetailsComponent } from "./job-details-component/job-details-component";
import { SalaryComponent } from "./salary-component/salary-component";
import { DocumentsComponent } from "./documents-component/documents-component";
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-add-employee-component',
  imports: [StepperVisualComponent, PersonalComponent, JobDetailsComponent, SalaryComponent, DocumentsComponent,TranslocoModule],
  templateUrl: './add-employee-component.html',
  styleUrl: './add-employee-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEmployeeComponent {
  currentStep = signal(1);
  isLoading = signal(false);

  masterData = signal<Partial<IEmployeeForm>>({});

  steps = [
    { id: 1, label: 'MENU.PERSONAL_INFO', icon: 'lucideUser' },
    { id: 2, label: 'MENU.JOB_DATA', icon: 'lucideBriefcase' },
    { id: 3, label: 'MENU.SALARY', icon: 'lucideBanknote' },
    { id: 4, label: 'MENU.DOCUMENTS', icon: 'lucideFileText' }
  ];

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === 4);

  onStepComplete(data: any) {
    this.masterData.update(prev => ({ ...prev, ...data }));
    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    this.currentStep.update(s => Math.max(1, s - 1));
  }

  async onFinalSubmit(docs: any) {
    this.isLoading.set(true);
    const finalPayload = { ...this.masterData(), documents: docs };

    // ملاحظة: هنا سيتم استدعاء rxResource لعمل POST [cite: 2026-01-25]
    console.log('Sending to Server:', finalPayload);
  }
}
