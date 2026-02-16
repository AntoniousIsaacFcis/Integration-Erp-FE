import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginFormComponent } from "@features/auth/pages/login-form-component/login-form-component";
import { ProjectLogoComponent } from "@shared/components/molecules/project-logo-component/project-logo-component";
import { LanguageSwitcherComponent } from "@shared/components/molecules/language-switcher-component/language-switcher-component";
import { TranslocoModule } from '@jsverse/transloco';
import { NgOptimizedImage } from '@angular/common';
import { AuthPromptComponent } from "@shared/components/atoms/auth-prompt-component/auth-prompt-component";

@Component({
  selector: 'app-login-layout-component',
  imports: [LoginFormComponent, ProjectLogoComponent, LanguageSwitcherComponent, TranslocoModule, NgOptimizedImage, AuthPromptComponent],
  templateUrl: './login-layout-component.html',
  styleUrl: './login-layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginLayoutComponent {

}
