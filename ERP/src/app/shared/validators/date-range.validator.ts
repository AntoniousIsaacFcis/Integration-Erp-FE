import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function dateRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startControlName);
    const end = group.get(endControlName);

    if (!start?.value || !end?.value) return null;

    const isInvalid = new Date(start.value) > new Date(end.value);

    if (isInvalid) {
      // حط الخطأ مباشرة على الـ Control عشان الـ Component يشوفه [cite: 2026-01-25]
      end.setErrors({ ...end.errors, dateRangeInvalid: true });
      return { dateRangeInvalid: true };
    } else {
      // شيل الخطأ لو الدنيا تمام مع الحفاظ على الأخطاء التانية (زي Required)
      if (end.hasError('dateRangeInvalid')) {
        const { dateRangeInvalid, ...remaining } = end.errors || {};
        end.setErrors(Object.keys(remaining).length ? remaining : null);
      }
      return null;
    }
  };
}
