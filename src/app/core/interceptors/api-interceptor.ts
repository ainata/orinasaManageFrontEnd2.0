import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';

export function apiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const toastr = inject(ToastrService);
  const translate = inject(TranslateService);
  const dialog = inject(MatDialog);

  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const isCompanyEndpoint = /\/api\/companies(?:\/|$|\?)/.test(req.url);

  return next(req).pipe(
    map((event: HttpEvent<any>) => {
      // Angular guarantees that reaching this map with HttpResponse means the status code is a success (200-299 ranges).
      if (event instanceof HttpResponse) {
        if (!isCompanyEndpoint && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          toastr.success(
            translate.instant('notifications.success'),
            translate.instant('notifications.success_title')
          );
          dialog.closeAll();
        }
      }
      return event;
    })
  );
}
