
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AppValidators {
  static wordLimit(maxWords: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
     if (!value || typeof value !== 'string') return null;

      // Filter out empty strings from the split to get an accurate count
      const words = value.trim().split(/\s+/).filter(w => w.length > 0);
      
      return words.length > maxWords
        ? { maxWords: { actual: words.length, limit: maxWords } }
        : null;
    };
  }
}
