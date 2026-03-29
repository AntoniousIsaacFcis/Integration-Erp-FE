import { Injectable, effect, signal, computed, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly STORAGE_KEY = 'theme-preference';
  private readonly MEDIA_QUERY = '(prefers-color-scheme: light)';

  // 1.(Source of Truth)
  readonly themeMode = signal<ThemeMode>(this.getInitialTheme());

  readonly isDarkMode = computed(() => this.themeMode() === ThemeMode.DARK);

  constructor() {
    this.setupThemeEffect();
    if (this.isBrowser) {
      this.setupSystemPreferenceListener();
    }
  }

  private setupThemeEffect(): void {
    effect(() => {
      const theme = this.themeMode();
      if (this.isBrowser) {
        this.updateDOM(theme);
        this.persistTheme(theme);
      }
    });
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) return ThemeMode.LIGHT;

    const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    if (Object.values(ThemeMode).includes(stored)) return stored;

    return window.matchMedia(this.MEDIA_QUERY).matches ? ThemeMode.DARK : ThemeMode.LIGHT;
  }

  private updateDOM(theme: ThemeMode): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === ThemeMode.DARK);

    // for mobile
    const meta = this.document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', theme === ThemeMode.DARK ? '#1a1a1a' : '#ffffff');
  }

  toggleTheme(): void {
    this.themeMode.update(prev => prev === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT);
  }

  private persistTheme(theme: ThemeMode): void {
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  private setupSystemPreferenceListener(): void {
    window.matchMedia(this.MEDIA_QUERY).addEventListener('change', e => {
      this.themeMode.set(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT);
    });
  }
}
