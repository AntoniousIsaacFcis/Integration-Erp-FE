import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-app-radio-component',
  imports: [TranslocoModule,ReactiveFormsModule],
  templateUrl: './app-radio-component.html',
  styleUrl: './app-radio-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRadioComponent {
label = input<string>('');
  required = input<boolean>(false);
  control = input.required<FormControl>();
  options = input.required<{ label: string, value: any }[]>();
}
