
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { isDevMode } from '@angular/core';
import { App } from './app/app';

async function prepareApp() {
  if (isDevMode()) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
  return Promise.resolve();
}

prepareApp().then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
