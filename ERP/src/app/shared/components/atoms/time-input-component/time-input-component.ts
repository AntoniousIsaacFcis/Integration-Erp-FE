import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock, lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-time-input-component',
  imports: [ReactiveFormsModule,TranslocoModule,NgIcon],
  templateUrl: './time-input-component.html',
  styleUrl: './time-input-component.css',
  providers:[provideIcons({ lucideClock, lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeInputComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
  showErrors = input<boolean>(false);
  placeHodler = input<string>('09:00');

  requiredErrorKey = input<string>('AUTH.REQUIRED_FIELD');

  openPicker(input: HTMLInputElement) {
    if (!this.control().disabled) {
      input.showPicker();
    }
  }

  get errorKey(): string | null {
    const ctrl = this.control();
    if (this.showErrors() && ctrl.invalid) {
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['timeRangeInvalid']) return 'ERRORS.INVALID_TIME_RANGE';
    }
    return null;
  }
}
