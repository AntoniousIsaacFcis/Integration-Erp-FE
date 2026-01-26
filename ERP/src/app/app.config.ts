import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, TitleStrategy, withComponentInputBinding, withPreloading, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),

    provideRouter(routes,
      withComponentInputBinding(),
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
  ]
};
