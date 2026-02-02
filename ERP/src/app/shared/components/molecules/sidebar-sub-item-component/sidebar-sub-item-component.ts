import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { INavItem } from '@core/models/inav-item';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-sidebar-sub-item-component',
  imports: [TranslocoModule],
  templateUrl: './sidebar-sub-item-component.html',
  styleUrl: './sidebar-sub-item-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarSubItemComponent {
  item = input.required<INavItem>();
  isActive = input<boolean>(false);
  onSelect = output<void>();
}
