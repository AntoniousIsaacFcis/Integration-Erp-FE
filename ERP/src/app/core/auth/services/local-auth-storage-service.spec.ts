import { TestBed } from '@angular/core/testing';

import { LocalAuthStorageService } from './local-auth-storage-service';

describe('LocalAuthStorageService', () => {
  let service: LocalAuthStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalAuthStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
