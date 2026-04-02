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
import { ActivityService } from '../activity.service';
import { DepartmentService } from '../../department/department.service';
import { AuthService } from '@core/authentication';
import { Activity } from '../activity.model';
import { Department } from '../../department/department.model';

@Component({
  selector: 'app-activity-form-modal',
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
  templateUrl: './activity-form-modal.html',
  styleUrls: ['./activity-form-modal.scss'],
})
export class ActivityFormModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activityService = inject(ActivityService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<ActivityFormModal>);

  // Données passées depuis le parent (null = création, Activity = édition)
  readonly data: Activity | null = inject(MAT_DIALOG_DATA, { optional: true }) ?? null;

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly departments = signal<Department[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  readonly isEditMode = computed(() => !!this.data?.id);
  readonly dialogTitle = computed(() => (this.isEditMode() ? 'edit_activity' : 'add_activity'));

  // ── Form ───────────────────────────────────────────────────────────────────
  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.loadDepartments();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2)]],
      code: [this.data?.code ?? '', [Validators.required]],
      description: [this.data?.description ?? '', []],
      departmentId: [this.data?.departmentId ?? null, [Validators.required]],
    });

    // En mode édition, le département ne peut pas être changé (optionnel selon besoin)
    // if (this.isEditMode()) this.form.get('departmentId')?.disable();
  }

  private loadDepartments(): void {
    const companyId = this.authService.companyId;
    if (!companyId) return;

    this.isLoading.set(true);
    this.departmentService
      .getDepartments(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: depts => {
          this.departments.set(depts);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
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
      ? this.activityService.updateActivity(this.data!.id, {
          name: payload.name,
          code: payload.code,
          description: payload.description,
          // le departmentId n'est pas envoyé en update selon votre API
        })
      : this.activityService.addActivity(payload);

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

  // Helpers d'accès rapide aux erreurs dans le template
  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }
}
