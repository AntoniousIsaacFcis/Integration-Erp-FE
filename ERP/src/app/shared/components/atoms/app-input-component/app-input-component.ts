import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-app-input-component',
  imports: [TranslocoModule, ReactiveFormsModule, NgIcon],
  templateUrl: './app-input-component.html',
  styleUrl: './app-input-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInputComponent {
  label = input<string>('');
  placeholder = input<string>('');
  control = input.required<FormControl>();
  type = input<string>('text');
  isPassword = input<boolean>(false);

  showErrors = input<boolean>(false);
  showPassword = signal<boolean>(false);

  //for autocomplete
  name = input<string>('');
  autocomplete = input<string>('on');

  requiredErrorKey = input<string>('AUTH.REQUIRED_FIELD')
  emailErrorKey = input<string>('AUTH.INVALID_EMAIL');
  minLengthErrorKey = input<string>('AUTH.MIN_LENGTH');
  maxLengthErrorKey = input<string>('AUTH.MAX_LENGTH');
  patternErrorKey = input<string>('AUTH.INVALID_PATTERN');
  minErrorKey = input<string>('ERRORS.MIN_VALUE');
  duplicateErrorKey = input<string>('ERRORS.DUPLICATE_VALUE');

  get errorKey(): string | null {
    const ctrl = this.control();
    if (this.showErrors() && ctrl.invalid) {
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['email']) return this.emailErrorKey();
      if (ctrl.errors?.['minlength']) return this.minLengthErrorKey();
      if (ctrl.errors?.['maxlength']) return this.maxLengthErrorKey();
      if (ctrl.errors?.['pattern']) return this.patternErrorKey();
      if (ctrl.errors?.['min']) return this.minErrorKey();
      if (ctrl.errors?.['duplicate']) return this.duplicateErrorKey();
    }
    return null;
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
