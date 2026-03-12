import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-input-component',
  imports: [ReactiveFormsModule],
  templateUrl: './time-input-component.html',
  styleUrl: './time-input-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeInputComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
}
