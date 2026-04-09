import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-stepper-visual-component',
  imports: [TranslocoModule, NgIcon,TranslocoModule],
  templateUrl: './stepper-visual-component.html',
  styleUrl: './stepper-visual-component.css',
  providers: [provideIcons({ lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperVisualComponent {
  currentStep = input.required<number>();

  stepClick = output<number>();

  readonly steps = [
    { id: 1, label: 'MENU.PERSONAL_INFO', anchor: 'personal' },
    { id: 2, label: 'MENU.JOB_DATA', anchor: 'job' },
    { id: 3, label: 'MENU.SALARY', anchor: 'salary' },
    { id: 4, label: 'MENU.DOCUMENTS', anchor: 'docs' }
  ];

  onStepSelect(stepId: number) {
    this.stepClick.emit(stepId);
  }

}
