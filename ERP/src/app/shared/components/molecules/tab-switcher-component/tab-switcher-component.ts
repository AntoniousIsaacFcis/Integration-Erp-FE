import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

export interface ITabItem {
  id: string | number;
  label: string;
}

@Component({
  selector: 'app-tab-switcher-component',
  imports: [TranslocoModule],
  templateUrl: './tab-switcher-component.html',
  styleUrl: './tab-switcher-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabSwitcherComponent {
  tabs = input.required<ITabItem[]>();
activeId = input.required<string | number>();
tabClick = output<any>();

}
