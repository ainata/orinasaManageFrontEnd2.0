import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { mergeMap, of, throwError } from 'rxjs';

export function apiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const isCompanyEndpoint = /\/api\/companies(?:\/|$|\?)/.test(req.url);

  return next(req).pipe(
    mergeMap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (isCompanyEndpoint) {
          return of(event);
        }

        const body: any = event.body;
        // failure: { code: **, msg: 'failure' }
        // success: { code: 0,  msg: 'success', data: {} }
        if (body && 'code' in body && body.code !== 0) {
          return throwError(() => body);
        }
      }
      // Pass down event if everything is OK
      return of(event);
    })
  );
}
