import { TestBed } from '@angular/core/testing';

import { NationalitiesService } from './nationalities-service';

describe('NationalitiesService', () => {
  let service: NationalitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NationalitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
