import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICustomShiftForm } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { Router } from '@angular/router';
import { dateRangeValidator } from '@shared/validators/date-range.validator';

@Component({
  selector: 'app-create-special-shift-component',
  imports: [FormContainerComponent, AppInputComponent, AppDateInputComponent, AppSelectComponent, FormSaveButtonComponent, ReactiveFormsModule,
    TranslocoModule, NgIcon, FormCancelButtonComponent],
  templateUrl: './create-special-shift-component.html',
  styleUrl: './create-special-shift-component.css',
  providers: [
    provideIcons({ lucideSearch, lucideX })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateSpecialShiftComponent {
private fb = inject(FormBuilder);
  private router = inject(Router);

  private attendanceService = inject(AttendanceService);

  submitted = signal(false);
  saveTrigger = signal<ICustomShiftForm | null>(null);


  mainForm = this.fb.nonNullable.group({
    shiftName: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    assignedShiftId: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    status: ['active', [Validators.required]],
    assignmentMethod: ['auto', [Validators.required]],
    departmentId: ['', [Validators.required]],
    jobTitleId: ['', [Validators.required]],
    excludedEmployeeIds: [[] as string[]]
  }, {
    validators: [dateRangeValidator('startDate', 'endDate')]
  });

  saveResource = rxResource({
    params: () => this.saveTrigger(),
    stream: ({ params }) => params ? this.attendanceService.createShift(params) : of(null)
  });

  onSave() {
    this.submitted.set(true);
    if (this.mainForm.valid) {
      const rawData = this.mainForm.getRawValue();
      const payload = rawData as unknown as ICustomShiftForm;

      this.saveTrigger.set(payload);

      this.router.navigate(['attendance/special']);
    }
  }

  getControl(name: string): FormControl {
    return this.mainForm.get(name) as FormControl;
  }

  //for exclude employees input
  selectedEmployees = signal([
    { id: '1', name: 'علي محمود' },
    { id: '2', name: 'أحمد علي' },
    { id: '3', name: 'حمادة العليلي' }
  ]);

  searchControl = new FormControl('');
  removeEmployee(id: string) {
    const updated = this.selectedEmployees().filter(e => e.id !== id);
    this.selectedEmployees.set(updated);

  }

  onCancel() {
    this.router.navigate(['attendance/special']);
  }
}
