import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  success(message: string, title = 'Succes') {
    this.toastr.success(message, title);
  }

  error(message: string, title = 'Erreur') {
    this.toastr.error(message, title);
  }

  getErrorMessage(error: unknown, fallback = 'Une erreur est survenue') {
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const errorObj = error as {
      message?: string;
      error?: { message?: string; msg?: string; errors?: Record<string, string[]> };
      status?: number;
      statusText?: string;
    };

    if (errorObj.error?.message) {
      return errorObj.error.message;
    }

    if (errorObj.error?.msg) {
      return errorObj.error.msg;
    }

    if (errorObj.error?.errors) {
      const firstKey = Object.keys(errorObj.error.errors)[0];
      const firstError = firstKey ? errorObj.error.errors[firstKey]?.[0] : '';
      if (firstError) {
        return firstError;
      }
    }

    if (errorObj.message) {
      return errorObj.message;
    }

    if (errorObj.status === 0) {
      return 'Impossible de joindre le serveur API. Verifiez que le backend est demarre.';
    }

    if (errorObj.status) {
      return `${errorObj.status} ${errorObj.statusText ?? ''}`.trim();
    }

    return fallback;
  }
}
