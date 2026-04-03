import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';

import { NotificationService } from '@core';
import { AddCompanyDialogComponent } from './add-company-dialog/add-company-dialog';
import { Company, CompanyService } from './company.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-company',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatDialogModule,
    TranslateModule,
  ],
  templateUrl: './company.html',
  styleUrl: './company.scss',
})
export class CompanyComponent {
  private readonly companyService = inject(CompanyService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  displayedColumns: string[] = [
    'enabled',
    'id',
    'code',
    'name',
    'domain',
    'email',
    'phone',
    'action',
  ];
  dataSource = new MatTableDataSource<Company>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadCompanies();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (company, filter) => {
      const term = filter.trim().toLowerCase();
      return [company.name, company.code, company.domain, company.email, company.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddCompanyModal() {
    const dialogRef = this.dialog.open(AddCompanyDialogComponent, {
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      const data = this.dataSource.data;
      data.push(result as Company);
      this.dataSource.data = [...data];
      this.notify.success('Societe creee avec succes');
    });
  }

  openCompanyDetails(id: number) {
    this.router.navigate(['/settings/company', id]);
  }

  private loadCompanies() {
    this.isLoading = true;
    this.companyService
      .getCompanies()
      .pipe(
        catchError(error => {
          this.notify.error(
            this.notify.getErrorMessage(error, 'Impossible de charger les societes')
          );
          return of([]);
        })
      )
      .subscribe(companies => {
        this.dataSource.data = companies;
        this.isLoading = false;
      });
  }
}
