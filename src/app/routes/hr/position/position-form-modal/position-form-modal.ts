import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { PositionService } from '../position.service';
import { ActivityService } from '../../activity/activity.service';
import { DepartmentService } from '../../department/department.service';
import { AuthService } from '@core/authentication';
import { Position } from '../position.model';
import { Activity } from '../../activity/activity.model';
import { Department } from '../../department/department.model';

interface DepartmentActivityGroup {
  department: Department;
  activities: Activity[];
}

@Component({
  selector: 'app-position-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './position-form-modal.html',
  styleUrls: ['./position-form-modal.scss'],
})
export class PositionFormModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly positionService = inject(PositionService);
  private readonly activityService = inject(ActivityService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<PositionFormModal>);

  readonly data: Position | null = inject(MAT_DIALOG_DATA, { optional: true }) ?? null;

  readonly deptActivityGroups = signal<DepartmentActivityGroup[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  readonly isEditMode = computed(() => !!this.data?.id);
  readonly dialogTitle = computed(() => (this.isEditMode() ? 'edit_position' : 'add_position'));

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.loadDepartmentsAndActivities();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
      code: [this.data?.code ?? '', [Validators.required]],
      description: [this.data?.description ?? '', []],
      activityId: [this.data?.activityId ?? null, [Validators.required]],
    });

    if (this.isEditMode()) {
      this.form.get('activityId')?.disable();
    }
  }

  private loadDepartmentsAndActivities(): void {
    const companyId = this.authService.companyId;
    if (!companyId) return;

    this.isLoading.set(true);
    this.departmentService
      .getDepartments(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(departments => {
        if (departments.length === 0) {
          this.deptActivityGroups.set([]);
          this.isLoading.set(false);
          return;
        }

        const requests = departments.map(d => this.activityService.getActivitiesByDepartment(d.id));
        forkJoin(requests)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: activitiesPerDept => {
              const groups: DepartmentActivityGroup[] = departments.map((dept, i) => ({
                department: dept,
                activities: activitiesPerDept[i],
              }));
              this.deptActivityGroups.set(groups);
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
          });
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.getRawValue();

    const request$ = this.isEditMode()
      ? this.positionService.updatePosition(this.data!.id, {
          name: payload.name,
          code: payload.code,
          description: payload.description,
        })
      : this.positionService.addPosition(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.isSaving.set(false);
        this.dialogRef.close(result);
      },
      error: () => this.isSaving.set(false),
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }
}
