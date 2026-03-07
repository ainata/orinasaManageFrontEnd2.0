import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { NotificationService } from '@core';
import { CompanyService, CreateCompanyPayload } from '../company.service';

@Component({
  selector: 'app-add-company-dialog',
  templateUrl: './add-company-dialog.html',
  styleUrls: ['./add-company-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
})
export class AddCompanyDialogComponent implements OnInit {
  companyForm!: FormGroup;
  isSubmitting = false;

  private readonly formBuilder = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly dialogRef = inject(MatDialogRef<AddCompanyDialogComponent>);
  private readonly notify = inject(NotificationService);

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.companyForm = this.formBuilder.group({
      domain: ['', Validators.required],
      code: ['', Validators.required],
      enabled: [true],
    });
  }

  onSubmit() {
    if (this.companyForm.invalid || this.isSubmitting) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload: CreateCompanyPayload = {
      domain: this.companyForm.value.domain,
      enabled: this.companyForm.value.enabled ?? true,
      code: this.companyForm.value.code,
    };

    this.companyService
      .createCompany(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: createdCompany => this.dialogRef.close(createdCompany),
        error: error => {
          this.notify.error(this.notify.getErrorMessage(error, 'Creation de la societe echouee'));
        },
      });
  }
}
