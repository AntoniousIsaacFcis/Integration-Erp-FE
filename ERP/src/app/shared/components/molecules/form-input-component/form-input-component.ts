import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from "@jsverse/transloco";
import { map, merge, startWith } from 'rxjs';

@Component({
  selector: 'app-form-input-component',
  imports: [ReactiveFormsModule, TranslocoDirective],
  templateUrl: './form-input-component.html',
  styleUrl: './form-input-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class FormInputComponent {
  label = input.required<string>();
  placeholder = input<string>('');
  required = input<boolean>(false);
  control = input.required<FormControl>();
  inputRows = input<number>(1);

  private manualTrigger = signal(0);

  errorMessage = computed(() => {
    const ctrl = this.control();
    this.manualTrigger();

    if (!ctrl || !ctrl.touched || ctrl.valid) return null;

    if (ctrl.errors?.['required']) return 'VALIDATION.REQUIRED';
    if (ctrl.errors?.['maxWords']) return 'VALIDATION.MAX_WORDS_LIMIT';

    return null;
  });

  updateValidationState() {
    this.manualTrigger.update(v => v + 1);
  }
}
