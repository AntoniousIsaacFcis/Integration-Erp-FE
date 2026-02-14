import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-form-cancel-button-component',
  imports: [TranslocoModule],
  templateUrl: './form-cancel-button-component.html',
  styleUrl: './form-cancel-button-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCancelButtonComponent {
  label = input<string>('COMMON.CANCEL');
  clicked = output<void>();
}
