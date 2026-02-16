import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { IAuthResponse, ILoginDTO, IUser } from '@core/models/iuser';
import { environment } from '@env/environment.development';
import { tap } from 'rxjs';
import { AUTH_STORAGE } from '../tokens/auth-storage.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private storage = inject(AUTH_STORAGE);//sevice not know place of storge(easy to change it fom local storge with msw to httpCookie with real api in production)

  private readonly userSignal = signal<IUser | null>(this.getStoredUser());
  currentUser = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.userSignal());

  login(credentials: ILoginDTO) {
    return this.http.post<IAuthResponse>(`${environment.baseUrl}/api/auth/login`, credentials).pipe(
      tap(res => {
        this.storage.setToken(res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSignal.set(res.user);
      })
    );
  }

  logout() {
    this.storage.removeToken();;
    localStorage.removeItem('user');
    this.userSignal.set(null);

    this.userSignal.set(null);
  }

  private getStoredUser(): IUser | null {
    const userJson = localStorage.getItem('user');
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

}
