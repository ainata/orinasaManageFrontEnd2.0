import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, NgZone, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslateModule } from '@ngx-translate/core';
import { tap } from 'rxjs';
import { LocalStorageService } from '@shared';
import { NotificationService } from '@core';

import {
  AuthService,
  clearStoredApiBaseUrl,
  getStoredApiBaseUrl,
  setStoredApiBaseUrl,
} from '@core/authentication';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MtxButtonModule,
    TranslateModule,
  ],
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly store = inject(LocalStorageService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastr = inject(ToastrService);
  private readonly zone = inject(NgZone);

  isSubmitting = signal(false);
  hasStoredKey = signal(false);
  storedKey = signal('');
  showKey = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['andriamitafs@gmail.com', [Validators.required]],
    password: ['123Aina456', [Validators.required]],
    key: ['http://localhost:8080', [Validators.required]],
    rememberMe: [false],
  });

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  get key() {
    return this.loginForm.get('key')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  ngOnInit() {
    this.loadStoredKey();
  }

  onKeyButtonClick() {
    if (this.hasStoredKey()) {
      this.clearStoredKey();
      return;
    }

    this.showKey.update(value => !value);
    this.updateKeyValidators();
  }

  login() {
    if (this.isSubmitting()) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const key = this.resolveApiKey();
    if (!key) {
      this.showKey.set(true);
      this.updateKeyValidators();
      this.key.setErrors({ required: true });
      return;
    }

    this.isSubmitting.set(true);
    this.storedKey.set(setStoredApiBaseUrl(this.store, key));
    this.hasStoredKey.set(!!this.storedKey());

    this.auth
      .login(this.email.value, this.password.value, key, this.rememberMe.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap({
          next: () => {
            this.showKey.set(!this.hasStoredKey());
            this.updateKeyValidators();
            this.notify.success('Connexion reussie');
            this.router.navigateByUrl('/');
            this.isSubmitting.set(false);
          },
          error: (errorRes: HttpErrorResponse) => {
            this.notify.error(this.notify.getErrorMessage(errorRes, 'Echec de la connexion'));
            this.isSubmitting.set(false);
          },
        })
      )
      .subscribe();
  }

  private loadStoredKey() {
    this.storedKey.set(getStoredApiBaseUrl(this.store));
    this.hasStoredKey.set(!!this.storedKey());
    this.showKey.set(!this.hasStoredKey());

    if (this.hasStoredKey()) {
      this.key.setValue(this.storedKey());
    }

    this.updateKeyValidators();
  }

  private clearStoredKey() {
    clearStoredApiBaseUrl(this.store);
    this.storedKey.set('');
    this.hasStoredKey.set(false);
    this.showKey.set(true);
    this.key.setValue('');
    this.updateKeyValidators();
  }

  private updateKeyValidators() {
    if (this.showKey()) {
      this.key.setValidators([Validators.required]);
    } else {
      this.key.clearValidators();
    }
    this.key.updateValueAndValidity();
  }

  private resolveApiKey() {
    return this.hasStoredKey() ? this.storedKey() : this.key.value.trim();
  }
}
