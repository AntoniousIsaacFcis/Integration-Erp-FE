import { setupWorker } from 'msw/browser';
import { jobLevelHandlers } from './handlers/job-level.handler';
import { departmentHandlers } from './handlers/department.handler';

export const worker = setupWorker(
  ...jobLevelHandlers,
  ...departmentHandlers
  // أضف أي handlers أخرى هنا مستقبلاً
);
