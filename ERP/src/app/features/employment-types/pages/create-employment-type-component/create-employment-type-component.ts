import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmploymentTypesService } from '@features/employment-types/services/employment-types-service';
import { TranslocoModule } from '@jsverse/transloco';
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { AppRadioComponent } from "@shared/components/atoms/app-radio-component/app-radio-component";

@Component({
  selector: 'app-create-employment-type-component',
  imports: [TranslocoModule, ActionBtnComponent, ReactiveFormsModule, AppRadioComponent],
  templateUrl: './create-employment-type-component.html',
  styleUrl: './create-employment-type-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEmploymentTypeComponent {
  private readonly _employeeTypesService = inject(EmploymentTypesService);
  private readonly router = inject(Router);

  // Form Signals
  employmentTypeAr = signal('');
  employmentTypeEn = signal<'active' | 'inactive'>('active');
  description = signal('');
  isSubmitting = signal(false);

  EmployeeTypesForm = new FormGroup({
    employmentTypeAr: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<'active' | 'inactive'>('active', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true })
  });

  handleSave() {
    if (this.EmployeeTypesForm.invalid) return;

    this.isSubmitting.set(true);
    const rawValue = this.EmployeeTypesForm.getRawValue();

    this._employeeTypesService.create({
      ...rawValue,
      employmentTypeEn: rawValue.employmentTypeAr // Mapping logic
    }).subscribe({
      next: () => this.router.navigate(['/job-levels/view']),
      error: () => this.isSubmitting.set(false)
    });
  }

  cancel() {
    this.router.navigate(['/job-levels/view']);
  }
}
