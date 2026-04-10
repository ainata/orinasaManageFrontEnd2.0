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
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeesService } from '../employees.service';
import { CompanyService, Company } from '../../../settings/company/company.service';
import { DepartmentService } from '../../department/department.service';
import { ActivityService } from '../../activity/activity.service';
import { PositionService } from '../../position/position.service';
import { RoleDTO, CreateUserRequest, DepartmentDTO, ActivityDTO, PositionDTO } from '../employees.model';
import { format } from 'date-fns';

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
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './employees-add.html',
  styleUrls: ['./employees-add.scss'],
})
export class EmployeesAdd implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeesService = inject(EmployeesService);
  private readonly companyService = inject(CompanyService);
  private readonly departmentService = inject(DepartmentService);
  private readonly activityService = inject(ActivityService);
  private readonly positionService = inject(PositionService);
  private readonly router = inject(Router);

  form!: FormGroup;
  companies: Company[] = [];
  departments: DepartmentDTO[] = [];
  activities: ActivityDTO[] = [];
  positions: PositionDTO[] = [];
  roles: RoleDTO[] = [];
  isSaving = false;

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
      companyId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      activityId: [null, [Validators.required]],
      positionId: [null, [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      gender: ['MASCULIN', [Validators.required]],
      password: [''],
      cin: ['', [Validators.required]],
      maritalStatus: ['SINGLE'],
      childrenCount: [0],
      photo: [''],
      nationality: [''],
      birthPlace: [''],
      birthDate: [null],
      roleIds: [[]],
      enabled: [true],
    });

    this.loadCompanies();

    // Cascading: Company -> Department -> Roles
    this.form.get('companyId')?.valueChanges.subscribe((companyId: number) => {
      if (companyId) {
        this.loadDepartments(companyId);
        this.loadRoles(companyId);
      } else {
        this.departments = [];
        this.roles = [];
      }
      this.form.patchValue({ departmentId: null, activityId: null, positionId: null, roleIds: [] });
    });

    // Cascading: Department -> Activity
    this.form.get('departmentId')?.valueChanges.subscribe((deptId: number) => {
      if (deptId) {
        this.loadActivities(deptId);
      } else {
        this.activities = [];
      }
      this.form.patchValue({ activityId: null, positionId: null });
    });

    // Cascading: Activity -> Position
    this.form.get('activityId')?.valueChanges.subscribe((actId: number) => {
      if (actId) {
        this.loadPositions(actId);
      } else {
        this.positions = [];
      }
      this.form.patchValue({ positionId: null });
    });
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe(res => {
      this.companies = res;
    });
  }

  loadDepartments(companyId: number) {
    this.departmentService.getDepartments(companyId).subscribe(res => {
      this.departments = res;
    });
  }

  loadActivities(departmentId: number) {
    this.activityService.getActivitiesByDepartment(departmentId).subscribe(res => {
      this.activities = res as any;
    });
  }

  loadPositions(activityId: number) {
    this.positionService.getPositionsByActivity(activityId).subscribe(res => {
      this.positions = res as any;
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
    const formValue = this.form.value;
    const request: CreateUserRequest = {
      ...formValue,
      birthDate: formValue.birthDate ? format(formValue.birthDate, 'yyyy-MM-dd') : undefined,
    };

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
