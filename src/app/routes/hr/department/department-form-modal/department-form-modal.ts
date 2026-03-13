import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-department-form-modal',
  imports: [],
  templateUrl: './department-form-modal.html',
  styleUrl: './department-form-modal.scss',
})
export class DepartmentFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DepartmentFormModal>);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    description: [''],
  });

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
