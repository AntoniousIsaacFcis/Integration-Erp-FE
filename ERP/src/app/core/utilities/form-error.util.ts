import { FormControl } from '@angular/forms';

export interface IErrorKeys {
  required?: string;
  email?: string;
  minlength?: string;
  pattern?: string;
}

export function getControlError(ctrl: FormControl, showErrors: boolean, customKeys?: IErrorKeys): string | null {
  if (!showErrors || ctrl.valid) return null;

  const errors = ctrl.errors;
  if (!errors) return null;

  if (errors['required']) return customKeys?.required || 'AUTH.REQUIRED_FIELD';
  if (errors['email']) return customKeys?.email || 'AUTH.INVALID_EMAIL';
  if (errors['minlength']) return customKeys?.minlength || 'AUTH.MIN_LENGTH';
  if (errors['pattern']) return customKeys?.pattern || 'AUTH.INVALID_PATTERN';

  return Object.values(customKeys || {})[0] || 'AUTH.INVALID_FIELD';
}
