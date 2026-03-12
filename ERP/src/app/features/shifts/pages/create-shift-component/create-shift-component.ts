import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { SelectBtnComponent } from "@shared/components/atoms/select-btn-component/select-btn-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttendanceService } from '@features/shifts/services/attendance-service';
import { NotificationService } from '@core/services/notification-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { WorkDaysGridComponent } from "@features/shifts/components/work-days-grid-component/work-days-grid-component";
import { TimeInputComponent } from "@shared/components/atoms/time-input-component/time-input-component";

@Component({
  selector: 'app-create-shift-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    AppInputComponent,
    FormContainerComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    AppSelectComponent,
    WorkDaysGridComponent,
    TimeInputComponent
],
  templateUrl: './create-shift-component.html',
  styleUrl: './create-shift-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateShiftComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private shiftService = inject(AttendanceService);
  private notification = inject(NotificationService);

  shiftTypeOptions = [
    { label: 'SHIFTS.TYPES.DAILY', value: 'daily' },
    { label: 'SHIFTS.TYPES.WEEKLY', value: 'weekly' }
  ];

  shiftForm = this.fb.group({
    name: ['', Validators.required],
    type: ['daily', Validators.required],
    workDays: [[]], // Array of day objects
    workStart: ['09:00', Validators.required],
    workEnd: ['17:00', Validators.required],
    checkInStart: ['08:00'],
    checkInEnd: ['10:00'],
    gracePeriod: [10]
  });

  private saveTrigger = signal<any | null>(null);

  saveResource = rxResource({
    params: () => this.saveTrigger(),
    stream: ({ params }) => {
      if (!params) return of(null);
      return this.shiftService.createShift(params);
    }
  });

  isLoading = computed(() => this.saveResource.isLoading());

  constructor() {
    effect(() => {
      const response = this.saveResource.value();
      const error = this.saveResource.error();

      if (response && !error) {
        this.notification.show({
          type: 'success',
          title: 'SHIFTS.SUCCESS_TITLE',
          actionLabel: 'COMMON.OK'
        });
        this.router.navigate(['/shifts']);
      }
    });
  }

  onSave() {
    if (this.shiftForm.valid) {
      this.saveTrigger.set(this.shiftForm.getRawValue());
    } else {
      this.shiftForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/shifts']);
  }
}
