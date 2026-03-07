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
