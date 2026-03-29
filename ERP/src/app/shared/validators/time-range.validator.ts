import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function timeRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startControl = group.get(startControlName);
    const endControl = group.get(endControlName);

    if (!startControl || !endControl) return null;

    const currentErrors = endControl.errors ?? {};
    const clearTimeRangeError = () => {
      if (!('timeRangeInvalid' in currentErrors)) return;

      const { timeRangeInvalid, ...remainingErrors } = currentErrors;
      void timeRangeInvalid;
      endControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    };

    if (!startControl.value || !endControl.value) {
      clearTimeRangeError();
      return null;
    }

    if (startControl.value >= endControl.value) {
      endControl.setErrors({ ...currentErrors, timeRangeInvalid: true });
      return { timeRangeInvalid: true };
    }

    clearTimeRangeError();

    return null;
  };
}
