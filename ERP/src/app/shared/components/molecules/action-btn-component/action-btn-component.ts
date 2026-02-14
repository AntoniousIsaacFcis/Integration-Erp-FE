import { ChangeDetectionStrategy, Component, input, NgModule, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-action-btn-component',
  imports: [NgIcon, TranslocoModule],
  templateUrl: './action-btn-component.html',
  styleUrl: './action-btn-component.css',
  providers:[provideIcons({ lucidePlus })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionBtnComponent {
  label = input.required<string>();
  isLoading = input<boolean>(false);
  clicked = output<void>();
}
