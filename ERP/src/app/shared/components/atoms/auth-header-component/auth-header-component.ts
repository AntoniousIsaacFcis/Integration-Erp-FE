import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-auth-header-component',
  imports: [TranslocoModule],
  templateUrl: './auth-header-component.html',
  styleUrl: './auth-header-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthHeaderComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
