import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handler';
import { jobLevelHandlers } from './handlers/job-level.handler';
import { departmentHandlers } from './handlers/department.handler';
import { environment } from '@env/environment.development';

export const worker = setupWorker(
  ...authHandlers,
  ...jobLevelHandlers,
  ...departmentHandlers
);

//allowing workwe in development only
export async function initMocks() {
  if (!environment.production) {
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
  return Promise.resolve();
}
