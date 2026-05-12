import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { INavItem } from '@core/models/inav-item';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlignEndVertical, lucideAlignVerticalSpaceAround, lucideBadgeCheck, lucideBookmark, lucideBuilding2, lucideCalendar, lucideChevronDown, lucideChevronLeft, lucideChevronRight, lucideClock3, lucideLayoutDashboard, lucideList, lucidePlus, lucideSettings, lucideUsers } from '@ng-icons/lucide';

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
    lucideCalendar,
    lucideList,
    lucideBadgeCheck,
    lucidePlus
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
    this.onToggle.emit();
  }
}
