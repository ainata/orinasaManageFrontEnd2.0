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

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly http = inject(HttpClient);

  getCompanies() {
    return this.http.get<Company[]>('/api/companies');
  }

  getCompanyById(id: number | string) {
    return this.http
      .get<Company | { data: Company } | Company[]>(`/api/companies/${id}`)
      .pipe(
        map(response => {
          if (Array.isArray(response)) {
            return response[0];
          }
          if (response && typeof response === 'object' && 'data' in response) {
            return response.data;
          }
          return response;
        })
      );
  }

  createCompany(payload: CreateCompanyPayload) {
    return this.http.post<Company>('/api/companies', payload);
  }
}
