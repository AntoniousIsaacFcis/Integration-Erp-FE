import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-stepper-visual-component',
  imports: [TranslocoModule, NgIcon],
  templateUrl: './stepper-visual-component.html',
  styleUrl: './stepper-visual-component.css',
  providers: [provideIcons({ lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperVisualComponent {
  currentStep = input.required<number>();

  readonly steps = [
    { id: 1, label: 'MENU.PERSONAL_INFO' },
    { id: 2, label: 'MENU.JOB_DATA' },
    { id: 3, label: 'MENU.SALARY' },
    { id: 4, label: 'MENU.DOCUMENTS' }
  ];

}
