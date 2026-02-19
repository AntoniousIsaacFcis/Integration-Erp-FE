
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AppValidators {
  static wordLimit(maxWords: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const words = value.trim().split(/\s+/);
      return words.length > maxWords
        ? { maxWords: { actual: words.length, limit: maxWords } }
        : null;
    };
  }
}
