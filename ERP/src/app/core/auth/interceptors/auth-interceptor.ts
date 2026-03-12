import {HttpHeaders, HttpInterceptorFn } from '@angular/common/http';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // 1. Precise Cookie Reader
  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const token = getCookie('XSRF-TOKEN');

  let headers = new HttpHeaders()
    .set('X-Requested-With', 'XMLHttpRequest')
    .set('Accept', 'application/json');

 if (token && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    headers = headers.set('RequestVerificationToken', token);
  }

  const clonedReq = req.clone({
    headers,
    withCredentials: true
  });

  return next(clonedReq);
};
