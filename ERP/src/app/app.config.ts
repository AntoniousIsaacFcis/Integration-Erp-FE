import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { PreloadAllModules, provideRouter, TitleStrategy, withComponentInputBinding, withPreloading, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoPersistLang, cookiesStorage } from '@jsverse/transloco-persist-lang';
import { authInterceptor } from '@core/auth/interceptors/auth-interceptor';
import { AUTH_STORAGE } from '@core/auth/tokens/auth-storage.token';
import { errorInterceptor } from '@core/interceptors/error-interceptor';

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
      withInterceptors([
        authInterceptor, //to add auth token with every request,
        errorInterceptor
      ])
    ),

    // { provide: TitleStrategy, useClass: TemplatePageTitleStrategy },

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
