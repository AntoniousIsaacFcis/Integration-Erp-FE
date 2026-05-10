import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/notification-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlusCircle, lucideTrash2 } from '@ng-icons/lucide';
import { HolidayListsService } from '@features/settings/services/holiday-lists-service';
import { IUpdateHolidayList } from '@features/settings/models/iholiday-list';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppDateInputComponent } from '@shared/components/atoms/app-date-input-component/app-date-input-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';

type HolidayDayFormValue = {
  date: string;
  title: string;
};

@Component({
  selector: 'app-edit-holiday-list-component',
  standalone: true,
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppDateInputComponent,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    NgIcon,
  ],
  templateUrl: './edit-holiday-list-component.html',
  styleUrl: './edit-holiday-list-component.css',
  providers: [provideIcons({ lucidePlusCircle, lucideTrash2 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditHolidayListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(HolidayListsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly nameMaxLength = 200;
  readonly dayTitleMaxLength = 256;

  private holidayListId = '';

  isLoading = signal(true);
  isSubmitting = signal(false);
  submitted = signal(false);

  private readonly duplicateDatesValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const dates = array.controls
      .map((dayControl) => String(dayControl.get('date')?.value ?? '').trim())
      .filter((date) => !!date);

    return new Set(dates).size !== dates.length ? { duplicateDates: true } : null;
  };

  holidayListForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(this.nameMaxLength)]],
    calculateAttendanceOnOffDays: [false],
    days: this.fb.array([], { validators: [this.duplicateDatesValidator] }),
  });

  get daysArray(): FormArray {
    return this.holidayListForm.controls.days as FormArray;
  }

  getDayControl(index: number, field: keyof HolidayDayFormValue): any {
    return (this.daysArray.at(index) as FormGroup).controls[field] as any;
  }

  ngOnInit() {
    this.holidayListId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.holidayListId) {
      this.router.navigate(['/settings/holiday-lists']);
      return;
    }

    this.service
      .getById(this.holidayListId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (holidayList) => {
          this.holidayListForm.patchValue({
            name: holidayList.name,
            calculateAttendanceOnOffDays: holidayList.calculateAttendanceOnOffDays,
          });

          this.daysArray.clear();
          const days = holidayList.days.length ? holidayList.days : [{ date: '', title: '' }];
          days.forEach((day) => this.daysArray.push(this.createDayGroup(day)));
          this.daysArray.updateValueAndValidity();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load holiday list:', error);
          this.isLoading.set(false);
          this.router.navigate(['/settings/holiday-lists']);
        },
      });
  }

  addDay() {
    this.daysArray.push(this.createDayGroup());
    this.daysArray.updateValueAndValidity();
  }

  removeDay(index: number) {
    this.daysArray.removeAt(index);
    this.daysArray.updateValueAndValidity();
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) {
      return;
    }

    this.submitted.set(true);
    this.normalizeStringFields();
    this.holidayListForm.updateValueAndValidity();

    if (this.holidayListForm.invalid) {
      this.holidayListForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const rawValue = this.holidayListForm.getRawValue();
    const days = rawValue.days as HolidayDayFormValue[];
    const payload: IUpdateHolidayList = {
      name: rawValue.name.trim(),
      calculateAttendanceOnOffDays: rawValue.calculateAttendanceOnOffDays,
      days: days.map((day) => ({
        date: day.date.trim(),
        title: day.title.trim(),
      })),
    };

    this.service
      .update(this.holidayListId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitted.set(false);
          this.notification.show({
            type: 'success',
            title: 'COMMON.MESSAGES.SAVED_SUCCESSFULLY',
            actionLabel: 'COMMON.OK',
          });
          this.router.navigate(['/settings/holiday-lists']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.notification.show({
            type: 'error',
            title: 'COMMON.MESSAGES.OPERATION_FAILED',
            message: this.getErrorMessage(error),
            isModal: false,
            actionLabel: 'COMMON.CONFIRM',
          });
        },
      });
  }

  onCancel() {
    this.router.navigate(['/settings/holiday-lists']);
  }

  get hasDuplicateDates() {
    return !!this.daysArray.errors?.['duplicateDates'];
  }

  private createDayGroup(day: Partial<HolidayDayFormValue> = {}) {
    return this.fb.nonNullable.group({
      date: [day.date ?? '', [Validators.required]],
      title: [day.title ?? '', [Validators.required, Validators.maxLength(this.dayTitleMaxLength)]],
    });
  }

  private normalizeStringFields() {
    const controls = this.holidayListForm.controls;

    const name = controls.name.value.trim();
    if (controls.name.value !== name) {
      controls.name.setValue(name);
    }

    this.daysArray.controls.forEach((dayControl) => {
      const titleControl = (dayControl as FormGroup).controls['title'];
      const normalizedTitle = String(titleControl.value ?? '').trim();
      if (titleControl.value !== normalizedTitle) {
        titleControl.setValue(normalizedTitle);
      }
    });
  }

  private getErrorMessage(error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error
      ? (error as { message?: unknown }).message
      : null;

    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'COMMON.MESSAGES.PLEASE_TRY_AGAIN';
  }
}
