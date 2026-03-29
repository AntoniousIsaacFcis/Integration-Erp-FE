import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { IAuthResponse, ILoginDTO, IUser } from '@core/models/iuser';
import { environment } from '@env/environment.development';
import { catchError, filter, of, skip, switchMap, take, tap, throwError, timeout } from 'rxjs';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { ILoginResponse } from '@core/models/iauth-model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  readonly configResource = rxResource({
    stream: () => this.http.get<any>(`${environment.baseUrl}/api/abp/application-configuration`).pipe(
      catchError(err => {
        console.error('ABP Config Load Failed', err);
        return of(null);
      })
    )
  });

  currentUser = computed(() => this.configResource.value()?.currentUser);

  isAuthenticated = computed(() =>
    !!this.configResource.value()?.currentUser?.isAuthenticated
  );

  grantedPolicies = computed(() =>
    this.configResource.value()?.auth?.grantedPolicies ?? {}
  );

  login(credentials: ILoginDTO) {
    return this.http.post<ILoginResponse>(`${environment.baseUrl}/api/account/login`, {
      userNameOrEmailAddress: credentials.email,
      password: credentials.password,
      rememberMe: true
    }).pipe(
      tap((response) => {
        if (response.result !== 1) {
          throw response.description || 'LOGIN_FAILED';
        }
        this.configResource.reload();
      }),
      // 2. Pass the injector to toObservable
      switchMap(() => toObservable(this.configResource.isLoading, { injector: this.injector }).pipe(
        filter(loading => !loading),
        take(1),
        timeout(5000),
      )),
      catchError((err) => {
        console.error('Login failed:', err);
        const errorMessage = err.name === 'TimeoutError' ? 'TIMEOUT_ERROR' : err;
        return throwError(() => errorMessage);
      })
    );
  }

  logout() {
    return this.http.get(`${environment.baseUrl}/api/account/logout`).pipe(
      tap(() => this.configResource.reload())
    );
  }

  hasPermission(policy: string): boolean {
    return !!this.grantedPolicies()[policy];
  }

readonly isConfigLoading$ = toObservable(this.configResource.isLoading);
}
