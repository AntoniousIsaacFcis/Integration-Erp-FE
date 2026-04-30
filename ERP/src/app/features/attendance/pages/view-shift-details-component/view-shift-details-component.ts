import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { WorkDaysGridComponent } from '@features/attendance/components/work-days-grid-component/work-days-grid-component';
import { DayConfig, IShift, IShiftDay } from '@features/attendance/models/iattendance';
import { AttendanceService } from '@features/attendance/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { TimeInputComponent } from '@shared/components/atoms/time-input-component/time-input-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-view-shift-details-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    FormSaveButtonComponent,
    AppInputComponent,
    AppSelectComponent,
    AppRadioComponent,
    TimeInputComponent,
    WorkDaysGridComponent,
  ],
  templateUrl: './view-shift-details-component.html',
  styleUrl: './view-shift-details-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewShiftDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly shiftService = inject(AttendanceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbService = inject(BreadcrumbService);

  private readonly shiftId = this.route.snapshot.paramMap.get('id') ?? '';

  isLoading = signal(true);
  initialDays = signal<IShiftDay[] | null>(null);

  shiftTypeOptions = [
    { label: 'SHIFT.TYPES.STANDARD', value: 1 },
    { label: 'SHIFT.TYPES.FLEXIBLE', value: 2 },
  ];

  shiftForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    type: this.fb.nonNullable.control({ value: 1, disabled: true }),
    workDays: this.fb.nonNullable.control([] as DayConfig[]),
    workStart: this.fb.nonNullable.control({ value: '', disabled: true }),
    workEnd: this.fb.nonNullable.control({ value: '', disabled: true }),
    checkInStart: this.fb.nonNullable.control({ value: '', disabled: true }),
    checkInEnd: this.fb.nonNullable.control({ value: '', disabled: true }),
    checkOutStart: this.fb.nonNullable.control({ value: '', disabled: true }),
    checkOutEnd: this.fb.nonNullable.control({ value: '', disabled: true }),
    gracePeriod: this.fb.nonNullable.control({ value: 0, disabled: true }),
    status: this.fb.nonNullable.control<'active' | 'inactive'>({ value: 'active', disabled: true }),
  });

  private readonly shiftTypeValue = toSignal(
    this.shiftForm.controls.type.valueChanges.pipe(startWith(this.shiftForm.controls.type.value)),
  );
  isFlexibleShift = computed(() => Number(this.shiftTypeValue()) === 2);

  constructor() {
    this.loadShift();
  }

  goBack() {
    this.router.navigate(['/attendance/view']);
  }

  private loadShift() {
    if (!this.shiftId) {
      this.goBack();
      return;
    }

    this.shiftService.getShiftById(this.shiftId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: shift => {
          this.patchForm(shift);
          this.breadcrumbService.setCurrentBreadcrumbLabel(shift.name, this.route);
          this.isLoading.set(false);
        },
        error: () => {
          this.goBack();
        },
      });
  }

  private patchForm(shift: IShift) {
    this.shiftForm.patchValue({
      name: shift.name ?? '',
      type: Number(shift.type),
      workStart: this.toTimeInputValue(shift.onDutyTime),
      workEnd: this.toTimeInputValue(shift.offDutyTime),
      checkInStart: this.toTimeInputValue(shift.signInStartTime),
      checkInEnd: this.toTimeInputValue(shift.signInEndTime),
      checkOutStart: this.toTimeInputValue(shift.signOutStartTime),
      checkOutEnd: this.toTimeInputValue(shift.signOutEndTime),
      gracePeriod: shift.lateToleranceMinutes ?? 0,
      status: this.toStatus(shift),
    });

    this.initialDays.set(shift.days ?? []);
  }

  private toStatus(shift: IShift) {
    return shift.isActive || shift.status === 'active' ? 'active' : 'inactive';
  }

  private toTimeInputValue(value?: string | null) {
    return value ? value.slice(0, 5) : '';
  }
}
