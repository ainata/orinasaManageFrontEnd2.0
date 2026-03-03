import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { PageHeader } from '@shared';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AddCompanyDialog } from './add-company-dialog/add-company-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
}

const MOCK_DATA: Company[] = [
  {
    id: 1,
    name: 'TechNova',
    email: 'contact@technova.com',
    phone: '+261 34 12 345 67',
    city: 'Antananarivo',
  },
  {
    id: 2,
    name: 'GreenSoft',
    email: 'info@greensoft.io',
    phone: '+261 33 98 765 43',
    city: 'Toamasina',
  },
  {
    id: 3,
    name: 'BlueOcean',
    email: 'hello@blueocean.mg',
    phone: '+261 32 45 123 89',
    city: 'Mahajanga',
  },
  {
    id: 4,
    name: 'SmartBuild',
    email: 'admin@smartbuild.mg',
    phone: '+261 34 77 888 22',
    city: 'Fianarantsoa',
  },
];

@Component({
  selector: 'app-company',
  imports: [
    PageHeader,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatPaginator,
    MatDialogModule,
  ],
  templateUrl: './company.html',
  styleUrl: './company.scss',
})
export class CompanyComponent {
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'city'];
  dataSource = new MatTableDataSource(MOCK_DATA);

  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddCompanyModal() {
    const dialogRef = this.dialog.open(AddCompanyDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajouter le nouveau company à ton dataSource
        const data = this.dataSource.data;
        const newId = data.length ? Math.max(...data.map(c => c.id)) + 1 : 1;
        data.push({ id: newId, ...result });
        this.dataSource.data = [...data]; // update table
      }
    });
  }
}
