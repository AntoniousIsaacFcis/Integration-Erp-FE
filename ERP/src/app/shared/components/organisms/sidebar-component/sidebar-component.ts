import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, input, output, signal } from '@angular/core';
import { INavItem } from '@core/models/inav-item';
import { NavigationService } from '@core/services/navigation-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeftFromLine,
  lucideArrowRightFromLine,
} from '@ng-icons/lucide';
import { ProjectLogoComponent } from "@shared/components/molecules/project-logo-component/project-logo-component";
import { SidebarItemComponent } from "@shared/components/molecules/sidebar-item-component/sidebar-item-component";
@Component({
  selector: 'app-sidebar-component',
  imports: [ProjectLogoComponent, SidebarItemComponent, TranslocoModule, NgIcon],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
  providers: [provideIcons({
    lucideArrowLeftFromLine ,
    lucideArrowRightFromLine,
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SidebarComponent {
  protected readonly navService = inject(NavigationService);
  private readonly document = inject(DOCUMENT);

  isExpanded = input.required<boolean>();
  isCollapsed = input<boolean>(false);

  toggle = output<void>();

  protected readonly openItemId = signal<string | null>(null);
  protected readonly menuItems = this.navService.menuItems;
  protected readonly isRtl = signal(this.document.documentElement.dir === 'rtl');

  toggleMenu(item: INavItem) {
    if (item.children && item.children.length > 0) {
      this.openItemId.update(currentId => currentId === item.id ? null : item.id);
    }
  }



}
