import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, input, linkedSignal, output, signal } from '@angular/core';
import { INavItem } from '@core/models/inav-item';
import { NavigationService } from '@core/services/navigation-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeftFromLine,
  lucideArrowRightFromLine,
} from '@ng-icons/lucide';
import { SidebarItemComponent } from "@shared/components/molecules/sidebar-item-component/sidebar-item-component";
import { SidebarSubItemComponent } from "@shared/components/molecules/sidebar-sub-item-component/sidebar-sub-item-component";
@Component({
  selector: 'app-sidebar-component',
  imports: [SidebarItemComponent, TranslocoModule, NgIcon, SidebarSubItemComponent],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
  providers: [provideIcons({
    lucideArrowLeftFromLine,
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

  protected readonly menuItems = this.navService.filteredMenuItems;
  protected readonly isRtl = signal(this.document.documentElement.dir === 'rtl');

  protected readonly openItemId = linkedSignal<string | null>(() => {
    const url = this.navService.currentUrl() ?? ''; // حل مشكلة 'possibly undefined'
    return this.menuItems().find((item: INavItem) =>
      url.startsWith(item.path)
    )?.id || null;
  });

  protected readonly activeSubId = computed(() => {
    for (const item of this.navService.filteredMenuItems()) {
      const activeChild = item.children?.find((child: INavItem) =>
        this.navService.isActive(child.path),
      );
      if (activeChild) return activeChild.id;
    }
    return null;
  });

  toggleMenu(item: INavItem) {
  if (item.children && item.children.length > 0) {
    const isOpening = this.openItemId() !== item.id;

    this.openItemId.update(currentId => currentId === item.id ? null : item.id);

    if (isOpening) {
      const firstChildPath = item.children[0].path;
      this.navService.navigateTo(firstChildPath);
    }
  } else {
    this.navService.navigateTo(item.path);
  }
}

  handleSubItemClick(path: string) {
    this.navService.navigateTo(path);
  }

}
