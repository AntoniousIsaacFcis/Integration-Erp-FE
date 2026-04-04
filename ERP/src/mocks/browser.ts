import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handler';
import { jobLevelHandlers } from './handlers/job-level.handler';
import { departmentHandlers } from './handlers/department.handler';
import { environment } from '@env/environment.development';
import { nationalityHandlers } from './handlers/nationalities.handler';
import { employeeHandlers } from './handlers/employee.handlers';
import { jobTitlesHandlers } from './handlers/job-titles.handler';
import { attendanceHandlers } from './handlers/attendance.handlers';
import { vacationHandlers } from './handlers/vacation.handlers';
import { salaryHandlers } from './handlers/salary.handlers';
import { employmentTypesHandlers } from './handlers/employment-types.handler';
import { shiftsHandlers } from './handlers/shifts.handlers';
import { specialShiftHandlers } from './handlers/special-shifts.handlers';
import { attendanceDaysHandlers } from './handlers/attendance.days.handler';
import { permissionsHandlers } from './handlers/permissions.handler';
import { roleHandlers } from './handlers/role.handler';

export const worker = setupWorker(
  ...attendanceDaysHandlers,
  ...jobLevelHandlers,
  ...departmentHandlers,
  ...nationalityHandlers,
  ...employeeHandlers,
  ...jobTitlesHandlers,
  ...attendanceHandlers,
  ...vacationHandlers,
  ...salaryHandlers,
  ...employmentTypesHandlers,
  ...shiftsHandlers,
  ...authHandlers,
  ...specialShiftHandlers,
  ...permissionsHandlers,
  ...roleHandlers
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
