import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { IAuthResponse, ILoginDTO, IUser } from '@core/models/iuser';
import { environment } from '@env/environment.development';
import { filter, skip, switchMap, take, tap } from 'rxjs';
import { AUTH_STORAGE } from '../tokens/auth-storage.token';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { IApplicationConfig } from '@core/models/iapplication-config';
import { ILoginResponse } from '@core/models/iauth-model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private storage = inject(AUTH_STORAGE);//sevice not know place of storge(easy to change it fom local storge with msw to httpCookie with real api in production)


  readonly configResource = rxResource({
    stream: () => this.http.get<IApplicationConfig>(`${environment.baseUrl}/api/abp/application-configuration`, { withCredentials: true })
  });

  private configLoading$ = toObservable(this.configResource.isLoading);

  currentUser = computed(() => this.configResource.value()?.currentUser);
  isAuthenticated = computed(() => {
    const config = this.configResource.value();
    return !!config?.currentUser?.isAuthenticated;
  });
  grantedPolicies = computed(() => this.configResource.value()?.auth?.grantedPolicies ?? {});

  login(credentials: ILoginDTO) {
    this.storage.removeToken();
    return this.http.post<ILoginResponse>(`${environment.baseUrl}/api/account/login`, {
      userNameOrEmailAddress: credentials.email,
      password: credentials.password,
      rememberMe: true
    },
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json,text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest'
        },
        responseType: 'json'
      }
    ).pipe(
      tap((response: any) => {
        console.log('✅ Login Response Success, reloading config...');
        this.configResource.reload();
      }),
      switchMap(() => this.configLoading$.pipe( //wait until loading finish and be false
        filter(isLoading => !isLoading),
        skip(1), //to solve race condition problem
        take(1),
        tap(() => {
          //of login failed
          if (!this.isAuthenticated()) {
            throw 'INVALID_CREDENTIALS';
          }
          console.log('✅ Auth success: User is authenticated.');
        })
      )));
  }

  logout() {
    return this.http.get(`${environment.baseUrl}/api/account/logout`).pipe(
      tap(() => {
        this.storage.removeToken();
        // reset to make the user as guest without any credintioals
        this.configResource.reload();
      })
    );
  }

  hasPermission(policy: string): boolean {
    return !!this.grantedPolicies()[policy];
  }

}
