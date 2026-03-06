import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import {
  getStoredApiBaseUrl,
  normalizeApiBaseUrl,
} from '@core/authentication';
import { LocalStorageService } from '@shared';

export const BASE_URL = new InjectionToken<string>('BASE_URL');

export function hasHttpScheme(url: string) {
  return new RegExp('^http(s)?://', 'i').test(url);
}

export function baseUrlInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const configuredBaseUrl = normalizeApiBaseUrl(inject(BASE_URL, { optional: true }));
  const storedBaseUrl = getStoredApiBaseUrl(inject(LocalStorageService));
  const baseUrl = storedBaseUrl || configuredBaseUrl;

  const prependBaseUrl = (url: string) =>
    [baseUrl?.replace(/\/$/g, ''), url.replace(/^\.?\//, '')].filter(val => val).join('/');

  if (!baseUrl || hasHttpScheme(req.url)) {
    return next(req);
  }

  return next(req.clone({ url: prependBaseUrl(req.url) }));
}
