import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-app-date-input-component',
  imports: [TranslocoModule, ReactiveFormsModule, NgIcon],
  templateUrl: './app-date-input-component.html',
  styleUrl: './app-date-input-component.css',
  providers:[provideIcons({lucideOctagonX,lucideCalendar})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDateInputComponent {
label = input<string>('');
control = input.required<FormControl>();
  showErrors = input<boolean>(false);

  requiredErrorKey = input<string>('AUTH.REQUIRED_FIELD')
  emailErrorKey = input<string>('AUTH.INVALID_EMAIL');
  minLengthErrorKey = input<string>('AUTH.MIN_LENGTH');

  get errorKey(): string | null {
    const ctrl = this.control();
    if (this.showErrors() && ctrl.invalid) {
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['email']) return this.emailErrorKey();
      if (ctrl.errors?.['minlength']) return this.minLengthErrorKey();
      if (ctrl.errors?.['pattern']) return 'AUTH.INVALID_PATTERN';
    }
    return null;
  }

}
