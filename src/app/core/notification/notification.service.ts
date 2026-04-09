import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);
  private readonly toastOptions: Partial<IndividualConfig> = {
    positionClass: 'toast-top-right',

    timeOut: 3000,
    closeButton: true,
    progressBar: true,
    newestOnTop: true,
    easeTime: 300,
  };

  success(message: string, title = 'Succes') {
    this.toastr.success(message, title, this.toastOptions);
  }

  error(message: string, title = 'Erreur') {
    this.toastr.error(message, title, this.toastOptions);
  }

  info(message: string, title = 'Information') {
    this.toastr.info(message, title, this.toastOptions);
  }

  warning(message: string, title = 'Attention') {
    this.toastr.warning(message, title, this.toastOptions);
  }

  /**
   * - Erreur métier : objet { code, msg } renvoyé par l’intercepteur API
   * - Erreur HTTP : {@link HttpErrorResponse} (corps souvent dans `error`)
   */
  getErrorMessage(error: unknown, fallback = 'Une erreur est survenue') {
    if (error == null) {
      return fallback;
    }

    if (typeof error !== 'object') {
      return String(error);
    }

    if (!(error instanceof HttpErrorResponse)) {
      const b = error as { msg?: string; message?: string };
      if (typeof b.msg === 'string' && b.msg.trim()) {
        return b.msg;
      }
      if (typeof b.message === 'string' && b.message.trim()) {
        return b.message;
      }
      return fallback;
    }

    const err = error;

    if (err.status === 0) {
      return 'Impossible de joindre le serveur API. Verifiez que le backend est demarre.';
    }

    const body = err.error;
    if (body != null && typeof body === 'object') {
      const o = body as { message?: string; msg?: string; errors?: Record<string, string[]> };
      if (typeof o.msg === 'string' && o.msg.trim()) {
        return o.msg;
      }
      if (typeof o.message === 'string' && o.message.trim()) {
        return o.message;
      }
      if (o.errors) {
        const firstKey = Object.keys(o.errors)[0];
        const firstErr = firstKey ? o.errors[firstKey]?.[0] : '';
        if (firstErr) {
          return firstErr;
        }
      }
    }

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (err.status >= 400) {
      return `${err.status} ${err.statusText ?? ''}`.trim();
    }

    return fallback;
  }
}
