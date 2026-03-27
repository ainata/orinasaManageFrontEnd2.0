import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../department.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, NotificationService } from '@core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-department-form-modal',
  imports: [
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './department-form-modal.html',
  styleUrl: './department-form-modal.scss',
})
export class DepartmentFormModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DepartmentFormModal>);
  private readonly departmentService = inject(DepartmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notify = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  isSubmitting = false;
  isEdit = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    description: [''],
    companyId: [this.authService.companyId],
  });

  ngOnInit(): void {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue(this.data);
    }
  }

  save() {
    this.isSubmitting = true;
    const rawValue = this.form.getRawValue();

    const request$ = this.isEdit
      ? this.departmentService.updateDepartment(this.data.id, rawValue)
      : this.departmentService.addDepartment(rawValue);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap({
          next: () => {
            this.dialogRef.close(true);
            this.notify.success(
              this.isEdit ? 'Modification réussie' : 'Ajout avec succès',
              'Department'
            );
            this.isSubmitting = false;
          },
          error: error => {
            console.log(error);

            this.isSubmitting = false;
            this.notify.error(error.message, 'Department');
          },
        })
      )
      .subscribe();
  }
}
