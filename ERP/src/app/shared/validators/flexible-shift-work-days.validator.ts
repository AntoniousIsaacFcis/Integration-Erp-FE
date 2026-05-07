import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DayConfig } from '@features/attendance/models/iattendance';

export function flexibleShiftWorkDaysValidator(isFlexibleShift: () => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!isFlexibleShift()) {
      return null;
    }

    const days = control.value as DayConfig[] | null | undefined;

    if (!Array.isArray(days) || !days.length) {
      return { flexibleWorkDaysRequired: true };
    }

    const selectedDays = days.filter(day => day?.isWorkDay);
    if (!selectedDays.length) {
      return { flexibleWorkDaysRequired: true };
    }

    const hasMissingRequiredTime = selectedDays.some(day =>
      !day ||
      day.onDutyTimeOverride === null ||
      day.onDutyTimeOverride === undefined ||
      day.onDutyTimeOverride === '' ||
      day.offDutyTimeOverride === null ||
      day.offDutyTimeOverride === undefined ||
      day.offDutyTimeOverride === '' ||
      day.signInStartTimeOverride === null ||
      day.signInStartTimeOverride === undefined ||
      day.signInStartTimeOverride === '' ||
      day.signInEndTimeOverride === null ||
      day.signInEndTimeOverride === undefined ||
      day.signInEndTimeOverride === '' ||
      day.signOutStartTimeOverride === null ||
      day.signOutStartTimeOverride === undefined ||
      day.signOutStartTimeOverride === '' ||
      day.signOutEndTimeOverride === null ||
      day.signOutEndTimeOverride === undefined ||
      day.signOutEndTimeOverride === '' ||
      day.lateToleranceMinutes === null ||
      day.lateToleranceMinutes === undefined
    );

    return hasMissingRequiredTime ? { flexibleWorkDaysIncomplete: true } : null;
  };
}

export function getFlexibleShiftWorkDaysErrorKey(errors: ValidationErrors | null | undefined) {
  if (errors?.['flexibleWorkDaysRequired']) {
    return 'ERRORS.FLEXIBLE_SHIFT_REQUIRES_AT_LEAST_ONE_DAY';
  }

  if (errors?.['flexibleWorkDaysIncomplete']) {
    return 'ERRORS.FLEXIBLE_SHIFT_REQUIRES_COMPLETE_DAY_TIMES';
  }

  return null;
}
