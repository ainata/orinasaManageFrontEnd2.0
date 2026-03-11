import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';

import { Company, CompanyService, CompanySetting } from '../company.service';
import { NotificationService } from '@core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AddSettingDialogComponent,
  PhoneIso,
  SettingType,
} from './add-setting-dialog/add-setting-dialog';

type FixedSettingKey = 'company_name' | 'company_email' | 'company_phone_1' | 'company_logo';
type SettingGroup = { category: string; items: Array<{ index: number; settingKey: string }> };
type PhoneCountry = { iso: PhoneIso; label: string; dialCode: string; flagUrl: string };

@Component({
  selector: 'app-company-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatButtonModule,
  ],
  templateUrl: './company-details.html',
  styleUrl: './company-details.scss',
})
export class CompanyDetailsComponent {
  private static readonly phonePattern = /^\+?[0-9\s().-]{6,20}$/;
  private static readonly urlPattern = /^https?:\/\/\S+$/i;

  private readonly fixedSettingKeys = [
    'company_name',
    'company_email',
    'company_phone_1',
    'company_logo',
  ] as const satisfies readonly FixedSettingKey[];
  private readonly fixedSettingDefaultTypes: Record<FixedSettingKey, SettingType> = {
    company_name: 'TEXT',
    company_email: 'EMAIL',
    company_phone_1: 'PHONE',
    company_logo: 'URL',
  };
  readonly phoneCountries: PhoneCountry[] = [
    { iso: 'MG', label: 'Madagascar', dialCode: '+261', flagUrl: '/flags/mg.svg' },
    { iso: 'FR', label: 'France', dialCode: '+33', flagUrl: '/flags/fr.svg' },
    { iso: 'US', label: 'United States', dialCode: '+1', flagUrl: '/flags/us.svg' },
    { iso: 'CI', label: "Côte d'Ivoire", dialCode: '+225', flagUrl: '/flags/ci.svg' },
    { iso: 'SN', label: 'Sénégal', dialCode: '+221', flagUrl: '/flags/sn.svg' },
  ];
  private readonly phoneCountryByIso = new Map(
    this.phoneCountries.map(country => [country.iso, country] as const)
  );

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly companyService = inject(CompanyService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(true);
  isSaving = signal(false);
  company = signal<Company | undefined>(undefined);
  settingsByCategory = signal<SettingGroup[]>([]);

  companyForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    domain: ['', [Validators.required]],
    enabled: [true],
    settings: this.fb.array<FormGroup>([]),
  });

  get settingsFormArray() {
    return this.companyForm.controls.settings as FormArray<FormGroup>;
  }

  private computeSettingsByCategory(): SettingGroup[] {
    const grouped = new Map<string, Array<{ index: number; settingKey: string }>>();

    this.settingsFormArray.controls.forEach((control, index) => {
      const category = control.get('category')?.value ?? 'GENERAL';
      const settingKey = control.get('settingKey')?.value ?? '';
      const existing = grouped.get(category) ?? [];
      existing.push({ index, settingKey });
      grouped.set(category, existing);
    });

    return Array.from(grouped.entries()).map(([category, items]) => ({ category, items }));
  }

  private refreshSettingsByCategory() {
    this.settingsByCategory.set(this.computeSettingsByCategory());
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(paramMap => {
      const id = Number(paramMap.get('id'));
      this.fetchCompany(id);
    });
  }

  saveCompany() {
    const currentCompany = this.company();
    if (!currentCompany || this.companyForm.invalid || this.isSaving()) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const payload = {
      code: this.companyForm.controls.code.value.trim(),
      domain: this.companyForm.controls.domain.value.trim(),
      enabled: this.companyForm.controls.enabled.value,
    };
    const settingsPayload = this.buildSettingsPayload(currentCompany.id);

    this.isSaving.set(true);
    this.companyService
      .updateCompany(currentCompany.id, payload)
      .pipe(
        switchMap(updatedCompany =>
          this.companyService.createCompanySettings(settingsPayload).pipe(
            tap(() => {
              this.company.set(updatedCompany);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.notify.success('Modification avec succes');
          this.fetchCompany(currentCompany.id);
        },
        error: error => {
          this.notify.error(this.notify.getErrorMessage(error, 'Impossible de sauvegarder'));
        },
      });
  }

  backToList() {
    this.router.navigate(['/settings/company']);
  }

  addSetting() {
    const dialogRef = this.dialog.open(AddSettingDialogComponent, {
      width: '520px',
      autoFocus: false,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result) {
          return;
        }

        const exists = this.settingsFormArray.controls.some(
          control => control.get('settingKey')?.value === result.settingKey
        );

        if (exists) {
          this.notify.warning('Ce setting existe deja');
          return;
        }

        this.settingsFormArray.push(
          this.createSettingFormGroup({
            id: null,
            settingKey: result.settingKey,
            settingValue: result.settingValue,
            type: result.type ?? 'TEXT',
            phoneIso: result.phoneIso,
            category: result.category ?? 'GENERAL',
            options: result.options ?? [],
            locked: result.locked ?? false,
          })
        );
        this.refreshSettingsByCategory();
      });
  }

  normalizeSettingLabel(settingKey: string) {
    return settingKey
      .replace(/^company_/i, '')
      .replace(/_/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  getInputType(index: number) {
    const settingType = this.settingsFormArray.at(index)?.get('type')?.value as string | undefined;
    switch ((settingType ?? 'TEXT').toUpperCase()) {
      case 'EMAIL':
        return 'email';
      case 'NUMBER':
        return 'number';
      case 'URL':
        return 'url';
      case 'PHONE':
        return 'tel';
      default:
        return 'text';
    }
  }

  isPhoneSetting(index: number) {
    return this.getInputType(index) === 'tel';
  }

  getPhonePrefix(index: number) {
    const iso = this.normalizePhoneIso(this.settingsFormArray.at(index)?.get('phoneIso')?.value);
    return this.phoneCountryByIso.get(iso)?.dialCode ?? '+261';
  }

  getPhoneFlagUrl(index: number) {
    const iso = this.normalizePhoneIso(this.settingsFormArray.at(index)?.get('phoneIso')?.value);
    return this.phoneCountryByIso.get(iso)?.flagUrl ?? '/flags/mg.svg';
  }

  getPhonePlaceholder(index: number) {
    const iso = this.normalizePhoneIso(this.settingsFormArray.at(index)?.get('phoneIso')?.value);
    switch (iso) {
      case 'FR':
        return '00 00 00 00 00';
      case 'US':
        return '(000) 000-0000';
      case 'CI':
        return '00 00 00 00 00';
      case 'SN':
        return '00 000 00 00';
      case 'MG':
      default:
        return '000 00 000 00';
    }
  }

  onPhoneValueInput(index: number, event: Event) {
    if (!this.isPhoneSetting(index)) {
      return;
    }

    const control = this.settingsFormArray.at(index).get('settingValue');
    if (!control) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const iso = this.normalizePhoneIso(this.settingsFormArray.at(index).get('phoneIso')?.value);
    control.setValue(this.applyPhoneMask(iso, digits), { emitEvent: false });
  }

  private setSettingsInForm(settings: CompanySetting[]) {
    const formArray = this.settingsFormArray;
    formArray.clear();

    const byKey = new Map(settings.map(setting => [setting.settingKey, setting]));

    this.fixedSettingKeys.forEach(settingKey => {
      const setting = byKey.get(settingKey);
      formArray.push(
        this.createSettingFormGroup({
          id: setting?.id ?? null,
          settingKey,
          settingValue: setting?.settingValue ?? '',
          type: setting?.type ?? this.fixedSettingDefaultTypes[settingKey],
          phoneIso: undefined,
          category: 'GENERAL',
          options: setting?.options ?? [],
          locked: false,
        })
      );
    });

    settings
      .filter(setting => !this.isFixedSettingKey(setting.settingKey))
      .forEach(setting => {
        formArray.push(
          this.createSettingFormGroup({
            id: setting.id,
            settingKey: setting.settingKey,
            settingValue: setting.settingValue ?? '',
            type: setting.type ?? 'TEXT',
            phoneIso: undefined,
            category: setting.category ?? 'GENERAL',
            options: setting.options ?? [],
            locked: false,
          })
        );
      });

    this.refreshSettingsByCategory();
  }

  private buildSettingsPayload(companyId: number) {
    const settings = this.settingsFormArray.controls.map(control => ({
      key: control.get('settingKey')?.value,
      value: this.normalizeSettingValue(
        (control.get('type')?.value as string | undefined) ?? 'TEXT',
        control.get('settingValue')?.value,
        control.get('phoneIso')?.value as PhoneIso | undefined
      ),
      type: (control.get('type')?.value as string | undefined) ?? 'TEXT',
      category: control.get('category')?.value ?? 'GENERAL',
      options: JSON.stringify(control.get('options')?.value ?? []),
    }));

    return { companyId, settings };
  }

  private isFixedSettingKey(settingKey: string) {
    return (this.fixedSettingKeys as readonly string[]).includes(settingKey);
  }

  private createSettingFormGroup(setting: {
    id: number | null;
    settingKey: string;
    settingValue: string;
    type: string;
    phoneIso?: PhoneIso;
    category: string;
    options: unknown[];
    locked: boolean;
  }) {
    const normalizedType = this.normalizeSettingType(setting.type);
    const initialPhoneIso = this.resolvePhoneIso(setting.settingValue, setting.phoneIso);
    const initialValue =
      normalizedType === 'PHONE'
        ? this.stripCountryCodeFromPhone(setting.settingValue, initialPhoneIso)
        : setting.settingValue;

    return this.fb.group({
      id: [setting.id],
      settingKey: [setting.settingKey, Validators.required],
      settingValue: [initialValue, this.getSettingValueValidators(normalizedType)],
      type: [normalizedType],
      phoneIso: [initialPhoneIso],
      category: [setting.category ?? 'GENERAL'],
      options: [setting.options ?? []],
      locked: [setting.locked ?? false],
    });
  }

  private normalizeSettingType(type: string): SettingType {
    const normalized = (type ?? 'TEXT').toUpperCase();
    const supportedTypes: SettingType[] = ['TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'URL'];
    return supportedTypes.includes(normalized as SettingType)
      ? (normalized as SettingType)
      : 'TEXT';
  }

  private getSettingValueValidators(type: SettingType): ValidatorFn[] {
    switch (type) {
      case 'EMAIL':
        return [Validators.required, Validators.email];
      case 'PHONE':
        return [Validators.required, Validators.pattern(CompanyDetailsComponent.phonePattern)];
      case 'NUMBER':
        return [Validators.required, Validators.pattern(/^-?\d+([.,]\d+)?$/)];
      case 'URL':
        return [Validators.required];
      case 'TEXT':
      default:
        return [Validators.required];
    }
  }

  private normalizeSettingValue(type: string, value: unknown, phoneIso?: PhoneIso) {
    const raw = String(value ?? '').trim();

    switch (this.normalizeSettingType(type)) {
      case 'PHONE':
        return this.normalizePhoneValue(raw, phoneIso);
      case 'NUMBER':
        return raw.replace(',', '.');
      default:
        return raw;
    }
  }

  private normalizePhoneIso(value: unknown): PhoneIso {
    const iso = String(value ?? 'MG').toUpperCase() as PhoneIso;
    return this.phoneCountryByIso.has(iso) ? iso : 'MG';
  }

  private resolvePhoneIso(phoneValue: string, fallback?: PhoneIso) {
    const normalized = this.normalizePhoneDigits(phoneValue);
    const sorted = [...this.phoneCountries].sort((a, b) => b.dialCode.length - a.dialCode.length);

    for (const country of sorted) {
      const dialDigits = country.dialCode.replace('+', '');
      if (normalized.startsWith(dialDigits)) {
        return country.iso;
      }
    }

    return this.normalizePhoneIso(fallback);
  }

  private stripCountryCodeFromPhone(phoneValue: string, iso: PhoneIso) {
    const country = this.phoneCountryByIso.get(iso);
    if (!country) {
      return phoneValue ?? '';
    }

    const dialDigits = country.dialCode.replace('+', '');
    const digits = this.normalizePhoneDigits(phoneValue);

    if (digits.startsWith(dialDigits)) {
      return digits.slice(dialDigits.length);
    }

    return String(phoneValue ?? '').trim();
  }

  private normalizePhoneValue(phoneValue: string, iso?: PhoneIso) {
    const country = this.phoneCountryByIso.get(this.normalizePhoneIso(iso));
    const dialCode = country?.dialCode ?? '+261';
    const dialDigits = dialCode.replace('+', '');
    const digits = this.normalizePhoneDigits(phoneValue);

    if (!digits) {
      return '';
    }

    if (digits.startsWith(dialDigits)) {
      return `+${digits}`;
    }

    const national = digits.replace(/^0+/, '');
    return `+${dialDigits}${national}`;
  }

  private normalizePhoneDigits(value: string) {
    let digits = String(value ?? '')
      .trim()
      .replace(/\D/g, '');
    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }
    return digits;
  }

  private applyPhoneMask(iso: PhoneIso, digits: string) {
    switch (iso) {
      case 'FR':
      case 'CI':
        return this.groupDigits(digits.slice(0, 10), [2, 2, 2, 2, 2], ' ');
      case 'US':
        return this.formatUs(digits.slice(0, 10));
      case 'SN':
        return this.groupDigits(digits.slice(0, 9), [2, 3, 2, 2], ' ');
      case 'MG':
      default:
        return this.groupDigits(digits.slice(0, 10), [3, 2, 3, 2], ' ');
    }
  }

  private groupDigits(digits: string, groups: number[], sep: string) {
    const out: string[] = [];
    let index = 0;
    for (const size of groups) {
      if (index >= digits.length) {
        break;
      }
      out.push(digits.slice(index, index + size));
      index += size;
    }
    return out.join(sep);
  }

  private formatUs(digits: string) {
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  private fetchCompany(id: number) {
    this.companyService
      .getCompanyById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: company => {
          this.company.set(company);
          this.companyForm.patchValue({
            code: company.code ?? '',
            domain: company.domain ?? '',
            enabled: !!company.enabled,
          });
          this.setSettingsInForm(company.settings ?? []);
          this.isLoading.set(false);
        },
        error: err => {
          this.notify.error('Impossible de récupérer la société', 'Erreur');
          this.isLoading.set(false);
        },
      });
  }
}
