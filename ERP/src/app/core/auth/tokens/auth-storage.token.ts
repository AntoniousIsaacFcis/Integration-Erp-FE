import { InjectionToken } from "@angular/core";

export interface IAuthStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

export const AUTH_STORAGE = new InjectionToken<IAuthStorage>('AUTH_STORAGE');
