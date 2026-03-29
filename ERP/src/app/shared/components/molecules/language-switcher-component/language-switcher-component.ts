import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslationService } from '@core/services/translation-service';
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
  private translationService = inject(TranslationService);

  variant = input<'dropdown' | 'toggle'>('dropdown');

  isDropdownOpen = signal(false);

  currentLang = this.translationService.lang;

  languages = [
    { code: 'ar', label: 'العربية', flag: 'assets/imgs/arabiaSaudiaFlag.png' },
    { code: 'en', label: 'English', flag: 'assets/imgs/ukFlag.png' }
  ];

  selectedLangData = computed(() =>
    this.languages.find(l => l.code === this.currentLang()) || this.languages[0]
  );

  nextLangData = computed(() =>
    this.languages.find(l => l.code !== this.currentLang()) || this.languages[1]
  );

  toggleOrSelect() {
    if (this.variant() === 'toggle') {
      this.selectLanguage(this.nextLangData().code);
    } else {
      this.isDropdownOpen.update(v => !v);
    }
  }

  selectLanguage(langCode: string) {
    this.translationService.changeLanguage(langCode as 'ar' | 'en');
    this.isDropdownOpen.set(false);
  }
}
