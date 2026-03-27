import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, iif, map, merge, of, share, switchMap, tap } from 'rxjs';
import { LocalStorageService } from '@shared';
import { filterObject, isEmptyObject } from './helpers';
import { User } from './interface';
import { LoginService } from './login.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginService = inject(LoginService);
  private readonly tokenService = inject(TokenService);
  private readonly store = inject(LocalStorageService);

  private readonly userStorageKey = 'user';
  private user$ = new BehaviorSubject<User>({});
  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh()))
  ).pipe(
    switchMap(() => this.assignUser()),
    share()
  );

  init() {
    return new Promise<void>(resolve => this.change$.subscribe(() => resolve()));
  }

  change() {
    return this.change$;
  }

  check() {
    return this.tokenService.valid();
  }

  login(email: string, password: string, key: string, rememberMe = false) {
    return this.loginService.login(email, password, key, rememberMe).pipe(
      tap(token => {
        if (token?.user) {
          this.store.set(this.userStorageKey, token.user);
          this.user$.next(this.normalizeUser(token.user));
          const { user, ...tokenWithoutUser } = token;
          this.tokenService.set(tokenWithoutUser);
        } else {
          this.store.remove(this.userStorageKey);
          this.tokenService.set(token);
        }
      }),
      map(() => this.check())
    );
  }

  refresh() {
    return this.loginService
      .refresh(filterObject({ refresh_token: this.tokenService.getRefreshToken() }))
      .pipe(
        catchError(() => of(undefined)),
        tap(token => this.tokenService.set(token)),
        map(() => this.check())
      );
  }

  logout() {
    return this.loginService.logout().pipe(
      tap(() => {
        this.tokenService.clear();
        this.store.remove(this.userStorageKey);
      }),
      map(() => !this.check())
    );
  }

  user() {
    return this.user$.pipe(share());
  }

  get companyId(): number | undefined {
    return this.user$.getValue()['companyId'];
  }

  menu() {
    return iif(() => this.check(), this.loginService.menu(), of([]));
  }

  private assignUser() {
    if (!this.check()) {
      return of({}).pipe(tap(user => this.user$.next(user)));
    }

    if (!isEmptyObject(this.user$.getValue())) {
      return of(this.user$.getValue());
    }

    const storedUser = this.store.get(this.userStorageKey);
    if (storedUser && !isEmptyObject(storedUser)) {
      return of(this.normalizeUser(storedUser)).pipe(tap(user => this.user$.next(user)));
    }

    return this.loginService.user().pipe(tap(user => this.user$.next(this.normalizeUser(user))));
  }

  private normalizeUser(user: User): User {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    const name = user.name || fullName || user.email || 'unknown';

    return {
      ...user,
      name,
      avatar: user.avatar || user.photo || undefined,
    };
  }
}
