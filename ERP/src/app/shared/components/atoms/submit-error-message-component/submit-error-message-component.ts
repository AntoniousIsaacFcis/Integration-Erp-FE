import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-submit-error-message-component',
  imports: [NgIcon,TranslocoModule],
  templateUrl: './submit-error-message-component.html',
  styleUrl: './submit-error-message-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitErrorMessageComponent {
message = input.required<string>();
}
