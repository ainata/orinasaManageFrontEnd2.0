import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const errorPages = [STATUS.FORBIDDEN, STATUS.NOT_FOUND, STATUS.INTERNAL_SERVER_ERROR];
  const silentUnauthorizedUrls = ['/api/user', '/api/user/menu', '/user', '/user/menu'];

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (errorPages.includes(error.status)) {
        router.navigateByUrl(`/${error.status}`, {
          skipLocationChange: true,
        });
      } else {
        if (
          error.status === STATUS.UNAUTHORIZED &&
          silentUnauthorizedUrls.some(url => req.url.includes(url))
        ) {
          return throwError(() => error);
        }

        console.error('ERROR', error);
        if (error.status === STATUS.UNAUTHORIZED) {
          router.navigateByUrl('/auth/login');
        }
      }

      return throwError(() => error);
    })
  );
}
