import { ChangeDetectionStrategy, Component, input, NgModule, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCirclePlus, lucideCircleX, lucideCloudUpload, lucidePlus, lucideUserPlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-action-btn-component',
  imports: [NgIcon, TranslocoModule],
  templateUrl: './action-btn-component.html',
  styleUrl: './action-btn-component.css',
  providers: [provideIcons({ lucideCirclePlus, lucideCircleX, lucideUserPlus, lucideCloudUpload, lucideCheckCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionBtnComponent {
  label = input.required<string>();
  iconName = input<string>('lucideCirclePlus');
  isLoading = input<boolean>(false);
  clicked = output<void>();
}
