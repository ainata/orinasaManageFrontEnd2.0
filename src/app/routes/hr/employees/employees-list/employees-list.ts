import { Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { EmployeesService } from '../employees.service';
import { Employee, SearchPayload, SliceRequest, SortRequest } from '../employees.model';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './employees-list.html',
  styleUrls: ['./employees-list.scss'],
})
export class EmployeesList implements OnInit, AfterViewInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns: string[] = ['employeeCode', 'name', 'email', 'department', 'position', 'enabled', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);

  // Signaux pour la détection de changement en mode zoneless
  readonly totalElements = signal<number>(0);
  readonly isLoading = signal<boolean>(true);

  // Pagination & Sorting state
  slice: SliceRequest = { page: 1, size: 10 };
  sortData: SortRequest = { property: 'name', direction: 'ASC' };

  // Search state
  keyword = '';
  searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.keyword = value;
      this.slice.page = 1; // Reset to first page (1-based)
      if (this.paginator) this.paginator.pageIndex = 0;
      this.loadData();
    });

    this.loadData();
  }

  ngAfterViewInit() {
    this.sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sortState: Sort) => {
      this.sortData = {
        property: sortState.active,
        direction: sortState.direction === 'desc' ? 'DESC' : 'ASC',
      };
      this.loadData();
    });
  }

  loadData() {
    this.isLoading.set(true);
    const payload: SearchPayload = {
      slice: this.slice,
      // sort: this.sortData, // TODO: réactiver quand la structure du DTO Java sera confirmée
      search: this.keyword ? { keyword: this.keyword, fields: ['name', 'email', 'code'] } : undefined,
    };

    this.employeesService.search(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res && res.data !== undefined) {
            this.dataSource.data = res.data;
            this.totalElements.set(res.summary?.filteredCount ?? 0);
          } else {
            this.dataSource.data = [];
            this.totalElements.set(0);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent) {
    // Angular Paginator est 0-based, le backend Spring est 1-based → +1
    this.slice = { page: event.pageIndex + 1, size: event.pageSize };
    this.loadData();
  }

  applySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  toggleStatus(employee: Employee, event: any) {
    const newStatus = event.checked;
    this.employeesService.updateStatus(employee.id, newStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          employee.enabled = newStatus;
        },
        error: () => {
          event.source.checked = employee.enabled;
        }
      });
  }
}
