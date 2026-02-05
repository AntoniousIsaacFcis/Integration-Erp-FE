import { setupWorker } from 'msw/browser';
import { jobLevelHandlers } from './handlers/job-level.handler';

export const worker = setupWorker(
  ...jobLevelHandlers
  // أضف أي handlers أخرى هنا مستقبلاً
);
