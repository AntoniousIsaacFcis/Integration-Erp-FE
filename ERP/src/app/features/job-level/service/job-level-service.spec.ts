import { TestBed } from '@angular/core/testing';

import { JobLevelService } from './job-level-service';

describe('JobLevelService', () => {
  let service: JobLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
