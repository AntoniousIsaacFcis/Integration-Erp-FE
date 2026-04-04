
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { isDevMode } from '@angular/core';
import { App } from './app/app';
import { environment } from '@env/environment.development';

async function prepareApp() {
  if (isDevMode() && environment.useMocks) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass', // Keeps the console clean for real API calls
    });
  }
  return Promise.resolve();
}


prepareApp().then(() => {//2-comment prepareApp if wanna endpoints and uncomment it if wanna msw
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
