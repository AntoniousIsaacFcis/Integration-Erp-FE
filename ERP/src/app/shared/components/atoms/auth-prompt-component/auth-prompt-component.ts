import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-auth-prompt-component',
  imports: [TranslocoModule,RouterLink],
  templateUrl: './auth-prompt-component.html',
  styleUrl: './auth-prompt-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPromptComponent {
message = input.required<string>();
actionText = input.required<string>();
route = input.required<string>();
linkColor = input<string>('text-primary');

prefetch = input<boolean>(true);//hydrate the next page when hove the link routing to it
}
