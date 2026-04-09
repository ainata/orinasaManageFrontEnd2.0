import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeesService } from '../employees.service';
import { CompanyService, Company } from '../../../settings/company/company.service';
import { RoleDTO, CreateUserRequest } from '../employees.model';

@Component({
  selector: 'app-employees-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './employees-add.html',
  styleUrls: ['./employees-add.scss'],
})
export class EmployeesAdd implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeesService = inject(EmployeesService);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);

  form!: FormGroup;
  companies: Company[] = [];
  roles: RoleDTO[] = [];
  isSaving = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      enabled: [true],
      companyIds: [[], [Validators.required]],
      roleIds: [[], [Validators.required]],
    });

    this.loadCompanies();

    // Listen to company selection changes to load roles
    this.form.get('companyIds')?.valueChanges.subscribe((selectedIds: number[]) => {
      if (selectedIds && selectedIds.length > 0) {
        // Load roles for the first selected company for simplicity,
        // or iterate if you want combined roles
        this.loadRoles(selectedIds[0]);
      } else {
        this.roles = [];
      }
    });
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe(res => {
      this.companies = res;
    });
  }

  loadRoles(companyId: number) {
    this.employeesService.getRolesByCompany(companyId).subscribe(res => {
      this.roles = res;
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this.isSaving = true;
    const request: CreateUserRequest = this.form.value;

    this.employeesService.create(request).subscribe({
      next: () => {
        this.isSaving = false;
        // On success, interceptor takes care of the generic toastr, we just go back to list
        this.router.navigate(['/hr/employee/list']);
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }
}
