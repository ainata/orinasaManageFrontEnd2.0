import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DepartmentService } from '../department.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeader } from '@shared';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Department } from '../department.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DepartmentFormModal } from '../department-form-modal/department-form-modal';
import { AuthService } from '@core/authentication';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageHeader,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './department-list.html',
  styleUrls: ['./department-list.scss'],
})
export class DepartmentList implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  dataSource = new MatTableDataSource<Department>();
  displayedColumns: string[] = ['id', 'name', 'code', 'description', 'actions'];

  ngOnInit(): void {
    this.getDepartments();
  }

  getDepartments() {
    const companyId = this.authService.companyId;
    if (companyId) {
      this.departmentService
        .getDepartments(companyId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(departments => {
          this.dataSource.data = departments;
        });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addDepartment() {
    const dialogRef = this.dialog.open(DepartmentFormModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDepartments();
      }
    });
  }

  edit(id: number) {
    const dialogRef = this.dialog.open(DepartmentFormModal, {
      data: this.dataSource.data.find(department => department.id === id),
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDepartments();
      }
    });
  }

  delete(id: number) {
    this.departmentService
      .deleteDepartment(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getDepartments();
      });
  }
}
