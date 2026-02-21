import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProjectLogoComponent } from "@shared/components/molecules/project-logo-component/project-logo-component";
import { LanguageSwitcherComponent } from "@shared/components/molecules/language-switcher-component/language-switcher-component";
import { TranslocoModule } from '@jsverse/transloco';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthHeaderComponent } from "@shared/components/atoms/auth-header-component/auth-header-component";
import { NotificationContainerComponent } from "@shared/components/organisms/notification-container-component/notification-container-component";

@Component({
  selector: 'app-login-layout-component',
  imports: [RouterOutlet, ProjectLogoComponent, LanguageSwitcherComponent, TranslocoModule, NgOptimizedImage, AuthHeaderComponent, NotificationContainerComponent],
  templateUrl: './login-layout-component.html',
  styleUrl: './login-layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginLayoutComponent {
  private route = inject(ActivatedRoute);

  title = computed(() => this.route.snapshot.firstChild?.data['title'] || 'AUTH.WELCOME_TITLE');
  subtitle = computed(() => this.route.snapshot.firstChild?.data['subtitle'] || 'AUTH.WELCOME_SUBTITLE');
}
