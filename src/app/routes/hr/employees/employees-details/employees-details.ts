import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeesService } from '../employees.service';
import { Employee, UpdateUserRequest } from '../employees.model';

@Component({
  selector: 'app-employees-details',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TranslateModule,
  ],
  templateUrl: './employees-details.html',
  styleUrls: ['./employees-details.scss'],
})
export class EmployeesDetails implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeesService = inject(EmployeesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;
  employee = signal<Employee | null>(null);
  isSaving = signal(false);
  isLoading = signal(true);
  employeeId!: number;

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      enabled: [true],
    });

    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.employeeId) {
      this.loadEmployee();
    }
  }

  loadEmployee() {
    this.isLoading.set(true);
    this.employeesService.getById(this.employeeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (emp) => {
          this.employee.set(emp);
          this.form.patchValue({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            enabled: emp.enabled,
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  save() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const request: UpdateUserRequest = {
      code: this.employee()?.employeeCode ?? '',
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      email: this.form.value.email,
      enabled: this.form.value.enabled,
    };

    this.employeesService.update(this.employeeId, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/hr/employee/list']);
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  get fullName(): string {
    const emp = this.employee();
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }
}
