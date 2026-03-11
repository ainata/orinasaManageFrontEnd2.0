import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export type SettingCategory = 'GENERAL' | 'HR' | 'ACCOUNTING' | 'SECURITY' | 'NOTIFICATION';
export type SettingType = 'TEXT' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'URL';
export type PhoneIso = 'MG' | 'FR' | 'US' | 'CI' | 'SN';

export interface AddSettingDialogResult {
  settingKey: string;
  settingValue: string;
  type: SettingType;
  category: SettingCategory;
  phoneIso?: PhoneIso;
  options: string[];
  locked: boolean;
}

@Component({
  selector: 'app-add-setting-dialog',
  standalone: true,
  templateUrl: './add-setting-dialog.html',
  styleUrl: './add-setting-dialog.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class AddSettingDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddSettingDialogComponent>);

  readonly categories: SettingCategory[] = [
    'GENERAL',
    'HR',
    'ACCOUNTING',
    'SECURITY',
    'NOTIFICATION',
  ];
  readonly types: SettingType[] = ['TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'URL'];
  readonly phoneCountries: Array<{
    iso: PhoneIso;
    label: string;
    dialCode: string;
    flagUrl: string;
  }> = [
    { iso: 'MG', label: 'Madagascar', dialCode: '+261', flagUrl: 'flags/mg.svg' },
    { iso: 'FR', label: 'France', dialCode: '+33', flagUrl: 'flags/fr.svg' },
    { iso: 'US', label: 'United States', dialCode: '+1', flagUrl: 'flags/us.svg' },
    { iso: 'CI', label: "Côte d'Ivoire", dialCode: '+225', flagUrl: 'flags/ci.svg' },
    { iso: 'SN', label: 'Sénégal', dialCode: '+221', flagUrl: 'flags/sn.svg' },
  ];

  readonly form = this.fb.nonNullable.group({
    category: ['GENERAL' as SettingCategory, Validators.required],
    type: ['TEXT' as SettingType, Validators.required],
    phoneIso: ['MG' as PhoneIso, Validators.required],
    settingKey: ['', Validators.required],
    settingValue: ['', Validators.required],
  });

  get valueInputType() {
    switch (this.form.controls.type.value) {
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

  get selectedPhoneFlagUrl() {
    const iso = this.form.controls.phoneIso.value;
    return this.phoneCountries.find(country => country.iso === iso)?.flagUrl ?? '/flags/mg.svg';
  }

  get phonePlaceholder() {
    switch (this.form.controls.phoneIso.value) {
      case 'FR':
        return '06 12 34 56 78';
      case 'US':
        return '(415) 555-2671';
      case 'CI':
        return '07 12 34 56 78';
      case 'SN':
        return '77 123 45 67';
      case 'MG':
      default:
        return '034 12 345 67';
    }
  }

  onPhoneValueInput(event: Event) {
    if (this.form.controls.type.value !== 'PHONE') {
      return;
    }

    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const masked = this.applyPhoneMask(this.form.controls.phoneIso.value, digits);
    this.form.controls.settingValue.setValue(masked, { emitEvent: false });
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

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      settingKey: this.form.controls.settingKey.value.trim(),
      settingValue: this.form.controls.settingValue.value.trim(),
      type: this.form.controls.type.value,
      category: this.form.controls.category.value,
      phoneIso:
        this.form.controls.type.value === 'PHONE' ? this.form.controls.phoneIso.value : undefined,
      options: [],
      locked: false,
    } satisfies AddSettingDialogResult);
  }
}
