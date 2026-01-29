import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'app-language-switcher-component',
  imports: [NgIcon,TranslocoModule,NgOptimizedImage],
  templateUrl: './language-switcher-component.html',
  styleUrl: './language-switcher-component.css',
  providers: [provideIcons({ lucideChevronDown })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  currentLang = signal('ar');
}
