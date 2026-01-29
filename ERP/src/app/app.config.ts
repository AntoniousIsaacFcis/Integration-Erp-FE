import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { PreloadAllModules, provideRouter, TitleStrategy, withComponentInputBinding, withPreloading, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoPersistLang, cookiesStorage } from '@jsverse/transloco-persist-lang';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),

    provideRouter(routes,
      withComponentInputBinding(),//change url params to signals (instead of activatedRouter)
      withViewTransitions(),
      withPreloading(PreloadAllModules),
    ),

     provideHttpClient(
        withFetch(),//improve peformance
        withInterceptors([]) //to add auth token with every request
      ),

          // { provide: TitleStrategy, useClass: TemplatePageTitleStrategy },

    provideClientHydration(withEventReplay()),

    provideBrowserGlobalErrorListeners(),

      provideTransloco({
        config: {
          availableLangs: ['ar', 'en'],
          defaultLang: 'ar',
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      }),

      provideTranslocoLocale({
      langToLocaleMapping: {
        ar: 'ar-SA',
        en: 'en-US'
      }
    }),

    provideTranslocoPersistLang({
      storage: {
        useValue: cookiesStorage()
      }
    })

  ]
};
