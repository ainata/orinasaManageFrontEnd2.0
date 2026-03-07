import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { PageHeader } from '@shared';
import { Company, CompanyService, CompanySetting } from '../company.service';

@Component({
  selector: 'app-company-details',
  imports: [CommonModule, MatCardModule, MatIconModule, PageHeader],
  templateUrl: './company-details.html',
  styleUrl: './company-details.scss',
})
export class CompanyDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);

  isLoading = signal(true);
  company = signal<Company | undefined>(undefined);
  settings = signal<CompanySetting[]>([]);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        switchMap(id => {
          if (!Number.isFinite(id) || id <= 0) {
            this.isLoading.set(false);
            return of(undefined as Company | undefined);
          }
          this.isLoading.set(true);
          return this.fetchCompany(id);
        })
      )
      .subscribe(company => {
        if (!company) {
          this.company.set(undefined);
          this.settings.set([]);
          this.isLoading.set(false);
          return;
        }

        const normalized = this.normalizeCompanyDetails(company);
        this.company.set(normalized);
        this.settings.set(normalized.settings ?? []);
        this.isLoading.set(false);
      });
  }

  backToList() {
    this.router.navigate(['/settings/company']);
  }

  private fetchCompany(id: number) {
    const fromList = () =>
      this.companyService.getCompanies().pipe(
        map(companies => companies.find(company => Number(company.id) === id)),
        catchError(() => of(undefined))
      );

    return this.companyService.getCompanyById(id).pipe(
      switchMap(company => (company ? of(company) : fromList())),
      catchError(() => fromList())
    );
  }

  private normalizeCompanyDetails(company: Company): Company {
    const readSetting = (key: string) =>
      company.settings?.find(item => item.settingKey === key)?.settingValue ?? undefined;

    return {
      ...company,
      name: company.name ?? readSetting('company_name'),
      email: company.email ?? readSetting('company_email'),
      phone: company.phone ?? readSetting('company_phone_1'),
    };
  }
}
