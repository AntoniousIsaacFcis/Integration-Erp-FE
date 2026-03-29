import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-form-save-button-component',
  imports: [TranslocoModule],
  templateUrl: './form-save-button-component.html',
  styleUrl: './form-save-button-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSaveButtonComponent {
  label = input<string>('COMMON.SAVE');
  isLoading = input<boolean>(false);
  isDisabled = input<boolean>(false);
  clicked = output<void>();
}
