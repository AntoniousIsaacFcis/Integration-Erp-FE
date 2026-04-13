import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-app-textarea-component',
  imports: [TranslocoModule, ReactiveFormsModule, NgIcon],
  templateUrl: './app-textarea-component.html',
  styleUrl: './app-textarea-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTextareaComponent {
  label = input<string>('');
  placeholder = input<string>('');
  control = input.required<FormControl>();
  showErrors = input<boolean>(false);

  requiredErrorKey = input<string>('AUTH.REQUIRED_FIELD');
  maxWordsErrorKey = input<string>('ERRORS.MAX_WORDS');
  maxCharactersErrorKey = input<string>('ERRORS.MAX_CHARACTERS');

  get errorKey(): string | null {
    const ctrl = this.control();
    if (this.showErrors() && ctrl.invalid) {
      if (ctrl.errors?.['required']) return this.requiredErrorKey();
      if (ctrl.errors?.['maxWords']) return this.maxWordsErrorKey();
      if (ctrl.errors?.['maxCharacters']) return this.maxCharactersErrorKey();
    }
    return null;
  }
}
