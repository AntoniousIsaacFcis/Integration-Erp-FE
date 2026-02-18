import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { permissionGuard } from './permission-guard';

describe('permissionGuard', () => {
  // نقوم بمحاكاة الـ Snapshots المطلوبة للـ Guard
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const executeGuard = (policy: string) =>
    TestBed.runInInjectionContext(() => permissionGuard(policy)(route, state));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('should be created', () => {
    const guardResult = executeGuard('AbpIdentity.Users');
    expect(guardResult).toBeTruthy();
  });
});
