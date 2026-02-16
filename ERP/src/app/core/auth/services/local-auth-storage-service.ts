import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { IAuthStorage } from '../tokens/auth-storage.token';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalAuthStorageService implements IAuthStorage {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getToken() { return this.isBrowser ? localStorage.getItem('token') : null; }
  setToken(token: string) {
    if (this.isBrowser) localStorage.setItem('token', token);
  }
  removeToken() {
    if (this.isBrowser) localStorage.removeItem('token');
  }

}
