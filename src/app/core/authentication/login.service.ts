import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { normalizeApiBaseUrl } from './api-base-url';

import { Menu } from '@core';
import { Token, User } from './interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);

  private buildLoginUrl(key: string) {
    const normalized = normalizeApiBaseUrl(key);
    if (!normalized) {
      return '/api/auth/login';
    }
    return `${normalized}/api/auth/login`;
  }

  login(username: string, password: string, key: string, rememberMe = false) {
    const url = this.buildLoginUrl(key);
    return this.http.post<Token>(url, { email: username, password }).pipe(
      map(res => {
        if (res?.access_token) {
          return res;
        }

        if (res?.token) {
          return {
            access_token: res.token,
            token_type: 'Bearer',
            user: res.user,
          };
        }

        return res;
      })
    );
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>('/api/auth/refresh', params);
  }

  logout() {
    return this.http.post<any>('/api/auth/logout', {});
  }

  user() {
    return this.http.get<User>('/api/user');
  }

  menu() {
    return this.http.get<{ menu: Menu[] }>('data/menu.json').pipe(map(res => res.menu));
  }
}
