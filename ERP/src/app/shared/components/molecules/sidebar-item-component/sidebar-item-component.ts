import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { INavItem } from '@core/models/inav-item';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlignEndVertical, lucideAlignVerticalSpaceAround, lucideBookmark, lucideBuilding2, lucideCalendar, lucideChevronDown, lucideChevronLeft, lucideChevronRight, lucideClock3, lucideLayoutDashboard, lucideSettings, lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-sidebar-item-component',
  imports: [NgIcon,TranslocoModule],
  templateUrl: './sidebar-item-component.html',
  styleUrl: './sidebar-item-component.css',
  providers: [provideIcons({
    lucideChevronDown,
    lucideChevronLeft,
    lucideChevronRight, lucideLayoutDashboard,
    lucideUsers,
    lucideSettings,
    lucideBookmark,
    lucideBuilding2,
    lucideAlignEndVertical,
    lucideClock3,
    lucideCalendar
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarItemComponent {
  item = input.required<INavItem>();
  isExpanded = input.required<boolean>();
  isActive = input<boolean>(false);
  isRtl = input<boolean>(true);
  isChild = input<boolean>(false);

  onToggle = output<void>();

  handleToggle() {
  if (!this.item().children || this.item().children?.length === 0) {
    console.log('No sub items added');
    return;
  }
  this.onToggle.emit();
}
}
