import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RoleService } from './role.service';
import { Role } from './role.model';

@Component({
  selector: 'app-role-form-dialog',
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
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data ? 'Modifier le rôle' : 'Ajouter un rôle' }}</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" subscriptSizing="fixed" class="form-field">
            <mat-label>Code</mat-label>
            <input matInput formControlName="name" required placeholder="ex: ADMIN" />
            <mat-icon matPrefix>code</mat-icon>
            <mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'validation.required' | translate }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="fixed" class="form-field">
            <mat-label>Nom affiché</mat-label>
            <input matInput formControlName="displayName" required placeholder="ex: Administrateur" />
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="form.get('displayName')?.hasError('required')">{{ 'validation.required' | translate }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="fixed" class="form-field col-span-2">
            <mat-label>Route par défaut</mat-label>
            <input matInput formControlName="defaultRoute" placeholder="ex: /dashboard" />
            <mat-icon matPrefix>home</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field col-span-2">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-footer">
        <button mat-stroked-button mat-dialog-close [disabled]="isSaving">{{ 'cancel' | translate }}</button>
        <button mat-flat-button color="accent" [disabled]="form.invalid || isSaving" (click)="save()">
          {{ (data ? 'edit' : 'add') | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px;
    }
    .col-span-2 {
      grid-column: span 2;
    }
    .form-field {
      width: 100%;
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .col-span-2 {
        grid-column: span 1;
      }
    }
  `]
})
export class RoleFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly dialogRef = inject(MatDialogRef<RoleFormDialogComponent>);

  form!: FormGroup;
  isSaving = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Role | null) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data?.name || '', [Validators.required]],
      displayName: [this.data?.displayName || '', [Validators.required]],
      description: [this.data?.description || ''],
      defaultRoute: [this.data?.defaultRoute || '/'],
    });
  }

  save() {
    if (this.form.invalid) return;

    this.isSaving = true;
    const roleValue = this.form.value;

    if (this.data) {
      this.roleService.updateRole(this.data.id!, roleValue).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: () => (this.isSaving = false),
      });
    } else {
      this.roleService.createRole(roleValue).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: () => (this.isSaving = false),
      });
    }
  }
}
