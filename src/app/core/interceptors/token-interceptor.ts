import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { getStoredApiBaseUrl, normalizeApiBaseUrl, TokenService } from '@core/authentication';
import { LocalStorageService } from '@shared';
import { catchError, tap, throwError } from 'rxjs';
import { BASE_URL, hasHttpScheme, isApiRequestUrl } from './base-url-interceptor';

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const configuredBaseUrl = normalizeApiBaseUrl(inject(BASE_URL, { optional: true }));
  const storedBaseUrl = getStoredApiBaseUrl(inject(LocalStorageService));
  const baseUrl = storedBaseUrl || configuredBaseUrl;
  const tokenService = inject(TokenService);

  const includeBaseUrl = (url: string) => {
    if (!baseUrl) {
      return false;
    }
    return new RegExp(`^${baseUrl.replace(/\/$/, '')}`, 'i').test(url);
  };

  const shouldAppendToken = (url: string) =>
    includeBaseUrl(url) || (!hasHttpScheme(url) && isApiRequestUrl(url));

  const handler = () => {
    if (req.url.includes('/auth/logout')) {
      router.navigateByUrl('/auth/login');
    }

    if (router.url.includes('/auth/login')) {
      router.navigateByUrl('/dashboard');
    }
  };

  if (tokenService.valid() && shouldAppendToken(req.url)) {
    return next(
      req.clone({
        headers: req.headers.append('Authorization', tokenService.getBearerToken()),
        withCredentials: true,
      })
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          tokenService.clear();
        }
        return throwError(() => error);
      }),
      tap(() => handler())
    );
  }

  return next(req).pipe(tap(() => handler()));
}
