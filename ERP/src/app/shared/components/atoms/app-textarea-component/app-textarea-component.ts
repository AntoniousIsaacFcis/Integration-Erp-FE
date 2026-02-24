import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-app-textarea-component',
  imports: [TranslocoModule, ReactiveFormsModule],
  templateUrl: './app-textarea-component.html',
  styleUrl: './app-textarea-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTextareaComponent {
  label = input<string>('');
  placeholder = input<string>('');
  control = input.required<FormControl>();
}
