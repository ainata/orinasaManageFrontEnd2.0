import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

export interface Company {
  id: number;
  code: string;
  domain: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  name?: string;
  email?: string;
  phone?: string;
  settings?: CompanySetting[];
  userCompanies?: any[];
  documents?: any[];
}

export interface CompanySetting {
  id: number;
  settingKey: string;
  settingValue: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  type?: string | null;
  optionsSource?: string | null;
  options?: any;
  optionsRef?: any;
}

export interface CreateCompanyPayload {
  domain: string;
  enabled: boolean;
  code: string;
}

export interface UpdateCompanyPayload {
  domain: string;
  enabled: boolean;
  code: string;
  settings?: Array<{
    id?: number;
    settingKey: string;
    settingValue: string | null;
    category?: string | null;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly http = inject(HttpClient);

  getCompanies() {
    return this.http.get<Company[]>('/api/companies');
  }

  getCompanyById(id: number) {
    return this.http.get<Company>(`/api/companies/${id}`);
  }

  createCompany(payload: CreateCompanyPayload) {
    return this.http.post<Company>('/api/companies', payload);
  }

  updateCompany(id: number | string, payload: UpdateCompanyPayload) {
    return this.http.put<Company>(`/api/companies/${id}`, payload);
  }

  createCompanySettings(payload: any) {
    return this.http.post('/api/company-settings/batch', payload);
  }
}
