import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IHeaderNavItem } from '@core/models/iheader-nav-item';
import { NavigationService } from '@core/services/navigation-service';
import { ThemeService } from '@core/services/theme-service';
import { TranslationService } from '@core/services/translation-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideCalendar, lucideLanguages, lucideLogOut, lucideMoon, lucideSearch, lucideSun } from '@ng-icons/lucide';
import { LogoutBtnComponent } from "@shared/components/atoms/logout-btn-component/logout-btn-component";
import { LanguageSwitcherComponent } from "@shared/components/molecules/language-switcher-component/language-switcher-component";
import { HeaderNotificationsComponent } from "@shared/components/molecules/header-notifications-component/header-notifications-component";
import { SearchbarComponent } from "@shared/components/molecules/searchbar-component/searchbar-component";
import { CompanyBrandComponent } from '@shared/components/molecules/company-brand-component/company-brand-component';
import { ProjectLogoComponent } from "@shared/components/molecules/project-logo-component/project-logo-component";


@Component({
  selector: 'app-header-component',
  imports: [NgOptimizedImage, TranslocoModule, NgIcon, LogoutBtnComponent, LanguageSwitcherComponent, HeaderNotificationsComponent, SearchbarComponent, CompanyBrandComponent, ProjectLogoComponent],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
  providers: [
    provideIcons({
      lucideSun,
      lucideMoon,
      lucideLogOut,
      lucideBell,
      lucideCalendar,
      lucideSearch,
      lucideLanguages
    })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {

  private translationService = inject(TranslationService);
  private readonly navService = inject(NavigationService);
  private readonly themeService = inject(ThemeService);
  protected readonly isMobileMenuOpen = signal(false);
  protected isDarkMode = this.themeService.isDarkMode;

  //local ui
  readonly searchQuery = signal('');
  readonly notificationCount = signal(3);

  readonly themeIconName = computed(() => (this.isDarkMode() ? 'lucideSun' : 'lucideMoon'));

  readonly headerNavItems = computed(() => [
    {
      id: '1',
      label: 'HEADER.NOTIFICATION',
      icon: 'ri-dashboard-line',
      route: '/notification'
    },
    {
      id: '2',
      label: 'HEADER.CALENDER',
      icon: 'ri-building-line',
      route: '/calender'
    },
    {
      id: '3',
      label: 'HEADER.COMPANY',
      icon: 'ri-group-line',
      route: '/company'
    }
  ]);
  currentLang = this.translationService.lang;

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
  toggleLanguage() {
    const nextLang = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.translationService.changeLanguage(nextLang);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    console.log('Logging out...');
  }
}
