import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INavItem } from '@core/models/inav-item';
import { NavigationService } from '@core/services/navigation-service';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideUsers,
  lucideSettings,
  lucideChevronDown,
  lucideChevronLeft,
  lucideBookmark
} from '@ng-icons/lucide';
@Component({
  selector: 'app-sidebar-component',
  imports: [RouterLink, TranslocoDirective,NgIcon],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
  providers: [provideIcons({
    lucideLayoutDashboard,
    lucideUsers,
    lucideSettings,
    lucideChevronDown,
    lucideChevronLeft,
    lucideBookmark
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SidebarComponent {
  protected readonly navService = inject(NavigationService);
  private readonly document = inject(DOCUMENT);

  protected readonly openItemId = signal<string | null>(null);
  protected readonly menuItems = this.navService.menuItems;
  protected readonly isRtl = signal(this.document.documentElement.dir === 'rtl');

  toggleMenu(item: INavItem, event: Event) {
  if (item.children && item.children.length > 0) {
    event.stopPropagation();

    this.openItemId.update(currentId => currentId === item.id ? null : item.id);
  }
}



}
