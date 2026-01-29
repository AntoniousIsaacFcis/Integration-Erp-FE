import { DOCUMENT, effect, inject, Injectable, RendererFactory2, Signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translocoService = inject(TranslocoService);
  private document = inject(DOCUMENT);
  private renderer = inject(RendererFactory2).createRenderer(null, null);

  readonly lang: Signal<string> = toSignal(
    this.translocoService.langChanges$ as Observable<string>,
    { initialValue: this.translocoService.getActiveLang() || 'ar' }
  );
  constructor() {
    effect(() => {
      const currentLang = this.lang();
      if (currentLang) {
        const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        this.renderer.setAttribute(this.document.documentElement, 'lang', currentLang);
        this.renderer.setAttribute(this.document.documentElement, 'dir', dir);
      }
    });

  }

  //manual lang change function
  changeLanguage(lang: 'ar' | 'en') {
    this.translocoService.setActiveLang(lang);
  }
}
