
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { isDevMode } from '@angular/core';
import { App } from './app/app';

async function prepareApp() {
  if (isDevMode()) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      // this line prevent msw for intercepting any angular chunk(force him intercept http requests only)
      onUnhandledRequest(req, print) {
        const url = new URL(req.url);

        if (
          url.pathname.startsWith('/@ng/') ||
          url.pathname.startsWith('/@vite/') ||
          url.pathname.startsWith('/assets/') ||
          url.href.includes('localhost:4200') && !url.pathname.startsWith('/api')
        ) {
          return;
        }

        print.warning();
      },
    });
  }
  return Promise.resolve();
}

// prepareApp().then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
// });
