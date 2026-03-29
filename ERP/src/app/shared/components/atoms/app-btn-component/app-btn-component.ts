import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-app-btn-component',
  imports: [TranslocoDirective],
  templateUrl: './app-btn-component.html',
  styleUrl: './app-btn-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBtnComponent {
label = input.required<string>();
disabled = input<boolean>(false);
type = input<'button' | 'submit'>('submit');
}
