import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX, lucideTriangle } from '@ng-icons/lucide';
import { merge } from 'rxjs';

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
  patternErrorKey = input<string>('AUTH.INVALID_PATTERN');
  minErrorKey = input<string>('ERRORS.MIN_VALUE');

  get errorKey(): string | null {
    const ctrl = this.control();
    if (this.showErrors() && ctrl.invalid) {
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['email']) return this.emailErrorKey();
      if (ctrl.errors?.['minlength']) return this.minLengthErrorKey();
      if (ctrl.errors?.['pattern']) return this.patternErrorKey();
      if (ctrl.errors?.['min']) return this.minErrorKey();
    }
    return null;
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
