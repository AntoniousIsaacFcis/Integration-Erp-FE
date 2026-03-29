import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { IDocument } from "@shared/models/idocument";

export function fileValidation(maxSizeMb: number, allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = control.value as IDocument[];
    if (!files || files.length === 0) return null;

    const invalidFiles = files.filter(f =>
      f.size > maxSizeMb * 1024 * 1024 || !allowedTypes.includes(f.type)
    );

    return invalidFiles.length > 0 ? { invalidFiles: true } : null;
  };
}
