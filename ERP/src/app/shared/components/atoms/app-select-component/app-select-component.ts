import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideOctagonX } from '@ng-icons/lucide';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-app-select-component',
  imports: [TranslocoModule,ReactiveFormsModule,NgIcon],
  templateUrl: './app-select-component.html',
  styleUrl: './app-select-component.css',
  providers:[provideIcons({lucideOctagonX,lucideChevronDown})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSelectComponent {
  label = input<string>('');
  placeholder = input<string>('');
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

  private controlValue = computed(() =>
    toSignal(this.control().valueChanges.pipe(startWith(this.control().value)))
  );

  isValueEmpty = computed(() => !this.controlValue()?.());
}
