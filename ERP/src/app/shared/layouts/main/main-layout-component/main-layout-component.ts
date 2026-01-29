import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/organisms/header/header-component';
import { SidebarComponent } from '@shared/components/organisms/sidebar-component/sidebar-component';
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { LogoutBtnComponent } from "@shared/components/atoms/logout-btn-component/logout-btn-component";
import { HeaderNotificationsComponent } from '@shared/components/molecules/header-notifications-component/header-notifications-component';
import { LanguageSwitcherComponent } from "@shared/components/molecules/language-switcher-component/language-switcher-component";
import { SearchbarComponent } from "@shared/components/molecules/searchbar-component/searchbar-component";




@Component({
  selector: 'app-main-layout-component',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet, StatusBadgeComponent, LogoutBtnComponent, HeaderNotificationsComponent, LanguageSwitcherComponent, SearchbarComponent],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class MainLayoutComponent {

}
