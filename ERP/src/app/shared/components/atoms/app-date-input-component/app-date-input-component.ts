import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideOctagonX } from '@ng-icons/lucide';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-app-date-input-component',
  imports: [TranslocoModule, ReactiveFormsModule, NgIcon],
  templateUrl: './app-date-input-component.html',
  styleUrl: './app-date-input-component.css',
  providers: [provideIcons({ lucideOctagonX, lucideCalendar })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDateInputComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  label = input<string>('');
  control = input.required<FormControl>();
  showErrors = input<boolean>(false);

  requiredErrorKey = input<string>('AUTH.REQUIRED_FIELD')
  emailErrorKey = input<string>('AUTH.INVALID_EMAIL');
  minLengthErrorKey = input<string>('AUTH.MIN_LENGTH');
  dateRangeErrorKey = input<string>('ERRORS.START_DATE_MUST_BE_BEFORE_END_DATE');
  futureDateErrorKey = input<string>('ERRORS.FUTURE_DATE_NOT_ALLOWED');
  pastDateErrorKey = input<string>('ERRORS.DATE_CANNOT_BE_IN_PAST');

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

  get errorKey(): string | null {
    const ctrl = this.control();
    if (this.showErrors() && ctrl.invalid) {
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['email']) return this.emailErrorKey();
      if (ctrl.errors?.['minlength']) return this.minLengthErrorKey();
      if (ctrl.errors?.['pattern']) return 'AUTH.INVALID_PATTERN';
      if (ctrl.errors?.['dateRangeInvalid']) return this.dateRangeErrorKey();
      if (ctrl.errors?.['pastDate']) return this.pastDateErrorKey();
      if (ctrl.errors?.['futureBirthDate']) return this.futureDateErrorKey();

    }
    return null;
  }

}
