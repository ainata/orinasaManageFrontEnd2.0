import { V } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

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

  private formBuilder = inject(FormBuilder);

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

  onSubmit() {}
}
