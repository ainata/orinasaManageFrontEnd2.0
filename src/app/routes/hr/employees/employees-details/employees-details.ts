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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeesService } from '../employees.service';
import { Employee, UpdateUserRequest, DepartmentDTO, ActivityDTO, PositionDTO, RoleDTO } from '../employees.model';
import { DepartmentService } from '../../department/department.service';
import { ActivityService } from '../../activity/activity.service';
import { PositionService } from '../../position/position.service';
import { format } from 'date-fns';

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
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    QRCodeComponent,
  ],
  templateUrl: './employees-details.html',
  styleUrls: ['./employees-details.scss'],
})
export class EmployeesDetails implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeesService = inject(EmployeesService);
  private readonly departmentService = inject(DepartmentService);
  private readonly activityService = inject(ActivityService);
  private readonly positionService = inject(PositionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;
  employee = signal<Employee | null>(null);
  isSaving = signal(false);
  isLoading = signal(true);
  employeeId!: number;

  departments = signal<DepartmentDTO[]>([]);
  activities = signal<ActivityDTO[]>([]);
  positions = signal<PositionDTO[]>([]);
  roles = signal<RoleDTO[]>([]);

  genderOptions = [
    { label: 'male', value: 'MASCULIN' },
    { label: 'female', value: 'FEMININ' },
  ];

  maritalStatusOptions = [
    { label: 'single', value: 'SINGLE' },
    { label: 'married', value: 'MARRIED' },
    { label: 'divorced', value: 'DIVORCED' },
    { label: 'widowed', value: 'WIDOWED' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      birthDate: [null],
      birthPlace: [''],
      nationality: [''],
      maritalStatus: [''],
      childrenCount: [0],
      departmentId: [null],
      activityId: [null],
      positionId: [null],
      roleIds: [[]],
      enabled: [true],
    });

    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.employeeId) {
      this.loadEmployee();
    }

    // Listen to department changes
    this.form.get('departmentId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(deptId => {
        if (deptId) {
          this.loadActivities(deptId);
        } else {
          this.activities.set([]);
          this.form.get('activityId')?.setValue(null);
        }
      });

    // Listen to activity changes
    this.form.get('activityId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(actId => {
        if (actId) {
          this.loadPositions(actId);
        } else {
          this.positions.set([]);
          this.form.get('positionId')?.setValue(null);
        }
      });
  }

  loadData(companyId: number) {
    this.departmentService.getDepartments(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(deps => this.departments.set(deps));

    this.employeesService.getRolesByCompany(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(roles => this.roles.set(roles));
  }

  loadActivities(deptId: number) {
    this.activityService.getActivitiesByDepartment(deptId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(acts => this.activities.set(acts as any));
  }

  loadPositions(actId: number) {
    this.positionService.getPositionsByActivity(actId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pos => this.positions.set(pos as any));
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
            gender: emp.gender,
            birthDate: emp.birthDate ? new Date(emp.birthDate) : null,
            birthPlace: emp.birthPlace,
            nationality: emp.nationality,
            maritalStatus: emp.maritalStatus,
            childrenCount: emp.childrenCount,
            departmentId: emp.department?.id,
            activityId: emp.activity?.id,
            positionId: emp.position?.id,
            roleIds: emp.userRoles?.map(ur => ur.role.id) || [],
            enabled: emp.enabled,
          }, { emitEvent: false }); // Disable emitEvent to avoid triggering valueChanges on load
          
          if (emp.company?.id) {
            this.loadData(emp.company.id);
          }
          if (emp.department?.id) {
            this.loadActivities(emp.department.id);
          }
          if (emp.activity?.id) {
            this.loadPositions(emp.activity.id);
          }
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
    const formValue = this.form.value;
    const request: UpdateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      gender: formValue.gender,
      birthDate: formValue.birthDate ? format(formValue.birthDate, 'yyyy-MM-dd') : undefined,
      birthPlace: formValue.birthPlace,
      nationality: formValue.nationality,
      maritalStatus: formValue.maritalStatus,
      childrenCount: formValue.childrenCount,
      departmentId: formValue.departmentId,
      activityId: formValue.activityId,
      positionId: formValue.positionId,
      roleIds: formValue.roleIds,
      enabled: formValue.enabled,
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

  printBadge() {
    window.print();
  }
}
