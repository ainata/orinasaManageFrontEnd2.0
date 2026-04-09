import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const translate = inject(TranslateService);
  const errorPages = [STATUS.FORBIDDEN, STATUS.NOT_FOUND, STATUS.INTERNAL_SERVER_ERROR];
  const silentUnauthorizedUrls = ['/api/user', '/api/user/menu', '/user', '/user/menu'];

  return next(req).pipe(
    catchError((error: unknown) => {
      let errorMsg = translate.instant('notifications.error');

      // Erreur HTTP classique
      if (error instanceof HttpErrorResponse) {
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

          console.error('HTTP', error.status, req.method, req.urlWithParams, error.message);
          toastr.error(errorMsg, translate.instant('notifications.error_title'));

          if (error.status === STATUS.UNAUTHORIZED) {
            router.navigateByUrl('/auth/login');
          }
        }

        return throwError(() => error);
      }

      // Erreur métier renvoyée par apiInterceptor (corps JSON, pas HttpErrorResponse)
      console.error('API métier', req.method, req.urlWithParams, error);
      const bError = error as any;
      if (bError && bError.msg) {
        errorMsg = bError.msg;
      } else if (bError && bError.message) {
        errorMsg = bError.message;
      }
      
      toastr.error(errorMsg, translate.instant('notifications.error_title'));
      return throwError(() => error);
    })
  );
}
