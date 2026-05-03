import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-app-input-component',
  imports: [TranslocoModule, ReactiveFormsModule, NgIcon],
  templateUrl: './app-input-component.html',
  styleUrl: './app-input-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInputComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  label = input<string>('');
  placeholder = input<string>('');
  control = input.required<FormControl>();
  type = input<string>('text');
  isPassword = input<boolean>(false);
  readonly = input<boolean>(false);

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
  pastDateErrorKey = input<string>('ERRORS.DATE_CANNOT_BE_IN_PAST');
  dateRangeErrorKey = input<string>('ERRORS.END_DATE_MUST_BE_ON_OR_AFTER_START_DATE');

  constructor() {
    effect(() => {
      const control = this.control();

      control.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());

      control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());
    });
  }

  get errorMessage(): string | null {
    const ctrl = this.control();

    if (this.showErrors() && ctrl.invalid) {
      if (typeof ctrl.errors?.['backendMessage'] === 'string') return ctrl.errors['backendMessage'];
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['email']) return this.emailErrorKey();
      if (ctrl.errors?.['minlength']) return this.minLengthErrorKey();
      if (ctrl.errors?.['maxlength']) return this.maxLengthErrorKey();
      if (ctrl.errors?.['pattern']) return this.patternErrorKey();
      if (ctrl.errors?.['min']) return this.minErrorKey();
      if (ctrl.errors?.['duplicate']) return this.duplicateErrorKey();
      if (ctrl.errors?.['pastDate']) return this.pastDateErrorKey();
      if (ctrl.errors?.['dateRangeInvalid']) return this.dateRangeErrorKey();
    }

    return null;
  }

  get shouldTranslateErrorMessage() {
    return this.control().errors?.['backendMessage'] == null;
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
