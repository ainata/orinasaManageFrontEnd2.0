import { LocalStorageService } from '@shared';

export const API_BASE_URL_STORAGE_KEY = 'api-base-url';

export function normalizeApiBaseUrl(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim().replace(/\/+$/g, '');
  if (!normalized) {
    return '';
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${window.location.protocol}//${normalized}`;
}

export function getStoredApiBaseUrl(store: LocalStorageService): string {
  return normalizeApiBaseUrl(store.get(API_BASE_URL_STORAGE_KEY));
}

export function setStoredApiBaseUrl(store: LocalStorageService, value: string): string {
  const normalized = normalizeApiBaseUrl(value);
  if (normalized) {
    store.set(API_BASE_URL_STORAGE_KEY, normalized);
  } else {
    store.remove(API_BASE_URL_STORAGE_KEY);
  }

  return normalized;
}

export function clearStoredApiBaseUrl(store: LocalStorageService) {
  store.remove(API_BASE_URL_STORAGE_KEY);
}
