import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handler';
import { jobLevelHandlers } from './handlers/job-level.handler';
import { departmentHandlers } from './handlers/department.handler';
import { environment } from '@env/environment.development';
import { nationalityHandlers } from './handlers/nationalities.handler';
import { employmentTypeHandlers } from './handlers/employment-types.handler';
import { AddemployeeFormHandlers } from './handlers/add-employee-Form.handler';

export const worker = setupWorker(
  ...authHandlers,
  ...jobLevelHandlers,
  ...departmentHandlers,
  ...nationalityHandlers,
  ...employmentTypeHandlers,
  ...AddemployeeFormHandlers
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
