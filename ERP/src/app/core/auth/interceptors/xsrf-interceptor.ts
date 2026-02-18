import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

const getCookie = (name: string): string | null => {
    const nameLenPlus = (name.length + 1);
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
  };

const token = getCookie('XSRF-TOKEN');

  if (token && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    req = req.clone({
      setHeaders: {
        'RequestVerificationToken': token //name in backend => Configure<AntiforgeryOptions>
      },
      withCredentials: true
    });
  } else {
    req = req.clone({ withCredentials: true });
  }

  return next(req);
};
